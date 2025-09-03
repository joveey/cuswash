import crypto from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Fungsi untuk memverifikasi signature dari Midtrans
async function verifySignature(notificationPayload: Record<string, any>): Promise<boolean> {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    console.error("MIDTRANS_SERVER_KEY is not set");
    return false;
  }

  const { order_id, status_code, gross_amount, signature_key } =
    notificationPayload;
  const hash = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  return hash === signature_key;
}

export async function POST(req: Request) {
  try {
    const notificationJson = await req.json();

    const isSignatureValid = await verifySignature(notificationJson);
    if (!isSignatureValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    const { order_id, transaction_status } = notificationJson;

    // Temukan booking berdasarkan order_id dari Midtrans
    const booking = await prisma.booking.findUnique({
      where: { midtransOrderId: order_id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Update status booking jika pembayaran berhasil
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}