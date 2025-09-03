import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import AdminDashboardClient from './AdminDashboardClient';

// MODIFY: Perbarui tipe data untuk menyertakan phoneNumber
export type BookingForAdmin = Prisma.BookingGetPayload<{
    include: { 
        user: { select: { name: true, email: true, phoneNumber: true } }, // ADD: phoneNumber
        carType: { select: { name: true } },
        timeSlot: { select: { time: true }}
    }
}>;

export default async function AdminPage() {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    // MODIFY: Perbarui query Prisma untuk mengambil phoneNumber
    const allBookings: BookingForAdmin[] = await prisma.booking.findMany({
        include: { 
            user: { select: { name: true, email: true, phoneNumber: true } }, // ADD: phoneNumber
            carType: { select: { name: true } },
            timeSlot: { select: { time: true }}
        },
        orderBy: { createdAt: 'desc' },
    });
    
    // Proses data untuk chart pendapatan 7 hari terakhir
    const revenueData = Array(7).fill(null).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return {
            name: d.toLocaleDateString('en-US', { weekday: 'short' }),
            date: d.toISOString().split('T')[0],
            Total: 0,
        };
    }).reverse();

    allBookings
        .filter(b => b.paymentStatus === 'success')
        .forEach(b => {
            const bookingDate = new Date(b.createdAt).toISOString().split('T')[0];
            const dayData = revenueData.find(d => d.date === bookingDate);
            if (dayData) {
                dayData.Total += b.totalPrice;
            }
        });

    return (
        <AdminDashboardClient initialBookings={allBookings} revenueData={revenueData} />
    );
}
