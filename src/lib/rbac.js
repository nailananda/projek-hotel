import { cookies } from "next/headers";

export const ROLES = Object.freeze([
  "TAMU",
  "RESEPSIONIS",
  "HOUSEKEEPING",
  "ADMIN",
]);

export const ROLE_ROUTE_ACCESS = Object.freeze({
  "/admin": ["ADMIN"],
  "/resepsionis": ["RESEPSIONIS"],
  "/housekeeping": ["HOUSEKEEPING"],
  "/reservasi": ["TAMU", "ADMIN"],
  "/test-db": ["ADMIN"],
  "/api/admin": ["ADMIN"],
  "/api/resepsionis": ["RESEPSIONIS"],
  "/api/housekeeping": ["HOUSEKEEPING"],
  "/api/reservations": ["TAMU", "ADMIN"],
});

function findRouteAccess(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const matchingPrefix = Object.keys(ROLE_ROUTE_ACCESS)
    .sort((left, right) => right.length - left.length)
    .find(
      (prefix) =>
        normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
    );

  return matchingPrefix ? ROLE_ROUTE_ACCESS[matchingPrefix] : null;
}

export function hasRole(userRole, allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (
    ROLES.includes(userRole) &&
    (userRole === "ADMIN" || roles.includes(userRole))
  );
}

export function canAccess(pathname, userRole) {
  const allowedRoles = findRouteAccess(pathname);
  return allowedRoles === null || hasRole(userRole, allowedRoles);
}

export function getHomePathForRole(role) {
  switch (role) {
    case "TAMU":
      return "/";
    case "RESEPSIONIS":
      return "/resepsionis";
    case "HOUSEKEEPING":
      return "/housekeeping";
    case "ADMIN":
      return "/admin";
    default:
      return "/403";
  }
}

async function getAuthenticatedUser() {
  const [{ default: prisma }, { verifySession }] = await Promise.all([
    import("@/lib/prisma"),
    import("@/lib/session"),
  ]);

  const token = (await cookies()).get("nara_session")?.value;
  if (!token) return null;

  const session = await verifySession(token);
  const userId = Number(session?.userId);
  if (!Number.isSafeInteger(userId) || userId <= 0) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function getCurrentUser() {
  return getAuthenticatedUser();
}

export async function requireUser(options = {}) {
  const user = await getAuthenticatedUser();
  if (user) return { user, error: null };

  const { NextResponse } = await import("next/server");
  return {
    user: null,
    error: NextResponse.json(
      {
        success: false,
        message:
          options.unauthenticatedMessage || "Silakan login terlebih dahulu.",
      },
      { status: 401 }
    ),
  };
}

export async function requireRole(pathname, options = {}) {
  if (typeof pathname !== "string" || findRouteAccess(pathname) === null) {
    throw new TypeError(`Route RBAC tidak terdaftar: ${pathname}`);
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    const { NextResponse } = await import("next/server");
    return {
      user: null,
      error: NextResponse.json(
        {
          success: false,
          message:
            options.invalidSessionMessage ||
            options.unauthenticatedMessage ||
            "Silakan login terlebih dahulu.",
        },
        { status: 401 }
      ),
    };
  }

  if (!canAccess(pathname, user.role)) {
    const { NextResponse } = await import("next/server");
    return {
      user: null,
      error: NextResponse.json(
        {
          success: false,
          message: options.forbiddenMessage || "Akses ditolak.",
        },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}
