import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Prisma } from '@prisma/client'; // Import tipe dari Prisma

// FIX: Definisikan tipe untuk data booking
type BookingWithCarType = Prisma.BookingGetPayload<{
    include: { carType: true }
}>;

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) {
        redirect('/api/auth/signin');
    }

    const bookings: BookingWithCarType[] = await prisma.booking.findMany({
        where: { userId: session.user.id },
        include: { carType: true },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="container mx-auto p-8">
             <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Bookings</h1>
                {session.user.role === 'ADMIN' && (
                    <Link href="/admin" className="text-blue-600 hover:underline">
                        Go to Admin Panel
                    </Link>
                )}
            </header>
            <div className="space-y-4">
                {bookings.length === 0 ? (
                    <p>You have no bookings yet. <Link href="/book" className="text-blue-600">Book one now!</Link></p>
                ) : (
                    // FIX: Berikan tipe eksplisit pada parameter 'booking'
                    bookings.map((booking: BookingWithCarType) => (
                        <div key={booking.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                            <div>
                                <p className="font-bold">{booking.carType.name}</p>
                                <p className="text-sm text-gray-600">
                                    {new Date(booking.bookingDate).toLocaleString('id-ID')}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Payment: <span className={`font-semibold ${booking.paymentStatus === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>{booking.paymentStatus || 'pending'}</span>
                                </p>
                            </div>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                booking.status === 'CONFIRMED' ? 'bg-green-200 text-green-800' :
                                booking.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-gray-200 text-gray-800'
                            }`}>
                                {booking.status}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}