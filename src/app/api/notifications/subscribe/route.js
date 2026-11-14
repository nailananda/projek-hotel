import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/authorization";

export async function POST(request) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const body = await request.json();
    const subscription = body.subscription;

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return NextResponse.json(
        { message: "Data langganan notifikasi tidak valid." },
        { status: 400 }
      );
    }

    const saved = await prisma.pushSubscription.upsert({
      where: {
        endpoint: subscription.endpoint,
      },
      update: {
        userId: auth.user.id,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        userId: auth.user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return NextResponse.json({
      message: "Langganan notifikasi berhasil disimpan.",
      id: saved.id,
    });
  } catch (error) {
    console.error("SUBSCRIBE NOTIFICATION ERROR:", error);

    return NextResponse.json(
      { message: "Gagal menyimpan langganan notifikasi." },
      { status: 500 }
    );
  }
}
