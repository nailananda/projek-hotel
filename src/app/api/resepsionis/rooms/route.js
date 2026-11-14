
import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/authorization";

export async function GET() {
  try {
    const auth = await requireRole("/api/resepsionis/rooms");
    if (auth.error) return auth.error;

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
      data: rooms.map((room) => ({
        id: room.id,
        roomNumber: room.roomNumber,
        floor: room.floor,
        status: room.status,
        roomTypeId: room.roomTypeId,
        roomType: room.roomType.name,
        capacity: room.roomType.capacity,
        price: Number(room.roomType.price),
      })),
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error("Get receptionist rooms error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil daftar kamar.",
      },
      { status: 500 }
    );
  }
}
