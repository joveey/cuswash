"use client";
import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Define Snap type on window
declare global {
    interface Window {
        snap: any;
    }
}

interface CarType {
    id: string;
    name: string;
    price: number;
}

export default function BookPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [carTypes, setCarTypes] = useState<CarType[]>([]);
    const [selectedCarType, setSelectedCarType] = useState("");
    const [bookingDate, setBookingDate] = useState("");
    const [loading, setLoading] = useState(false);

    // Effect for loading Midtrans Snap.js script
    useEffect(() => {
        const snapSrcUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!; // Store client key in .env.local

        const script = document.createElement('script');
        script.src = snapSrcUrl;
        script.setAttribute('data-client-key', clientKey);
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Effect to fetch car types (you need to create an API for this)
    useEffect(() => {
        // This is a mock. In a real app, you'd fetch this from `/api/car-types`
        const mockCarTypes: CarType[] = [
            { id: 'clx...1', name: 'Small Sedan / Hatchback', price: 50000 },
            { id: 'clx...2', name: 'Medium SUV / MPV', price: 75000 },
            { id: 'clx...3', name: 'Large SUV / Van', price: 100000 },
        ];
        setCarTypes(mockCarTypes);
        if (mockCarTypes.length > 0) {
            setSelectedCarType(mockCarTypes[0].id);
        }
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (status !== 'authenticated') {
            toast.error("Please login to make a booking.");
            router.push('/api/auth/signin');
            return;
        }
        setLoading(true);
        
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    carTypeId: selectedCarType,
                    bookingDate: new Date(bookingDate).toISOString(),
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to create booking.");
            }

            const data = await res.json();
            
            window.snap.pay(data.token, {
                onSuccess: function(result: any){
                  toast.success("Payment success! Waiting for confirmation.");
                  router.push('/dashboard');
                },
                onPending: function(result: any){
                  toast("Waiting for your payment.");
                },
                onError: function(result: any){
                  toast.error("Payment failed.");
                },
                onClose: function(){
                  toast("You closed the popup without finishing the payment.");
                }
            });

        } catch (error) {
            toast.error((error as Error).message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };
    
    if (status === 'loading') {
        return <div>Loading session...</div>
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Book Your Car Wash</h1>
            <form onSubmit={handleSubmit} className="max-w-md bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label htmlFor="carType" className="block text-gray-700 font-bold mb-2">Car Type</label>
                    <select
                        id="carType"
                        value={selectedCarType}
                        onChange={(e) => setSelectedCarType(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    >
                        {carTypes.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.name} - {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(type.price)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-6">
                    <label htmlFor="bookingDate" className="block text-gray-700 font-bold mb-2">Date & Time</label>
                    <input
                        type="datetime-local"
                        id="bookingDate"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    />
                </div>
                <button 
                    type="submit"
                    disabled={loading || status !== 'authenticated'}
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Processing...' : 'Book & Pay Now'}
                </button>
                 {status !== 'authenticated' && <p className="text-red-500 text-sm mt-2">You must be logged in to book.</p>}
            </form>
        </div>
    );
}