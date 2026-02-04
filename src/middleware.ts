import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "./i18n/routing";

const intlMiddleware = createMiddleware({
  locales: locales,
  defaultLocale,
  localePrefix: "as-needed",
  localeDetection: true,
  localeCookie: true
});

// Best-effort protection for client-visible routes.
// This does not replace server-side authorization.
const PROTECTED_PREFIXES = [
  "/account",
  "/orders",
  "/checkout",
  "/payment",
];

const localeArray = locales as readonly string[];

export function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const { pathname, searchParams } = new URL(request.url);
  const parts = pathname.split("/").filter(Boolean);

  // Detect locale prefix (lv/ru/en) if present.
  const maybeLocale = parts[0];
  const hasLocale = (locales as readonly string[]).includes(maybeLocale);
  const pathWithoutLocale = hasLocale ? `/${parts.slice(1).join("/")}` : pathname;

  const isProtected = PROTECTED_PREFIXES.some((p) =>
    pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );

  if (!isProtected) return response;

  // Cookie names you will likely use with Django:
  // - access (JWT access token)
  // - sessionid (Django session cookie)
  const hasAuthCookie =
    request.cookies.has("access") || request.cookies.has("sessionid");

  if (hasAuthCookie) return response;

  const locale = hasLocale ? maybeLocale : defaultLocale;
  const next = encodeURIComponent(pathWithoutLocale + (searchParams.toString() ? `?${searchParams}` : ""));
  return NextResponse.redirect(
    new URL(`/${locale}/auth/sign-in?next=${next}`, request.url)
  );
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};