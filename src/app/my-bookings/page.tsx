"use client";

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, Loader2, Tag, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatRupiah } from '@/lib/utils';

type BookingWithRelations = Prisma.BookingGetPayload<{
    include: { carType: true, timeSlot: true }
}>;

const BookingStatusBadge = ({ status }: { status: string }) => {
    const statusStyles: { [key: string]: string } = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        PAID: 'bg-blue-100 text-blue-800',
        CONFIRMED: 'bg-green-100 text-green-800',
        COMPLETED: 'bg-purple-100 text-purple-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

export default function MyBookingsPage() {
    const { data: session, status } = useSession();
    const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'authenticated') {
            // Kita fetch data dari API route yang sudah kita buat
            fetch('/api/my-bookings')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setBookings(data);
                    }
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch bookings:", err);
                    setIsLoading(false);
                });
        }
        if (status === 'unauthenticated') {
             setIsLoading(false);
        }
    }, [status]);
    
    // Konfigurasi animasi untuk container
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };
    
    // Konfigurasi animasi untuk setiap item booking
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    };

    if (isLoading || status === 'loading') {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-56px)]">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
             <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                <p className="text-gray-600 mt-1">Here is a list of all your past and upcoming appointments.</p>
            </header>

            {bookings.length === 0 ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-lg shadow-sm">
                    <Info className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No bookings yet</h3>
                    <p className="mt-1 text-sm text-gray-500">You haven&apos;t made any bookings. Let&apos;s change that!</p>
                    <div className="mt-6">
                        <Link href="/book" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                            Book a Car Wash
                        </Link>
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {bookings.map((booking) => (
                        <motion.div key={booking.id} variants={itemVariants}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">{booking.carType.name}</CardTitle>
                                    <BookingStatusBadge status={booking.status} />
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>{new Date(booking.bookingDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>{booking.timeSlot.time}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Tag className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="font-semibold text-gray-800">{formatRupiah(booking.totalPrice)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}

