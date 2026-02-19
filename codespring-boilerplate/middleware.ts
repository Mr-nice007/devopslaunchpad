import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: skip auth check here to avoid pulling in auth/db (edge-incompatible).
 * Protection is enforced in dashboard layout via auth() and redirect.
 */
const isProtectedRoute = (path: string) => path.startsWith("/dashboard");

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/whop/webhooks") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Redirect legacy Clerk auth paths to new Auth.js paths
  if (pathname === "/login" || pathname.startsWith("/login/")) {
    const loginUrl = new URL("/auth/login", req.url);
    const returnTo = req.nextUrl.searchParams.get("returnTo") ?? req.nextUrl.searchParams.get("redirect_url") ?? "/dashboard";
    loginUrl.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(loginUrl);
  }
  if (pathname === "/signup" || pathname.startsWith("/signup/")) {
    const signupUrl = new URL("/auth/signup", req.url);
    const returnTo = req.nextUrl.searchParams.get("returnTo") ?? req.nextUrl.searchParams.get("redirect_url") ?? "/dashboard";
    signupUrl.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(signupUrl);
  }

  // Optional: redirect to login if no session cookie on protected routes.
  // Session cookie name is next-auth.session-token (or __Secure- prefix in prod).
  const sessionCookie = req.cookies.get("next-auth.session-token") ?? req.cookies.get("__Secure-next-auth.session-token");
  if (isProtectedRoute(pathname) && !sessionCookie?.value) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
