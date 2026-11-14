import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/session";

export const USER_ROLES = [
  "TAMU",
  "RESEPSIONIS",
  "HOUSEKEEPING",
  "ADMIN",
];

const SESSION_COOKIE = "nara_session";

async function authorize(allowedRoles, options = {}) {
  if (
    allowedRoles &&
    (!Array.isArray(allowedRoles) ||
      allowedRoles.length === 0 ||
      allowedRoles.some((role) => !USER_ROLES.includes(role)))
  ) {
    throw new TypeError("Daftar role otorisasi tidak valid.");
  }

  const respond = (message, status) =>
    NextResponse.json({ success: false, message }, { status });
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return {
      user: null,
      error: respond(
        options.unauthenticatedMessage || "Silakan login terlebih dahulu.",
        401
      ),
    };
  }

  const session = await verifySession(token);
  const userId = Number(session?.userId);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return {
      user: null,
      error: respond(
        options.invalidSessionMessage || "Sesi login tidak valid.",
        401
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    return {
      user: null,
      error: respond(
        options.invalidSessionMessage || "Akun tidak ditemukan.",
        401
      ),
    };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      user: null,
      error: respond(options.forbiddenMessage || "Akses ditolak.", 403),
    };
  }

  return { user, error: null };
}

export function requireUser(options) {
  return authorize(null, options);
}

export function requireRole(allowedRoles, options) {
  return authorize(allowedRoles, options);
}
