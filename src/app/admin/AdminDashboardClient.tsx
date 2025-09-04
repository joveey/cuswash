"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DollarSign, ListChecks, Clock, CheckCircle } from 'lucide-react';
import AdminBookingControls from './AdminBookingControls';
import { BookingForAdmin } from './page'; // Import tipe dari page.tsx
import { formatRupiah } from '@/lib/utils';

interface AdminDashboardClientProps {
    initialBookings: BookingForAdmin[];
    revenueData: { name: string; Total: number }[];
}

export default function AdminDashboardClient({ initialBookings, revenueData }: AdminDashboardClientProps) {
    const [bookings, setBookings] = useState(initialBookings);

    const stats = {
        totalRevenue: bookings.filter(b => b.paymentStatus === 'success').reduce((sum, b) => sum + b.totalPrice, 0),
        paidCount: bookings.filter(b => b.status === 'PAID').length,
        pendingCount: bookings.filter(b => b.status === 'PENDING').length,
        confirmedCount: bookings.filter(b => b.status === 'CONFIRMED').length,
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="container mx-auto px-4 py-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8"
                >
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatRupiah(stats.totalRevenue)}</div>
                                <p className="text-xs text-muted-foreground">From all successful payments</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Needs Confirmation</CardTitle>
                                <ListChecks className="h-4 w-4 text-muted-foreground text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.paidCount}</div>
                                <p className="text-xs text-muted-foreground">Paid bookings awaiting confirmation</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Awaiting Payment</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pendingCount}</div>
                                <p className="text-xs text-muted-foreground">Bookings not yet paid</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.confirmedCount}</div>
                                <p className="text-xs text-muted-foreground">Bookings ready for service</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="grid grid-cols-1 gap-8"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80 w-full">
                                <ResponsiveContainer>
                                    <BarChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis tickFormatter={(value) => formatRupiah(Number(value))} />
                                        <Tooltip formatter={(value) => [formatRupiah(Number(value)), "Revenue"]} />
                                        <Legend />
                                        <Bar dataKey="Total" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-8"
                >
                     <h2 className="text-xl font-semibold text-gray-900 mb-4">All Bookings</h2>
                     <AdminBookingControls initialBookings={bookings} setBookings={setBookings} />
                </motion.div>
            </div>
        </div>
    );
}