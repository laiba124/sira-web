// Edge Functions return { message } with a non-2xx status for rejected
// requests. supabase-js only exposes a generic error, so read the body.
export async function getFunctionErrorMessage(error: unknown): Promise<string | null> {
  const context = (error as { context?: unknown } | null)?.context;

  if (!(context instanceof Response)) return null;

  try {
    const body = await context.clone().json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    return message || null;
  } catch {
    return null;
  }
}
