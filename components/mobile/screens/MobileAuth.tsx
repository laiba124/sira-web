"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import HCaptcha, { CAPTCHA_SITE_KEY, type HCaptchaHandle } from "@/components/HCaptcha";
import Icon from "@/components/mobile/Icon";
import { getFunctionErrorMessage } from "@/lib/functionError";
import { isStrongPassword, PASSWORD_POLICY_TEXT } from "@/lib/passwordPolicy";
import { supabase } from "@/lib/supabase";

// Shared with the desktop login so the lockout counts the same attempts.
const LOCK_KEY = "sira-web-login-lock";

export function MobileLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptchaHandle>(null);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const now = Date.now();
    let lock = { attempts: 0, lockedUntil: 0 };
    try {
      lock = { ...lock, ...JSON.parse(localStorage.getItem(LOCK_KEY) || "{}") };
    } catch {}
    if (lock.lockedUntil > now) {
      setMessage(`Too many failed attempts. Try again in ${Math.ceil((lock.lockedUntil - now) / 60000)} minute(s).`);
      return;
    }
    if (!email.trim() || !password) {
      setMessage("Enter your email address and password.");
      return;
    }
    if (CAPTCHA_SITE_KEY && !captchaToken) {
      setMessage("Complete the security check.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
      options: captchaToken ? { captchaToken } : undefined,
    });
    setBusy(false);
    // Each token is single use, so a new check is needed for the next attempt.
    if (CAPTCHA_SITE_KEY) captchaRef.current?.reset();
    if (error) {
      if (error.code === "captcha_failed") return setMessage("Security check failed. Please try again.");
      if (error.status === 429) return setMessage("Too many login attempts. Please wait a few minutes and try again.");
      const attempts = (lock.attempts || 0) + 1;
      const lockedUntil = attempts >= 5 ? Date.now() + 15 * 60 * 1000 : 0;
      try {
        localStorage.setItem(LOCK_KEY, JSON.stringify({ attempts, lockedUntil }));
      } catch {}
      setMessage(lockedUntil ? "Login temporarily locked for 15 minutes." : `Invalid email or password. ${5 - attempts} attempt(s) remaining.`);
      return;
    }
    try {
      localStorage.removeItem(LOCK_KEY);
    } catch {}
    router.replace("/incidents");
  }

  return (
    <div className="m-auth">
      <div className="m-auth-content">
        <div className="m-auth-header">
          <h1>SIRA</h1>
          <p>Smart Incident Reporting Application</p>
          <span>Fiber Risk Field Monitoring</span>
        </div>

        <form className="m-auth-card" onSubmit={login}>
          <h2>Secure Login</h2>
          <p className="m-auth-card-sub">Use your registered email address and password.</p>

          {message ? <div className="m-error">{message}</div> : null}

          <label className="m-auth-input">
            <Icon name="mail" size={22} color="#64748b" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="email"
              enterKeyHint="next"
            />
          </label>

          <label className="m-auth-input">
            <Icon name="lock" size={22} color="#64748b" />
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              enterKeyHint="done"
            />
            <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((v) => !v)}>
              <Icon name={show ? "eyeOff" : "eye"} size={22} color="#64748b" />
            </button>
          </label>

          {CAPTCHA_SITE_KEY ? (
            <div className="m-auth-captcha">
              <HCaptcha ref={captchaRef} onToken={setCaptchaToken} onError={setMessage} />
            </div>
          ) : null}

          <button type="submit" className="m-auth-btn" disabled={busy || (!!CAPTCHA_SITE_KEY && !captchaToken)}>
            {busy ? (
              <span className="m-spin-sm" />
            ) : (
              <>
                <Icon name="login" size={22} color="#ffffff" />
                Login
              </>
            )}
          </button>

          <p className="m-auth-switch">
            Need an account? <Link href="/signup">Create account</Link>
          </p>

          <div className="m-admin-note">
            <Icon name="shield" size={19} color="#0f766e" />
            <span>New accounts are created only by the SIRA administrator.</span>
          </div>
        </form>

        <p className="m-auth-footer">Secure field incident reporting</p>
      </div>
    </div>
  );
}

export function MobileSignup() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", company: "Zong", mobileNumber: "", jobTitle: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [show, setShow] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptchaHandle>(null);

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (Object.entries(form).some(([, v]) => !v.trim())) return setMsg("Complete all profile fields.");
    if (!isStrongPassword(form.password)) return setMsg(PASSWORD_POLICY_TEXT);
    if (form.password !== form.confirm) return setMsg("Passwords do not match.");
    if (!captchaToken) return setMsg("Complete the security check.");
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("sira-user-admin", {
      body: {
        action: "signup",
        email: form.email.trim().toLowerCase(),
        password: form.password,
        fullName: form.fullName.trim(),
        company: form.company.trim(),
        mobileNumber: form.mobileNumber.trim(),
        jobTitle: form.jobTitle.trim(),
        role: form.jobTitle.trim(),
        captchaToken,
      },
    });
    setBusy(false);
    setCaptchaToken(null);
    captchaRef.current?.reset();
    if (error || !data?.ok) {
      setMsg(data?.message || (await getFunctionErrorMessage(error)) || error?.message || "Account could not be created.");
      return;
    }
    setOk(true);
    setMsg("Account created successfully. You can now sign in.");
    setTimeout(() => router.replace("/auth"), 1000);
  }

  const type = show ? "text" : "password";

  return (
    <div className="m-auth">
      <div className="m-auth-content">
        <div className="m-auth-header is-small">
          <h1>SIRA</h1>
          <p>Create your SIRA account</p>
        </div>

        <form className="m-auth-card" onSubmit={submit}>
          <h2>Create account</h2>
          <p className="m-auth-card-sub">Complete all profile fields.</p>

          {msg ? <div className={ok ? "m-success" : "m-error"}>{msg}</div> : null}

          <Field icon="person" placeholder="Full name" value={form.fullName} onChange={(v) => set("fullName", v)} autoComplete="name" />
          <Field icon="mail" placeholder="Email address" type="email" value={form.email} onChange={(v) => set("email", v)} autoComplete="email" />
          <Field icon="business" placeholder="Company" value={form.company} onChange={(v) => set("company", v)} />
          <Field icon="call" placeholder="Mobile number" type="tel" value={form.mobileNumber} onChange={(v) => set("mobileNumber", v)} autoComplete="tel" />
          <Field icon="briefcase" placeholder="Job title" value={form.jobTitle} onChange={(v) => set("jobTitle", v)} />
          <Field icon="lock" placeholder="Password" type={type} value={form.password} onChange={(v) => set("password", v)} autoComplete="new-password" />
          <Field icon="lock" placeholder="Confirm password" type={type} value={form.confirm} onChange={(v) => set("confirm", v)} autoComplete="new-password" />
          <label className="m-check">
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords
          </label>
          <p className="m-auth-policy">{PASSWORD_POLICY_TEXT}</p>

          {CAPTCHA_SITE_KEY ? (
            <div className="m-auth-captcha">
              <HCaptcha ref={captchaRef} onToken={setCaptchaToken} onError={setMsg} />
            </div>
          ) : null}

          <button type="submit" className="m-auth-btn" disabled={busy || !captchaToken}>
            {busy ? <span className="m-spin-sm" /> : "Create account"}
          </button>

          <p className="m-auth-switch">
            <Link href="/auth">Back to login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="m-auth-input">
      <Icon name={icon} size={22} color="#64748b" />
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} />
    </label>
  );
}
