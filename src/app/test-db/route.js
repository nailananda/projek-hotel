
import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/authorization";

export async function GET() {
  try {
    const auth = await requireRole("/test-db");
    if (auth.error) return auth.error;

    await prisma.$connect();

    const roomTypeCount = await prisma.roomType.count();

    return NextResponse.json({
      success: true,
      message: "Koneksi PostgreSQL berhasil!",
      jumlahTipeKamar: roomTypeCount,
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Koneksi database gagal.",
      },
      { status: 500 }
    );
  }
}
