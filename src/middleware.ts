import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection.
 *
 * The root layout previously guarded pages only on the client (by reading the
 * `auth_token` cookie). This middleware enforces auth on the server:
 *  - Unauthenticated users are redirected to /login (except for /login itself
 *    and the /api/auth endpoint).
 *  - Authenticated users hitting /login are bounced back to the dashboard.
 *
 * Note: this only checks for the *presence* of the session cookie. Role-based
 * gating (admin vs employee) is still handled in the UI via the Sidebar.
 */
const PUBLIC_PATHS = ["/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value;

  // Never gate the auth API or the login page itself.
  if (pathname.startsWith("/api/auth") || PUBLIC_PATHS.includes(pathname)) {
    if (token && pathname === "/login") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next.js internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|health).*)"],
};
