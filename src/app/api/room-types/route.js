
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const roomTypes = await prisma.roomType.findMany({
      orderBy: {
        price: "asc",
      },
      include: {
        rooms: {
          select: {
            id: true,
          },
          where: {
            status: "TERSEDIA",
          },
          orderBy: { id: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: roomTypes.map((roomType) => ({
        id: roomType.id,
        name: roomType.name,
        description: roomType.description,
        capacity: roomType.capacity,
        price: roomType.price.toString(),
        facilities: roomType.facilities || [],
        imageUrl: roomType.imageUrl || null,
        rooms: roomType.rooms.map((room) => ({ id: room.id })),
      })),
    });
  } catch (error) {
    console.error("Get room types error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data tipe kamar.",
      },
      {
        status: 500,
      }
    );
  }
}
