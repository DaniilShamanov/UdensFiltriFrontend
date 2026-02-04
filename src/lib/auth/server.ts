import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Server-side, best-effort auth gate based on presence of auth cookies.
 * This is NOT a substitute for backend authorization.
 */
export function requireAuth(opts: {
  locale: string;
  next?: string;
}) {
  const store = cookies();
  const hasAuth = store.has("access") || store.has("sessionid");
  if (hasAuth) return;

  const next = encodeURIComponent(opts.next ?? "/");
  redirect(`/${opts.locale}/auth/sign-in?next=${next}`);
}
