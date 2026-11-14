
import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/authorization";

export async function GET() {
  try {
    const auth = await requireRole("/api/resepsionis/payments");
    if (auth.error) return auth.error;

    const payments = await prisma.reservation.findMany({
      where: {
        paymentStatus: "MENUNGGU_KONFIRMASI",
      },
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
      data: payments.map((payment) => ({
        id: payment.id,
        bookingCode: payment.bookingCode,
        paymentStatus: payment.paymentStatus,
        paymentMethod: payment.paymentMethod,
        paymentProof: payment.paymentProof,
        totalPrice: Number(payment.totalPrice),
        checkIn: payment.checkIn,
        checkOut: payment.checkOut,
        guests: payment.guests,
        createdAt: payment.createdAt,
        guest: {
          id: payment.user.id,
          name: payment.user.name,
          email: payment.user.email,
        },
        room: {
          id: payment.room.id,
          roomNumber: payment.room.roomNumber,
          roomType: payment.room.roomType.name,
        },
      })),
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error("Get pending payments error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil daftar pembayaran.",
      },
      { status: 500 }
    );
  }
}
