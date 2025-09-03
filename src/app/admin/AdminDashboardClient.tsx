"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Prisma } from "@prisma/client";
import { formatRupiah } from "@/lib/utils";

// Definisikan tipe data booking dengan relasinya
type BookingWithDetails = Prisma.BookingGetPayload<{
  include: { user: true; carType: true };
}>;

export default function AdminDashboardClient({
  initialBookings,
}: {
  initialBookings: BookingWithDetails[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleConfirm = async (bookingId: string) => {
    setLoadingId(bookingId);
    toast.loading("Mengkonfirmasi pesanan...");

    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: "PATCH",
      });

      toast.dismiss();
      const updatedBooking = await res.json();

      if (!res.ok) {
        throw new Error(updatedBooking.error || "Gagal mengkonfirmasi.");
      }

      // Perbarui state secara lokal untuk UI yang responsif
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b))
      );
      toast.success("Pesanan dikonfirmasi & email terkirim!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Pelanggan
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Layanan
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Jadwal
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status Bayar
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status Booking
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {booking.user.name}
                  </p>
                  <p className="text-gray-600 whitespace-no-wrap">
                    {booking.user.email}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {booking.carType.name}
                  </p>
                  <p className="text-gray-600 whitespace-no-wrap">
                    {formatRupiah(booking.totalPrice)}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {new Date(booking.bookingDate).toLocaleDateString("id-ID")}
                  </p>
                  <p className="text-gray-600 whitespace-no-wrap">
                    {new Date(booking.bookingDate).toLocaleTimeString("id-ID")}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span
                    className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      booking.paymentStatus === "success"
                        ? "text-green-900"
                        : "text-yellow-900"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-0 ${
                        booking.paymentStatus === "success"
                          ? "bg-green-200"
                          : "bg-yellow-200"
                      } opacity-50 rounded-full`}
                    ></span>
                    <span className="relative">
                      {booking.paymentStatus || "pending"}
                    </span>
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {booking.status}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {booking.paymentStatus === "success" &&
                    booking.status === "PENDING" && (
                      <button
                        onClick={() => handleConfirm(booking.id)}
                        disabled={loadingId === booking.id}
                        className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 disabled:bg-gray-400"
                      >
                        {loadingId === booking.id ? "..." : "Confirm"}
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
