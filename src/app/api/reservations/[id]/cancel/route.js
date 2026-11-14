
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/authorization";

export async function PATCH(request, { params }) {
  try {
    const auth = await requireUser({
      invalidSessionMessage: "Sesi login tidak valid. Silakan login kembali.",
    });
    if (auth.error) return auth.error;
    const userId = auth.user.id;

    // 2. Ambil ID reservasi
    const { id } = await params;
    const reservationId = Number(id);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID reservasi tidak valid.",
        },
        { status: 400 }
      );
    }

    // 3. Pastikan reservasi milik pengguna yang login
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        userId,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        {
          success: false,
          message: "Reservasi tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // 4. Periksa apakah reservasi boleh dibatalkan
    if (
      !["MENUNGGU", "DIKONFIRMASI"].includes(reservation.status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Reservasi ini tidak dapat dibatalkan.",
        },
        { status: 409 }
      );
    }

    // 5. Ubah status reservasi secara aman
    const updated = await prisma.reservation.updateMany({
      where: {
        id: reservationId,
        userId,
        status: {
          in: ["MENUNGGU", "DIKONFIRMASI"],
        },
      },
      data: {
        status: "DIBATALKAN",
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Reservasi sudah berubah atau tidak dapat dibatalkan.",
        },
        { status: 409 }
      );
    }

    // 6. Kirim respons berhasil
    return NextResponse.json({
      success: true,
      message: "Reservasi berhasil dibatalkan.",
      data: {
        id: reservation.id,
        bookingCode: reservation.bookingCode,
        status: "DIBATALKAN",
      },
    });
  } catch (error) {
    console.error("Cancel reservation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat membatalkan reservasi.",
      },
      { status: 500 }
    );
  }
}
