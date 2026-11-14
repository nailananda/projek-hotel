import { NextResponse } from "next/server";
import { canAccess, getHomePathForRole, ROLES } from "@/lib/rbac";
import { verifySession } from "@/lib/session";

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("nara_session")?.value;
  const session = token ? await verifySession(token) : null;

  if (pathname === "/login" || pathname === "/register") {
    if (session) {
      const destination = ROLES.includes(session.role)
        ? getHomePathForRole(session.role)
        : "/403";
      return NextResponse.redirect(new URL(destination, request.url));
    }

    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!ROLES.includes(session.role) || !canAccess(pathname, session.role)) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/resepsionis/:path*",
    "/housekeeping/:path*",
    "/reservasi/:path*",
    "/test-db",
    "/login",
    "/register",
  ],
};
