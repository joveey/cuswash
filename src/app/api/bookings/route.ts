import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import midtransClient from "midtrans-client";
import { z } from "zod";

const bookingSchema = z.object({
  carTypeId: z.string().cuid(),
  bookingDate: z.string().datetime(),
});

// Initialize Midtrans Snap
const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = bookingSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json({ error: validation.error.errors }, { status: 400 });
    }

    const { carTypeId, bookingDate } = validation.data;

    try {
        const carType = await prisma.carType.findUnique({
            where: { id: carTypeId },
        });

        if (!carType) {
            return NextResponse.json({ error: "Car type not found" }, { status: 404 });
        }

        const orderId = `CUSWASH-${session.user.id.substring(0, 5)}-${Date.now()}`;

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: carType.price,
            },
            customer_details: {
                first_name: session.user.name ?? "",
                email: session.user.email ?? "",
            },
            credit_card: {
                secure: true,
            },
        };

        const transaction = await snap.createTransaction(parameter);

        await prisma.booking.create({
            data: {
                userId: session.user.id,
                carTypeId: carTypeId,
                bookingDate: new Date(bookingDate),
                totalPrice: carType.price,
                status: 'PENDING',
                midtransOrderId: orderId,
                midtransToken: transaction.token,
                paymentStatus: 'pending'
            },
        });

        return NextResponse.json(transaction);
    } catch (error) {
        console.error("Booking creation failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}