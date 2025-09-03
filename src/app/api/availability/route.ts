import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const availabilityQuerySchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());
  
  const validation = availabilityQuerySchema.safeParse(query);

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.format() }, { status: 400 });
  }
  
  const { date } = validation.data;
  const selectedDate = new Date(date);
  const dayOfWeek = selectedDate.getDay();

  try {
    // 1. Cek jam operasional untuk hari yang dipilih
    const operatingHours = await prisma.operatingHour.findFirst({
      where: { dayOfWeek, isActive: true },
    });

    if (!operatingHours) {
      return NextResponse.json([]); // Kembalikan array kosong jika tutup
    }

    // 2. Ambil semua slot waktu yang ada
    const allTimeSlots = await prisma.timeSlot.findMany({
      orderBy: { time: 'asc' },
    });
    
    // Filter slot berdasarkan jam buka dan tutup
    const operationalSlots = allTimeSlots.filter(slot => 
        slot.time >= operatingHours.openTime && slot.time < operatingHours.closeTime
    );

    // 3. Ambil semua booking pada tanggal yang dipilih
    const bookingsOnDate = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
          lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
        },
        status: { notIn: ['CANCELLED'] } // Abaikan pesanan yang dibatalkan
      },
      select: {
        timeSlotId: true,
      }
    });

    // 4. Hitung berapa kali setiap slot sudah dibooking
    const bookingCounts = bookingsOnDate.reduce((acc, booking) => {
      acc[booking.timeSlotId] = (acc[booking.timeSlotId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 5. Gabungkan data: tambahkan info ketersediaan ke setiap slot
    const availableSlots = operationalSlots.map(slot => {
      const bookedCount = bookingCounts[slot.id] || 0;
      return {
        ...slot,
        isAvailable: bookedCount < slot.capacity,
      };
    });

    return NextResponse.json(availableSlots);

  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
