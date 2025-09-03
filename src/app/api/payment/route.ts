import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import midtransClient from "midtrans-client";

const bookingSchema = z.object({
  carTypeId: z.string().cuid(),
  bookingDate: z.string().datetime(),
});

// Inisialisasi Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = bookingSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.format() }, { status: 400 });
  }

  const { carTypeId, bookingDate } = validation.data;

  try {
    const carType = await prisma.carType.findUnique({
      where: { id: carTypeId },
    });

    if (!carType) {
      return NextResponse.json({ error: "Jenis mobil tidak ditemukan" }, { status: 404 });
    }

    // Buat record booking di database terlebih dahulu
    const newBooking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        carTypeId,
        bookingDate: new Date(bookingDate),
        totalPrice: carType.price,
        status: "PENDING",
        paymentStatus: "pending",
      },
    });

    // Siapkan parameter untuk transaksi Midtrans
    const parameter = {
      transaction_details: {
        order_id: newBooking.id, // Gunakan ID booking sebagai Order ID
        gross_amount: newBooking.totalPrice,
      },
      customer_details: {
        first_name: session.user.name || "",
        email: session.user.email || "",
      },
    };

    // Dapatkan token transaksi dari Midtrans
    const token = await snap.createTransactionToken(parameter);

    // Simpan token & order_id ke record booking
    await prisma.booking.update({
      where: { id: newBooking.id },
      data: { midtransToken: token, midtransOrderId: newBooking.id },
    });

    // Kirim token kembali ke frontend
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Payment API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

