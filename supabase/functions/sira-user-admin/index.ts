import { createClient } from "npm:@supabase/supabase-js@2.118.0";

// Browsers may call this function only from the SIRA web app. The Android app
// does not send an Origin header, so CORS does not affect it.
const ALLOWED_ORIGINS = (
  Deno.env.get("SIRA_ALLOWED_ORIGINS") ?? "https://sira-web-iota.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function corsHeadersFor(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)
      ? origin
      : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 12 characters, include an uppercase letter, a lowercase letter, a number and a special character, and must not contain your email name.";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Supabase function environment is not configured.");
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

type RequestBody = {
  action?: string;
  userId?: string;
  signupEnabled?: boolean;
  email?: string;
  password?: string;
  currentPassword?: string;
  captchaToken?: string;
  fullName?: string;
  company?: string;
  mobileNumber?: string;
  role?: string;
  jobTitle?: string;
};

// Errors whose message is safe to show to the caller. Anything else is logged
// on the server and answered with a generic message.
class PublicError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const AUTH_REQUIRED = () => new PublicError("Authentication required.", 401);
const ADMIN_REQUIRED = () => new PublicError("Administrator access required.", 403);

// Supabase Auth error codes whose messages help an administrator and reveal
// nothing sensitive.
const SAFE_AUTH_ERROR_CODES = new Set([
  "email_exists",
  "user_already_exists",
  "email_address_invalid",
  "weak_password",
  "same_password",
]);

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeadersFor(req),
      "Content-Type": "application/json",
    },
  });
}

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function isStrongPassword(password: string, email?: string) {
  const localPart = normalizeEmail(email).split("@", 1)[0];
  const containsIdentity =
    localPart.length >= 3 && password.toLowerCase().includes(localPart);

  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password) &&
    !containsIdentity
  );
}

function validateProfile(body: RequestBody) {
  const email = normalizeEmail(body.email);
  const fullName = clean(body.fullName);
  const company = clean(body.company);
  const mobileNumber = clean(body.mobileNumber);
  const jobTitle = clean(body.jobTitle);
  const role = clean(body.role) || jobTitle || "Field Engineer";

  if (!email || !email.includes("@")) {
    throw new PublicError("A valid email address is required.");
  }

  if (!fullName || !company || !mobileNumber || !jobTitle) {
    throw new PublicError(
      "Full name, company, mobile number and job title are required."
    );
  }

  return {
    email,
    fullName,
    company,
    mobileNumber,
    jobTitle,
    role,
  };
}

async function getAuthenticatedUser(req: Request) {
  const authorization = req.headers.get("Authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();

  if (!token) throw AUTH_REQUIRED();

  const {
    data: { user },
    error,
  } = await admin.auth.getUser(token);

  if (error || !user) throw AUTH_REQUIRED();

  return user;
}

// Administrators are identified by user id (sira_admins.user_id), never by
// email address, so registering an address cannot grant admin rights.
async function isAdministrator(userId: string) {
  const { data, error } = await admin
    .from("sira_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function requireAdministrator(req: Request) {
  const user = await getAuthenticatedUser(req);

  if (!(await isAdministrator(user.id))) throw ADMIN_REQUIRED();

  return user;
}

async function writeProfile(
  userId: string,
  profile: ReturnType<typeof validateProfile>
) {
  const { error } = await admin.from("sira_user_profiles").upsert(
    {
      id: userId,
      full_name: profile.fullName,
      company: profile.company,
      mobile_number: profile.mobileNumber,
      role: profile.role,
      job_title: profile.jobTitle,
      username: profile.email,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) throw error;
}

// Self sign-up is open to anyone with the app, so the hCaptcha token is
// checked here on the server. Without HCAPTCHA_SECRET, sign-up is refused.
async function verifyCaptcha(token: string) {
  const secret = Deno.env.get("HCAPTCHA_SECRET");

  if (!secret) {
    console.error("HCAPTCHA_SECRET is not set; self sign-up refused.");
    throw new PublicError("Sign-up is temporarily unavailable. Please try again later.", 503);
  }

  if (!token) throw new PublicError("Please complete the security check.");

  const response = await fetch("https://api.hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });
  const result = await response.json().catch(() => null);

  if (!result?.success) {
    throw new PublicError("Security check failed. Please try again.");
  }
}

// Self sign-up: the user chooses their own password. Administrator-created
// accounts get a temporary password that must be replaced at first sign-in.
async function createAccount(body: RequestBody, selfSignup: boolean) {
  const profile = validateProfile(body);
  const password = String(body.password ?? "");

  if (!isStrongPassword(password, profile.email)) {
    throw new PublicError(PASSWORD_POLICY_MESSAGE);
  }

  // Anyone may sign up on their own; the hCaptcha check stops automated
  // mass account creation.
  if (selfSignup) {
    await verifyCaptcha(clean(body.captchaToken));
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: profile.email,
    password,
    email_confirm: true,
    app_metadata: { must_change_password: !selfSignup },
    user_metadata: {
      full_name: profile.fullName,
      company: profile.company,
      mobile_number: profile.mobileNumber,
      role: profile.role,
      job_title: profile.jobTitle,
      username: profile.email,
    },
  });

  if (error || !data.user) {
    // Self sign-up never reveals whether an address is already registered.
    if (selfSignup) {
      if (error) console.error("Self sign-up failed:", error);
      throw new PublicError("Account could not be created. Check the details and try again.");
    }
    throw error ?? new Error("Account could not be created.");
  }

  try {
    await writeProfile(data.user.id, profile);
  } catch (profileError) {
    await admin.auth.admin.deleteUser(data.user.id, false);
    throw profileError;
  }

  return data.user.id;
}

async function listAllAuthUsers() {
  const users = [];
  let page = 1;
  const perPage = 1000;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) throw error;

    users.push(...data.users);

    if (data.users.length < perPage) break;
    page += 1;
  }

  return users;
}

async function listAllProfiles() {
  const profiles = [];
  const pageSize = 1000;
  let from = 0;

  while (from < 10000) {
    const { data, error } = await admin
      .from("sira_user_profiles")
      .select(
        "id,full_name,company,mobile_number,role,job_title,username,created_at,updated_at"
      )
      .range(from, from + pageSize - 1);

    if (error) throw error;

    const rows = data ?? [];
    profiles.push(...rows);

    if (rows.length < pageSize) break;
    from += pageSize;
  }

  return profiles;
}

async function changeOwnPassword(req: Request, body: RequestBody) {
  const user = await getAuthenticatedUser(req);
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.password ?? "");

  if (!currentPassword) throw new PublicError("Current password is required.");

  if (!isStrongPassword(newPassword, user.email)) {
    throw new PublicError(PASSWORD_POLICY_MESSAGE);
  }

  if (newPassword === currentPassword) {
    throw new PublicError("The new password must be different from the current one.");
  }

  // Checked in the database. Failures count towards the same 5-attempt /
  // 15-minute lockout as sign-in.
  const { data: check, error: checkError } = await admin.rpc(
    "sira_check_user_password",
    { p_user_id: user.id, p_password: currentPassword }
  );

  if (checkError) throw checkError;

  if (check === "locked") {
    throw new PublicError("Too many failed attempts. Try again in 15 minutes.", 429);
  }

  if (check !== "ok") throw new PublicError("Current password is incorrect.");

  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    password: newPassword,
    app_metadata: {
      ...(user.app_metadata ?? {}),
      must_change_password: false,
    },
  });

  if (updateError) throw updateError;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeadersFor(req) });
  }

  if (req.method !== "POST") {
    return json(req, { message: "Method not allowed." }, 405);
  }

  try {
    const body = (await req.json()) as RequestBody;
    const action = clean(body.action);

    // Sign-up is always open.
    if (action === "status") {
      return json(req, {
        signupEnabled: true,
        passwordPolicy: {
          minLength: PASSWORD_MIN_LENGTH,
          requiresUppercase: true,
          requiresLowercase: true,
          requiresNumber: true,
          requiresSpecial: true,
        },
      });
    }

    if (action === "signup") {
      await createAccount(body, true);
      return json(req, { ok: true, message: "Account created successfully." });
    }

    if (action === "change-password") {
      await changeOwnPassword(req, body);
      return json(req, { ok: true });
    }

    if (action === "admin-status") {
      const user = await getAuthenticatedUser(req);

      return json(req, {
        isAdmin: await isAdministrator(user.id),
        signupEnabled: true,
      });
    }

    const administrator = await requireAdministrator(req);

    if (action === "set-signup") {
      if (typeof body.signupEnabled !== "boolean") {
        throw new PublicError("A valid sign-up setting is required.");
      }

      const { error } = await admin.from("sira_app_settings").upsert(
        {
          id: 1,
          signup_enabled: body.signupEnabled,
          updated_at: new Date().toISOString(),
          updated_by: administrator.id,
        },
        { onConflict: "id" }
      );

      if (error) throw error;

      return json(req, { ok: true, signupEnabled: body.signupEnabled });
    }

    if (action === "create-user") {
      const userId = await createAccount(body, false);
      return json(req, { ok: true, userId });
    }

    if (action === "list-users") {
      const [authUsers, profiles] = await Promise.all([
        listAllAuthUsers(),
        listAllProfiles(),
      ]);

      const profileById = new Map(
        profiles.map((profile) => [String(profile.id), profile])
      );

      const users = authUsers
        .map((user) => {
          const profile = profileById.get(user.id);

          return {
            id: user.id,
            email: normalizeEmail(user.email),
            emailConfirmedAt: user.email_confirmed_at ?? null,
            createdAt: user.created_at ?? null,
            fullName: clean(profile?.full_name ?? user.user_metadata?.full_name),
            company: clean(profile?.company ?? user.user_metadata?.company),
            mobileNumber: clean(
              profile?.mobile_number ?? user.user_metadata?.mobile_number
            ),
            role: clean(profile?.role ?? user.user_metadata?.role),
            jobTitle: clean(
              profile?.job_title ?? user.user_metadata?.job_title
            ),
          };
        })
        .filter((user) => user.email)
        .sort((a, b) =>
          (a.fullName || a.email).localeCompare(b.fullName || b.email)
        );

      return json(req, { users });
    }

    if (action === "update-user") {
      const userId = clean(body.userId);
      if (!userId) throw new PublicError("User ID is required.");

      const profile = validateProfile(body);
      const password = String(body.password ?? "");

      if (password && !isStrongPassword(password, profile.email)) {
        throw new PublicError(PASSWORD_POLICY_MESSAGE);
      }

      const {
        data: { user: targetUser },
        error: targetError,
      } = await admin.auth.admin.getUserById(userId);

      if (targetError || !targetUser) {
        throw new PublicError("User was not found.", 404);
      }

      const attributes: any = {
        email: profile.email,
        email_confirm: true,
        user_metadata: {
          ...(targetUser.user_metadata ?? {}),
          full_name: profile.fullName,
          company: profile.company,
          mobile_number: profile.mobileNumber,
          role: profile.role,
          job_title: profile.jobTitle,
          username: profile.email,
        },
      };

      if (password) {
        // An administrator-set password is temporary for the user.
        attributes.password = password;
        attributes.app_metadata = {
          ...(targetUser.app_metadata ?? {}),
          must_change_password: true,
        };
      }

      const { error: updateError } =
        await admin.auth.admin.updateUserById(userId, attributes);

      if (updateError) throw updateError;

      await writeProfile(userId, profile);

      return json(req, { ok: true });
    }

    if (action === "delete-user") {
      const userId = clean(body.userId);
      if (!userId) throw new PublicError("User ID is required.");

      if (userId === administrator.id) {
        throw new PublicError("You cannot delete your own administrator account.");
      }

      const {
        data: { user: targetUser },
        error: targetError,
      } = await admin.auth.admin.getUserById(userId);

      if (targetError || !targetUser) {
        throw new PublicError("User was not found.", 404);
      }

      if (await isAdministrator(targetUser.id)) {
        throw new PublicError("Administrator accounts cannot be deleted here.");
      }

      const { error: profileDeleteError } = await admin
        .from("sira_user_profiles")
        .delete()
        .eq("id", userId);

      if (profileDeleteError) throw profileDeleteError;

      const { error: deleteError } = await admin.auth.admin.deleteUser(
        userId,
        false
      );

      if (deleteError) throw deleteError;

      return json(req, { ok: true });
    }

    return json(req, { message: "Unknown action." }, 400);
  } catch (error) {
    if (error instanceof PublicError) {
      return json(req, { ok: false, message: error.message }, error.status);
    }

    const code = String((error as { code?: unknown } | null)?.code ?? "");
    if (SAFE_AUTH_ERROR_CODES.has(code) && error instanceof Error) {
      return json(req, { ok: false, message: error.message }, 400);
    }

    console.error("sira-user-admin request failed:", error);
    return json(req, { ok: false, message: "Request failed. Please try again." }, 400);
  }
});
