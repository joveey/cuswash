import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import midtransClient from "midtrans-client";
import { z } from "zod";

// Skema validasi sekarang menyertakan timeSlotId
const bookingSchema = z.object({
  carTypeId: z.string().cuid(),
  bookingDate: z.string().datetime(),
  timeSlotId: z.string().cuid(),
});

const snap = new midtransClient.Snap({
    isProduction: process.env.NODE_ENV === "production",
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
});

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = bookingSchema.safeParse(body);

    if (!validation.success) {
        // FIX: Menggunakan .format() untuk mendapatkan detail error
        return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { carTypeId, bookingDate, timeSlotId } = validation.data;
    const selectedDate = new Date(bookingDate);

    try {
        // --- LOGIKA PENTING: Pengecekan Ketersediaan Slot ---
        const timeSlot = await prisma.timeSlot.findUnique({
            where: { id: timeSlotId },
        });

        if (!timeSlot) {
            return NextResponse.json({ error: "Time slot not found" }, { status: 404 });
        }

        const existingBookings = await prisma.booking.count({
            where: {
                bookingDate: {
                    gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
                    lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
                },
                timeSlotId: timeSlotId,
                status: { notIn: ['CANCELLED'] }
            }
        });

        if (existingBookings >= timeSlot.capacity) {
            return NextResponse.json({ error: "Sorry, this time slot is already full." }, { status: 409 }); // 409 Conflict
        }
        // --- Akhir Pengecekan Ketersediaan ---

        const carType = await prisma.carType.findUnique({
            where: { id: carTypeId },
        });

        if (!carType) {
            return NextResponse.json({ error: "Car type not found" }, { status: 404 });
        }

        // Buat booking DULU untuk mendapatkan ID
        const newBooking = await prisma.booking.create({
            data: {
                userId: session.user.id,
                carTypeId: carTypeId,
                bookingDate: selectedDate,
                timeSlotId: timeSlotId,
                totalPrice: carType.price,
                status: 'PENDING',
                paymentStatus: 'pending'
            },
        });

        // Gunakan ID booking sebagai order_id untuk Midtrans
        const parameter = {
            transaction_details: {
                order_id: newBooking.id, 
                gross_amount: newBooking.totalPrice,
            },
            customer_details: {
                first_name: session.user.name ?? "",
                email: session.user.email ?? "",
            },
        };

        const transaction = await snap.createTransaction(parameter);
        
        // Simpan token Midtrans ke booking yang baru dibuat
        await prisma.booking.update({
            where: { id: newBooking.id },
            data: { 
                midtransToken: transaction.token,
                midtransOrderId: newBooking.id, // Simpan order ID untuk referensi di webhook
            }
        });

        return NextResponse.json(transaction);
    } catch (error) {
        console.error("Booking creation failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

