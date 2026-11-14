
import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/authorization";

export async function GET() {
  try {
    const auth = await requireRole("/api/resepsionis/reservations", {
      forbiddenMessage: "Akses ditolak. Khusus resepsionis dan admin.",
    });
    if (auth.error) return auth.error;

    const reservations = await prisma.reservation.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        room: {
          include: {
            roomType: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: reservations.map((reservation) => ({
        id: reservation.id,
        bookingCode: reservation.bookingCode,
        status: reservation.status,

        // Data pembayaran
        paymentStatus: reservation.paymentStatus,
        paymentMethod: reservation.paymentMethod,
        paymentProof: reservation.paymentProof,
        paidAt: reservation.paidAt,

        // Data reservasi
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        guests: reservation.guests,
        totalPrice: Number(reservation.totalPrice),
        createdAt: reservation.createdAt,

        // Data tamu
        guest: {
          id: reservation.user.id,
          name: reservation.user.name,
          email: reservation.user.email,
        },

        // Data kamar
        room: {
          id: reservation.room.id,
          roomNumber: reservation.room.roomNumber,
          roomType: reservation.room.roomType.name,
        },
      })),
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error("Get receptionist reservations error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil seluruh data reservasi.",
      },
      { status: 500 }
    );
  }
}
