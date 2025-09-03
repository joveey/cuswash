import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/my-bookings");
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: {
      carType: true,
    },
    orderBy: {
      bookingDate: "desc",
    },
  });

  const getStatusChip = (status: string, paymentStatus: string | null) => {
    let bgColor = "bg-gray-200";
    let textColor = "text-gray-800";
    let text = status;

    if (status === "PENDING" && paymentStatus !== "success") {
      bgColor = "bg-yellow-200";
      textColor = "text-yellow-800";
      text = "Menunggu Pembayaran";
    } else if (status === "PAID") {
      bgColor = "bg-blue-200";
      textColor = "text-blue-800";
      text = "Sudah Dibayar";
    } else if (status === "CONFIRMED") {
      bgColor = "bg-green-200";
      textColor = "text-green-800";
      text = "Terkonfirmasi";
    } else if (status === "CANCELLED") {
      bgColor = "bg-red-200";
      textColor = "text-red-800";
      text = "Dibatalkan";
    }

    return (
      <span
        className={`px-3 py-1 text-sm font-semibold rounded-full ${bgColor} ${textColor}`}
      >
        {text}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Riwayat Pesanan Saya</h1>
      </header>
      <div className="space-y-6">
        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">Anda belum memiliki pesanan.</p>
            <Link
              href="/book"
              className="mt-4 inline-block px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
            >
              Pesan Sekarang
            </Link>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white p-6 rounded-lg shadow-md transition hover:shadow-lg"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-bold text-gray-800">
                    {booking.carType.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    ID Pesanan: {booking.id.substring(0, 8)}
                  </p>
                  <p className="mt-2 font-semibold text-lg text-blue-600">
                    {formatRupiah(booking.totalPrice)}
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end">
                  <p className="text-gray-700 font-medium">
                    {new Date(booking.bookingDate).toLocaleString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="mt-2">
                    {getStatusChip(booking.status, booking.paymentStatus)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}