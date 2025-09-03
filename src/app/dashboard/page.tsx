// src/app/dashboard/page.tsx

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatRupiah } from '@/lib/utils';
import { Calendar, Car, Clock, Star, ArrowRight, PlusCircle, CheckCircle } from 'lucide-react';

// Tipe data yang dibutuhkan untuk halaman ini
type BookingWithRelations = Prisma.BookingGetPayload<{
    include: { carType: true, timeSlot: true }
}>;

// Komponen Badge Status (bisa dipindahkan ke file sendiri jika perlu)
const BookingStatusBadge = ({ status }: { status: string }) => {
    const statusInfo: { [key: string]: { text: string; className: string } } = {
        PENDING: { text: 'Menunggu Pembayaran', className: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
        PAID: { text: 'Terbayar', className: 'bg-blue-100 text-blue-800 border border-blue-200' },
        CONFIRMED: { text: 'Terkonfirmasi', className: 'bg-green-100 text-green-800 border border-green-200' },
        COMPLETED: { text: 'Selesai', className: 'bg-purple-100 text-purple-800 border border-purple-200' },
        CANCELLED: { text: 'Dibatalkan', className: 'bg-red-100 text-red-800 border border-red-200' },
    };
    const info = statusInfo[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${info.className}`}>
            {info.text}
        </span>
    );
};

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) {
        redirect('/login');
    }

    // Ambil semua booking untuk kalkulasi
    const allBookings = await prisma.booking.findMany({
        where: { 
            userId: session.user.id,
        },
        include: { carType: true, timeSlot: true },
        orderBy: { bookingDate: 'asc' }, // Urutkan dari yang paling awal
    });

    const now = new Date();
    
    // Temukan jadwal berikutnya
    const upcomingBooking = allBookings.find(b => new Date(b.bookingDate) >= now && b.status !== 'CANCELLED' && b.status !== 'COMPLETED');

    // Ambil 3 riwayat terakhir (yang sudah lewat atau dibatalkan)
    const pastBookings = allBookings
        .filter(b => new Date(b.bookingDate) < now || b.status === 'COMPLETED' || b.status === 'CANCELLED')
        .reverse()
        .slice(0, 3);
        
    // Kalkulasi statistik sederhana
    const totalCompletedBookings = allBookings.filter(b => b.status === 'COMPLETED').length;
    
    let favoriteService = 'Belum ada';
    if (totalCompletedBookings > 0) {
        const serviceCounts = allBookings.reduce((acc, booking) => {
            if(booking.status === 'COMPLETED') {
                acc[booking.carType.name] = (acc[booking.carType.name] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        
        if(Object.keys(serviceCounts).length > 0) {
            favoriteService = Object.keys(serviceCounts).reduce((a, b) => serviceCounts[a] > serviceCounts[b] ? a : b);
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8 space-y-10">
                
                {/* Header Sambutan */}
                <header>
                    <h1 className="text-3xl font-bold text-gray-900">Selamat Datang, {session.user.name || 'Pelanggan'}!</h1>
                    <p className="text-gray-600 mt-1">Ini ringkasan aktivitas cuci mobil Anda.</p>
                </header>

                {/* Grid Utama */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Kolom Kiri (Jadwal Berikutnya) */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Jadwal Berikutnya</h2>
                        {upcomingBooking ? (
                            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-xl overflow-hidden">
                                <CardContent className="p-8">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-blue-200">Layanan</p>
                                            <p className="text-2xl font-bold">{upcomingBooking.carType.name}</p>
                                        </div>
                                        <BookingStatusBadge status={upcomingBooking.status} />
                                    </div>
                                    <div className="mt-8 space-y-4">
                                        <div className="flex items-center text-blue-100">
                                            <Calendar className="h-5 w-5 mr-4 flex-shrink-0" />
                                            <span className="font-medium text-lg">{new Date(upcomingBooking.bookingDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                        </div>
                                        <div className="flex items-center text-blue-100">
                                            <Clock className="h-5 w-5 mr-4 flex-shrink-0" />
                                            <span className="font-medium text-lg">Pukul {upcomingBooking.timeSlot.time} WIB</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-dashed border-2">
                                <CardContent className="p-8 text-center flex flex-col items-center">
                                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                                    <p className="text-gray-700 font-semibold">Anda tidak memiliki jadwal mendatang.</p>
                                    <p className="text-sm text-gray-500">Saatnya membuat mobil Anda berkilau lagi!</p>
                                    <Link href="/book" className="mt-6 inline-flex items-center px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition-transform hover:scale-105">
                                        <PlusCircle className="h-5 w-5 mr-2" />
                                        Pesan Jadwal Baru
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                    
                    {/* Kolom Kanan (Statistik) */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ringkasan Anda</h2>
                        <div className="space-y-4">
                            <Card className="shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="pt-6 flex items-center">
                                    <div className="p-3 bg-blue-100 rounded-full mr-4">
                                        <Car className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Selesai</p>
                                        <p className="text-2xl font-bold text-gray-900">{totalCompletedBookings} Kali</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="pt-6 flex items-center">
                                    <div className="p-3 bg-yellow-100 rounded-full mr-4">
                                        <Star className="h-6 w-6 text-yellow-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Layanan Favorit</p>
                                        <p className="text-lg font-bold text-gray-900">{favoriteService}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Riwayat Terbaru */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Aktivitas Terbaru</h2>
                        <Link href="/my-bookings" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
                            Lihat Semua Riwayat <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                    </div>
                    {pastBookings.length > 0 ? (
                        <div className="space-y-3">
                            {pastBookings.map((booking) => (
                                <Card key={booking.id} className="shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-gray-800">{booking.carType.name}</p>
                                            <p className="text-sm text-gray-500">{new Date(booking.bookingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                        <BookingStatusBadge status={booking.status} />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white rounded-lg border border-dashed">
                             <p className="text-sm text-gray-500">Belum ada riwayat pesanan yang selesai.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}