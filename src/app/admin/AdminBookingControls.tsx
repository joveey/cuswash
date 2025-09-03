"use client";

import { useState } from 'react';
import toast from 'react-hot-toast';
import { BookingStatus } from '@prisma/client';
import { formatRupiah } from '@/lib/utils';
import { BookingForAdmin } from './page';
import { motion } from 'framer-motion';
// FIX: Tambahkan Phone ke dalam import
import { Check, X, Hourglass, Car, Calendar, Clock, DollarSign, CheckCircle, Phone } from 'lucide-react';

interface AdminBookingControlsProps {
    initialBookings: BookingForAdmin[];
    setBookings: React.Dispatch<React.SetStateAction<BookingForAdmin[]>>;
}

const getStatusChip = (status: BookingStatus) => {
    const styles: { [key in BookingStatus]: string } = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        PAID: 'bg-blue-100 text-blue-800',
        CONFIRMED: 'bg-green-100 text-green-800',
        COMPLETED: 'bg-purple-100 text-purple-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };
    
    const Icon = {
        PENDING: Hourglass,
        PAID: DollarSign,
        CONFIRMED: Check,
        COMPLETED: CheckCircle,
        CANCELLED: X,
    }[status] || Hourglass;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
            <Icon className="h-3 w-3 mr-1.5" />
            {status}
        </span>
    );
};

export default function AdminBookingControls({ initialBookings, setBookings }: AdminBookingControlsProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
        setLoadingId(bookingId);
        
        try {
            const res = await fetch(`/api/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Failed to update status`);
            }
            const updatedBooking: BookingForAdmin = await res.json();
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: updatedBooking.status } : b));
            toast.success(`Booking marked as ${status.toLowerCase()}!`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to update status`;
            toast.error(`❌ ${errorMessage}`);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {initialBookings.map((booking) => (
                            <tr key={booking.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{booking.user.name || 'N/A'}</div>
                                    <div className="text-sm text-gray-500">{booking.user.email}</div>
                                    {/* ADD: Tampilkan nomor telepon di sini */}
                                    <div className="text-sm text-gray-500 mt-1 flex items-center">
                                        <Phone className="h-3 w-3 mr-1.5 text-gray-400" />
                                        {booking.user.phoneNumber || 'No phone'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 flex items-center"><Car className="h-4 w-4 mr-2 text-gray-400"/>{booking.carType.name}</div>
                                    <div className="text-sm text-gray-600 font-semibold mt-1">{formatRupiah(booking.totalPrice)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center"><Calendar className="h-4 w-4 mr-2 text-gray-400" />{new Date(booking.bookingDate).toLocaleDateString('id-ID')}</div>
                                    <div className="flex items-center mt-1"><Clock className="h-4 w-4 mr-2 text-gray-400" />{booking.timeSlot.time}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusChip(booking.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {booking.status === 'PAID' && (
                                        <button
                                            onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                                            disabled={loadingId === booking.id}
                                            className="px-3 py-1 text-xs text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Confirm
                                        </button>
                                    )}
                                     {booking.status === 'CONFIRMED' && (
                                        <button
                                            onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                                            disabled={loadingId === booking.id}
                                            className="px-3 py-1 text-xs text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
                                        >
                                            Complete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
