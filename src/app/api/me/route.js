
import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { requireUser } from "@/lib/authorization";
import { getHomePathForRole } from "@/lib/rbac";

export async function GET() {
  try {
    const auth = await requireUser({
      unauthenticatedMessage: "Kamu belum login.",
      invalidSessionMessage: "Sesi login tidak valid atau sudah kedaluwarsa.",
    });
    if (auth.error) return auth.error;
    const { user } = auth;

    return NextResponse.json({
      success: true,
      message: "Sesi login valid.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        homePath: getHomePathForRole(user.role),
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error("Session check error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memeriksa sesi login.",
      },
      { status: 500 }
    );
  }
}
