
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/authorization";

export async function GET() {
  try {
    const auth = await requireRole(["HOUSEKEEPING", "ADMIN"]);
    if (auth.error) return auth.error;

    // 3. Ambil seluruh daftar kamar
    const rooms = await prisma.room.findMany({
      include: {
        roomType: true,
      },
      orderBy: {
        roomNumber: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Daftar kamar berhasil diambil.",
      data: rooms,
    });
  } catch (error) {
    console.error("Housekeeping rooms error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil daftar kamar.",
      },
      { status: 500 }
    );
  }
}
