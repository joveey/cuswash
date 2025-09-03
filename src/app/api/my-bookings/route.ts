import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
