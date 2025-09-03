import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminBookingControls from './AdminBookingControls';

export default async function AdminPage() {
    const session = await auth();
    
    if (!session?.user) {
        redirect('/api/auth/signin');
    }
    
    if (session.user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    // FIX: Sesuaikan query ini agar cocok dengan tipe di AdminBookingControls
    const allBookings = await prisma.booking.findMany({
        include: { 
            user: {
                select: {
                    name: true,
                    email: true,
                }
            }, 
            carType: {
                select: {
                    name: true,
                }
            } 
        },
        orderBy: { createdAt: 'desc' },
    });
    
    // Statistik
    const stats = {
        total: allBookings.length,
        paid: allBookings.filter(b => b.status === 'PAID').length,
        confirmed: allBookings.filter(b => b.status === 'CONFIRMED').length,
        completed: allBookings.filter(b => b.status === 'COMPLETED').length,
        totalRevenue: allBookings
            .filter(b => b.paymentStatus === 'success')
            .reduce((sum, b) => sum + b.totalPrice, 0)
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };
    
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600 mt-1">Manage all car wash bookings</p>
                        </div>
                        <div className="text-sm text-gray-500">
                            Welcome, <span className="font-medium">{session.user.name || session.user.email}</span>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    {/* Total Bookings */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                    </div>

                    {/* Paid Bookings */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm font-medium text-gray-500">Paid (Need Confirmation)</p>
                        <p className="text-2xl font-semibold text-blue-600">{stats.paid}</p>
                    </div>

                    {/* Confirmed Bookings */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm font-medium text-gray-500">Confirmed</p>
                        <p className="text-2xl font-semibold text-green-600">{stats.confirmed}</p>
                    </div>
                    
                    {/* Completed Bookings */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm font-medium text-gray-500">Completed</p>
                        <p className="text-2xl font-semibold text-purple-600">{stats.completed}</p>
                    </div>

                    {/* Revenue */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm font-medium text-gray-500">Revenue</p>
                        <p className="text-2xl font-semibold text-green-600">
                            {formatCurrency(stats.totalRevenue)}
                        </p>
                    </div>
                </div>

                {/* Bookings Table */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">All Bookings</h2>
                    <AdminBookingControls initialBookings={allBookings} />
                </div>
            </div>
        </div>
    );
}

