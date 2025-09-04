import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // DEBUG: Tambahkan logging ini SEMENTARA
    console.log("=== DEBUGGING MIDTRANS CONFIG (MY-BOOKINGS) ===");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Has Server Key:", !!process.env.MIDTRANS_SERVER_KEY);
    console.log("Has Client Key:", !!process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
    console.log("Server Key prefix:", process.env.MIDTRANS_SERVER_KEY?.substring(0, 15));
    console.log("Client Key prefix:", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.substring(0, 15));
    console.log("=== END DEBUG ===");

    try {
        const bookings = await prisma.booking.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                carType: true,
                timeSlot: true,
            },
            orderBy: {
                bookingDate: 'desc',
            },
        });
        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Failed to fetch user bookings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}