
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/authorization";
import { queuePushNotification } from "@/lib/queue-push-notification";

// ============================================
// GET: Mengambil reservasi milik pengguna login
// ============================================
export async function GET() {
  try {
    const auth = await requireRole("/api/reservations", {
      invalidSessionMessage: "Sesi login tidak valid. Silakan login kembali.",
    });
    if (auth.error) return auth.error;

    const reservations = await prisma.reservation.findMany({
      where: {
        userId: auth.user.id,
      },
      include: {
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
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        guests: reservation.guests,
        totalPrice: Number(reservation.totalPrice),

        paymentStatus: reservation.paymentStatus,
        paymentMethod: reservation.paymentMethod,
        paymentProof: reservation.paymentProof,
        paidAt: reservation.paidAt,

        room: {
          id: reservation.room.id,
          roomNumber: reservation.room.roomNumber,
          roomType: reservation.room.roomType.name,
        },

        createdAt: reservation.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get reservations error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data reservasi.",
      },
      { status: 500 }
    );
  }
}

// ============================================
// POST: Membuat reservasi baru
// ============================================
export async function POST(request) {
  try {
    const auth = await requireRole("/api/reservations", {
      invalidSessionMessage: "Sesi login tidak valid. Silakan login kembali.",
    });
    if (auth.error) return auth.error;

    // 2. Ambil dan validasi data formulir
    const body = await request.json();

    const roomId = Number(body.roomId);
    const guests = Number(body.guests);

    if (
      !Number.isInteger(roomId) ||
      roomId <= 0 ||
      !Number.isInteger(guests) ||
      guests <= 0 ||
      typeof body.checkIn !== "string" ||
      typeof body.checkOut !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Data reservasi tidak lengkap atau tidak valid.",
        },
        { status: 400 }
      );
    }

    // 3. Validasi tanggal
    const startDate = new Date(
      `${body.checkIn.slice(0, 10)}T00:00:00.000Z`
    );

    const endDate = new Date(
      `${body.checkOut.slice(0, 10)}T00:00:00.000Z`
    );

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      startDate < today ||
      endDate <= startDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tanggal check-in harus hari ini atau setelahnya, dan check-out harus setelah check-in.",
        },
        { status: 400 }
      );
    }

    const user = auth.user;

    // 5. Periksa kamar
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
      include: {
        roomType: true,
      },
    });

    if (!room || room.status !== "TERSEDIA") {
      return NextResponse.json(
        {
          success: false,
          message: "Kamar tidak tersedia. Silakan pilih kamar lain.",
        },
        { status: 409 }
      );
    }

    if (guests > room.roomType.capacity) {
      return NextResponse.json(
        {
          success: false,
          message: `Kapasitas kamar maksimal ${room.roomType.capacity} tamu.`,
        },
        { status: 400 }
      );
    }

    // 6. Periksa bentrok jadwal
    const overlappingReservation =
      await prisma.reservation.findFirst({
        where: {
          roomId,
          status: {
            in: ["MENUNGGU", "DIKONFIRMASI", "CHECK_IN"],
          },
          checkIn: {
            lt: endDate,
          },
          checkOut: {
            gt: startDate,
          },
        },
      });

    if (overlappingReservation) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kamar sudah dipesan pada tanggal tersebut. Silakan pilih tanggal atau kamar lain.",
        },
        { status: 409 }
      );
    }

    // 7. Hitung biaya
    const nights = Math.round(
      (endDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const pricePerNight = Number(room.roomType.price);
    const totalPrice = pricePerNight * nights;

    if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Harga kamar tidak valid.",
        },
        { status: 400 }
      );
    }

    // 8. Buat kode booking
    const bookingCode = `NARA-${Date.now()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    // 9. Simpan reservasi dan status pembayaran awal
    const reservation = await prisma.reservation.create({
      data: {
        bookingCode,
        userId: user.id,
        roomId: room.id,
        checkIn: startDate,
        checkOut: endDate,
        guests,
        totalPrice,
        status: "MENUNGGU",
        paymentStatus: "BELUM_DIBAYAR",
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
      },
    });

    // 10. Masukkan notifikasi ke antrean PostgreSQL
    // Kegagalan antrean tidak membatalkan reservasi.
    try {
      await queuePushNotification(user.id, {
        title: "NARA HOTEL",
        body: `Reservasi ${reservation.bookingCode} berhasil diajukan dan menunggu konfirmasi.`,
        url: "/",
      });
    } catch (pushError) {
      console.error("RESERVATION QUEUE ERROR:", pushError);
    }

    // 11. Kirim hasil reservasi
    return NextResponse.json(
      {
        success: true,
        message: "Reservasi berhasil diajukan!",
        data: {
          id: reservation.id,
          bookingCode: reservation.bookingCode,
          status: reservation.status,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          guests: reservation.guests,
          nights,
          pricePerNight,
          totalPrice: Number(reservation.totalPrice),

          paymentStatus: reservation.paymentStatus,
          paymentMethod: reservation.paymentMethod,

          room: {
            id: reservation.room.id,
            roomNumber: reservation.room.roomNumber,
            roomType: reservation.room.roomType.name,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create reservation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengajukan reservasi.",
      },
      { status: 500 }
    );
  }
}
