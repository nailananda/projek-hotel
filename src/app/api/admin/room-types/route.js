
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/authorization";

async function cekAdmin() {
  return requireRole("/api/admin/room-types", {
    forbiddenMessage: "Akses khusus Admin.",
  });
}

function validasiFasilitas(facilities) {
  if (facilities === undefined || facilities === null) {
    return { valid: true, data: [] };
  }

  if (
    !Array.isArray(facilities) ||
    facilities.some(
      (item) => typeof item !== "string" || !item.trim()
    )
  ) {
    return {
      valid: false,
      message: "Daftar fasilitas tidak valid.",
    };
  }

  return {
    valid: true,
    data: [...new Set(facilities.map((item) => item.trim()))],
  };
}

function validasiFoto(imageUrl) {
  if (imageUrl === undefined || imageUrl === null || imageUrl === "") {
    return { valid: true, data: null };
  }

  if (typeof imageUrl !== "string" || imageUrl.length > 2048) {
    return {
      valid: false,
      message: "Alamat foto tidak valid.",
    };
  }

  try {
    const url = new URL(imageUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return {
        valid: false,
        message: "URL foto harus menggunakan HTTP atau HTTPS.",
      };
    }

    return { valid: true, data: imageUrl.trim() };
  } catch {
    return {
      valid: false,
      message: "URL foto tidak valid.",
    };
  }
}

export async function GET() {
  try {
    const auth = await cekAdmin();

    if (auth.error) {
      return auth.error;
    }

    const roomTypes = await prisma.roomType.findMany({
      include: {
        rooms: {
          orderBy: {
            roomNumber: "asc",
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    const data = roomTypes.map((type) => ({
      id: type.id,
      name: type.name,
      description: type.description,
      capacity: type.capacity,
      price: type.price.toString(),
      facilities: type.facilities || [],
      imageUrl: type.imageUrl,
      rooms: type.rooms.map((room) => ({
        id: room.id,
        roomNumber: room.roomNumber,
        floor: room.floor,
        status: room.status,
      })),
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Admin get room types error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data tipe kamar.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await cekAdmin();

    if (auth.error) {
      return auth.error;
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim() || null
        : null;

    const capacity = Number(body.capacity);
    const price = Number(body.price);

    const fasilitas = validasiFasilitas(body.facilities);
    const foto = validasiFoto(body.imageUrl);

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama tipe kamar wajib diisi." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 20) {
      return NextResponse.json(
        { success: false, message: "Kapasitas harus antara 1 dan 20." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price <= 0 || price > 1000000000) {
      return NextResponse.json(
        { success: false, message: "Harga kamar tidak valid." },
        { status: 400 }
      );
    }

    if (!fasilitas.valid) {
      return NextResponse.json(
        { success: false, message: fasilitas.message },
        { status: 400 }
      );
    }

    if (!foto.valid) {
      return NextResponse.json(
        { success: false, message: foto.message },
        { status: 400 }
      );
    }

    const existing = await prisma.roomType.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Nama tipe kamar sudah digunakan." },
        { status: 409 }
      );
    }

    const roomType = await prisma.roomType.create({
      data: {
        name,
        description,
        capacity,
        price,
        facilities: fasilitas.data,
        imageUrl: foto.data,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tipe kamar berhasil ditambahkan.",
        data: {
          id: roomType.id,
          name: roomType.name,
          description: roomType.description,
          capacity: roomType.capacity,
          price: roomType.price.toString(),
          facilities: roomType.facilities,
          imageUrl: roomType.imageUrl,
          rooms: [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin create room type error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan tipe kamar.",
      },
      { status: 500 }
    );
  }
}
