import crypto from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Definisikan tipe yang lebih ketat, hanya properti yang kita butuhkan
interface MidtransNotificationPayload {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
}

// Fungsi untuk memverifikasi signature dari Midtrans
async function verifySignature(notificationPayload: MidtransNotificationPayload): Promise<boolean> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    console.error("MIDTRANS_SERVER_KEY is not set");
    return false;
  }

  const { order_id, status_code, gross_amount, signature_key } = notificationPayload;
  const hash = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  return hash === signature_key;
}

export async function POST(req: Request) {
  try {
    // Ambil body sebagai unknown terlebih dahulu untuk keamanan
    const notificationJson: unknown = await req.json();

    // Lakukan validasi tipe sebelum melanjutkan
    // Ini memastikan objek yang masuk memiliki properti yang kita harapkan
    if (
        typeof notificationJson !== 'object' ||
        notificationJson === null ||
        !('order_id' in notificationJson) ||
        !('status_code' in notificationJson) ||
        !('gross_amount' in notificationJson) ||
        !('signature_key' in notificationJson) ||
        !('transaction_status' in notificationJson)
    ) {
        return NextResponse.json({ error: "Invalid notification payload" }, { status: 400 });
    }

    // Sekarang aman untuk melakukan type assertion
    const typedNotification = notificationJson as MidtransNotificationPayload;

    const isSignatureValid = await verifySignature(typedNotification);
    if (!isSignatureValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const { order_id, transaction_status } = typedNotification;

    const booking = await prisma.booking.findUnique({
      where: { midtransOrderId: order_id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (
      transaction_status === "settlement" ||
      transaction_status === "capture"
    ) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "PAID",
          paymentStatus: "success",
        },
      });
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("Midtrans webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}