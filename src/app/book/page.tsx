"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import { CarType, TimeSlot } from "@prisma/client";
import { formatRupiah } from "@/lib/utils";

type AvailableTimeSlot = TimeSlot & { isAvailable: boolean };

// Deklarasikan window.snap agar TypeScript tidak error
declare global {
    interface Window {
        snap: any;
    }
}

function BookingForm() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [selectedCarTypeId, setSelectedCarTypeId] = useState<string>("");
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [timeSlots, setTimeSlots] = useState<AvailableTimeSlot[]>([]);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(true);

  // Load script Midtrans Snap saat komponen dimuat
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchCarTypes = async () => {
      try {
        const res = await fetch("/api/car-types");
        const data = await res.json();
        setCarTypes(data);
        const carTypeIdFromUrl = searchParams.get("carTypeId");
        if (carTypeIdFromUrl && data.some((ct: CarType) => ct.id === carTypeIdFromUrl)) {
          setSelectedCarTypeId(carTypeIdFromUrl);
        } else if (data.length > 0) {
          setSelectedCarTypeId(data[0].id);
        }
      } catch (error) {
        toast.error("Failed to load car types.");
      }
    };
    fetchCarTypes();
  }, [searchParams]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate) return;
      setSlotsLoading(true);
      setSelectedTimeSlotId(null);
      try {
        const dateString = selectedDate.toISOString().split('T')[0];
        const res = await fetch(`/api/availability?date=${dateString}`);
        const data = await res.json();
        setTimeSlots(data);
      } catch (error) {
        toast.error("Failed to load time slots.");
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchAvailability();
  }, [selectedDate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionStatus === "unauthenticated") {
      toast.error("You must be logged in to book.");
      router.push("/login");
      return;
    }
    if (!selectedCarTypeId || !selectedDate || !selectedTimeSlotId) {
      toast.error("Please select a service, date, and time slot.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Processing your booking...");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carTypeId: selectedCarTypeId,
          bookingDate: selectedDate.toISOString(),
          timeSlotId: selectedTimeSlotId,
        }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking.");
      }
      
      toast.dismiss(toastId);

      if (data.token) {
        window.snap.pay(data.token, {
            onSuccess: function (result: any) {
                toast.success("Payment successful!");
                router.push("/my-bookings");
            },
            onPending: function (result: any) {
                toast("Waiting for your payment.");
                router.push("/my-bookings");
            },
            onError: function (result: any) {
                toast.error("Payment failed.");
            },
            onClose: function () {
                toast.error("You closed the payment popup.");
            },
        });
      }

    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCarType = useMemo(() => carTypes.find(ct => ct.id === selectedCarTypeId), [carTypes, selectedCarTypeId]);
  
  if (sessionStatus === "loading") {
    return <div className="text-center p-12">Loading session...</div>;
  }

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl p-8 my-8 space-y-6 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-800">Book Your Car Wash</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Kolom Kiri: Pilihan Layanan & Kalender */}
          <div className="space-y-6">
            <div>
              <label htmlFor="carType" className="block text-sm font-medium text-gray-700">1. Select Your Service</label>
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
              <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700">2. Select a Date</label>
               <DatePicker
                 selected={selectedDate}
                 onChange={(date: Date | null) => {
                     if (date) {
                         setSelectedDate(date);
                     }
                 }}
                 minDate={new Date()}
                 inline // Tampilkan kalender langsung
                 className="w-full"
               />
            </div>
          </div>

          {/* Kolom Kanan: Pilihan Slot Waktu & Tombol Submit */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">3. Select an Available Time Slot</label>
              {slotsLoading ? (
                <div className="mt-2 text-center">Loading slots...</div>
              ) : (
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.length > 0 ? timeSlots.map(slot => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                          if (slot.isAvailable) {
                            setSelectedTimeSlotId(slot.id)
                          }
                        }
                      }
                      disabled={!slot.isAvailable}
                      className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                        selectedTimeSlotId === slot.id 
                          ? 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2' 
                          : slot.isAvailable 
                            ? 'bg-gray-100 text-gray-700 hover:bg-blue-100' 
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                      }`}
                    >
                      {slot.time}
                    </button>
                  )) : <p className="col-span-full text-center text-gray-500">No available slots for this day.</p>}
                </div>
              )}
            </div>
            
            {selectedCarType && selectedDate && selectedTimeSlotId && (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-bold text-lg">Your Booking Summary</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p><strong>Service:</strong> {selectedCarType.name}</p>
                        <p><strong>Date:</strong> {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p><strong>Time:</strong> {timeSlots.find(s => s.id === selectedTimeSlotId)?.time}</p>
                        <p className="font-bold text-base text-gray-800 mt-2"><strong>Total:</strong> {formatRupiah(selectedCarType.price)}</p>
                    </div>
                </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedTimeSlotId}
              className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? "Processing..." : "Book and Proceed to Payment"}
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
        <Suspense fallback={<div className="text-center p-12">Loading...</div>}>
            <BookingForm />
        </Suspense>
    )
}

