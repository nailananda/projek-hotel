
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/authorization";

export async function PATCH(request, { params }) {
  try {
    const auth = await requireRole(["HOUSEKEEPING", "ADMIN"]);
    if (auth.error) return auth.error;

    // 3. Validasi ID kamar
    const { id } = await params;
    const roomId = Number(id);

    if (!Number.isInteger(roomId) || roomId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID kamar tidak valid.",
        },
        { status: 400 }
      );
    }

    // 4. Periksa apakah kamar ditemukan
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
      select: {
        id: true,
        roomNumber: true,
        status: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        {
          success: false,
          message: "Kamar tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // 5. Pastikan kamar sedang menunggu pembersihan
    if (room.status !== "DIBERSIHKAN") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kamar hanya dapat diselesaikan jika statusnya DIBERSIHKAN.",
        },
        { status: 409 }
      );
    }

    // 6. Ubah status hanya jika masih DIBERSIHKAN
    const result = await prisma.room.updateMany({
      where: {
        id: roomId,
        status: "DIBERSIHKAN",
      },
      data: {
        status: "TERSEDIA",
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Status kamar sudah berubah. Muat ulang daftar kamar.",
        },
        { status: 409 }
      );
    }

    // 7. Kirim respons berhasil
    return NextResponse.json({
      success: true,
      message: `Kamar ${room.roomNumber} selesai dibersihkan dan sekarang tersedia.`,
      data: {
        id: room.id,
        roomNumber: room.roomNumber,
        status: "TERSEDIA",
      },
    });
  } catch (error) {
    console.error("Complete housekeeping error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menyelesaikan pembersihan kamar.",
      },
      { status: 500 }
    );
  }
}
