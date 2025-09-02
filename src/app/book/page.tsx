"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import { CarType } from "@prisma/client";
import { formatRupiah } from "@/lib/utils"; // Pastikan Anda mengimpor ini

// Komponen utama yang dibungkus dengan Suspense
function BookingForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [selectedCarTypeId, setSelectedCarTypeId] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Trik untuk memastikan kode ini hanya berjalan di client
    setIsClient(true);
    
    // Load script Midtrans Snap
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    // PASTIKAN ANDA MEMBUAT VARIABLE INI DI .env.local
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
    script.async = true;
    document.body.appendChild(script);

    // Ambil data jenis mobil dari API
    const fetchCarTypes = async () => {
      try {
        const res = await fetch("/api/car-types");
        const data = await res.json();
        setCarTypes(data);
      } catch (error) {
        toast.error("Gagal memuat jenis mobil.");
      }
    };
    fetchCarTypes();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Atur car type default dari URL
    const carTypeIdFromUrl = searchParams.get("carTypeId");
    if (carTypeIdFromUrl) {
      setSelectedCarTypeId(carTypeIdFromUrl);
    } else if (carTypes.length > 0) {
      setSelectedCarTypeId(carTypes[0].id);
    }
  }, [searchParams, carTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "unauthenticated") {
      toast.error("Anda harus login untuk membuat pesanan.");
      router.push("/login");
      return;
    }
    if (!selectedCarTypeId || !bookingDate) {
      toast.error("Harap lengkapi semua field.");
      return;
    }

    setLoading(true);
    toast.loading("Memproses pesanan...");

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carTypeId: selectedCarTypeId,
          bookingDate,
        }),
      });

      toast.dismiss();
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat pesanan.");
      }

      // Trigger pop-up pembayaran Midtrans
      (window as any).snap.pay(data.token, {
        onSuccess: function (result: any) {
          toast.success("Pembayaran berhasil!");
          router.push("/dashboard");
        },
        onPending: function (result: any) {
          toast("Menunggu pembayaran Anda.");
          router.push("/dashboard");
        },
        onError: function (result: any) {
          toast.error("Pembayaran gagal.");
        },
        onClose: function () {
          toast("Anda menutup pop-up pembayaran.");
        },
      });

    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient || status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Buat Jadwal Cuci Mobil
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="carType" className="block text-sm font-medium text-gray-700">
              Pilih Jenis Layanan
            </label>
            <select
              id="carType"
              value={selectedCarTypeId}
              onChange={(e) => setSelectedCarTypeId(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {carTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} - {formatRupiah(type.price)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700">
              Pilih Tanggal & Waktu
            </label>
            <DatePicker
              selected={bookingDate}
              onChange={(date) => setBookingDate(date)}
              showTimeSelect
              dateFormat="Pp"
              minDate={new Date()}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? "Memproses..." : "Lanjutkan ke Pembayaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Bungkus komponen dengan Suspense untuk menangani `useSearchParams`
export default function BookPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingForm />
        </Suspense>
    )
}

