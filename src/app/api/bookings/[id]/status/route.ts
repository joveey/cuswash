import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
    const session = await auth();
    // 1. Pastikan hanya admin yang bisa mengakses
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = context.params;

    try {
        const { status } = await req.json();

        // 2. Validasi input status
        if (!status || !Object.values(BookingStatus).includes(status as BookingStatus)) {
            return NextResponse.json({ error: "Invalid status provided" }, { status: 400 });
        }
        
        const booking = await prisma.booking.findUnique({
            where: { id: id },
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // 3. Update status booking di database
        const updatedBooking = await prisma.booking.update({
            where: { id: id },
            data: { status: status as BookingStatus },
        });

        // 4. Kirim kembali respons JSON yang valid
        return NextResponse.json(updatedBooking);

    } catch (error) {
        console.error("Failed to update booking status:", error);
        return NextResponse.json({ 
            error: "Internal Server Error"
        }, { status: 500 });
    }
}