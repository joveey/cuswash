"use client";

import Link from "next/link";
import { Car, Sparkles, ShieldCheck, Clock, CheckCircle, Award, MessageSquare } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { formatRupiah } from "@/lib/utils";

// Tipe data untuk CarType
type CarType = {
  id: string;
  name: string;
  price: number;
};

// Komponen Kartu Layanan dengan Animasi
const ServiceCard = ({ carType, index }: { carType: CarType, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group border border-gray-100 hover:shadow-blue-200 hover:border-blue-400"
  >
    <div className="p-8">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6 group-hover:bg-blue-600 transition-colors duration-300">
        <Car className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">{carType.name}</h3>
      <p className="mt-2 text-gray-600 h-20">
        Perawatan premium untuk mobil jenis {carType.name}, bersih berkilau luar dalam.
      </p>
      <div className="mt-6">
        <span className="text-4xl font-extrabold text-gray-900">
          {formatRupiah(carType.price)}
        </span>
        <span className="text-base font-medium text-gray-500">/cuci</span>
      </div>
      <Link
        href={`/book?carTypeId=${carType.id}`}
        className="mt-8 block w-full bg-blue-600 text-white text-center font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
      >
        Pesan Sekarang
      </Link>
    </div>
  </motion.div>
);

// Komponen Kartu Fitur dengan Animasi saat Scroll
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200"
        >
            <div className="flex items-center mb-4">
                {icon}
                <h3 className="ml-4 text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </motion.div>
    );
};

// Komponen Testimoni
const TestimonialCard = ({ quote, author, index }: { quote: string, author: string, index: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay: index * 0.15 }}
        className="bg-gray-800 p-8 rounded-xl text-white border border-gray-700"
    >
        <MessageSquare className="h-8 w-8 text-blue-400 mb-4" />
        <p className="text-gray-300 italic mb-6">"{quote}"</p>
        <p className="font-semibold text-white">- {author}</p>
    </motion.div>
);

export default function HomePage() {
  const [carTypes, setCarTypes] = useState<CarType[]>([]);

  useEffect(() => {
    // Fetch car types on the client side
    const fetchCarTypes = async () => {
      try {
        const res = await fetch("/api/car-types");
        const data = await res.json();
        setCarTypes(data);
      } catch (error) {
        console.error("Failed to fetch car types:", error);
      }
    };
    fetchCarTypes();
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
         <div 
            className="absolute inset-0 bg-cover bg-center opacity-20" 
            style={{backgroundImage: "url('https://images.unsplash.com/photo-1532974297617-c0f05fe48bff?q=80&w=2070&auto=format&fit=crop')"}}>
        </div>
        <div className="relative container mx-auto px-6 py-32 text-center z-10">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tighter"
            >
                Mobil Berkilau, Hati Bahagia.
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-4 max-w-2xl mx-auto text-lg text-gray-300"
            >
                Berikan perawatan terbaik yang layak untuk mobil Anda. Pesan jadwal cuci profesional kami hanya dalam beberapa klik.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 150 }}
            >
                <Link
                    href="/book"
                    className="mt-10 inline-block bg-blue-600 text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-blue-500 transition-transform transform hover:scale-105 shadow-2xl"
                >
                    Pesan Jadwal Sekarang
                </Link>
            </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Layanan Profesional Kami</h2>
            <p className="mt-3 text-lg text-gray-600">Pilih paket yang paling sesuai untuk mobil kesayangan Anda.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {carTypes.map((carType, index) => (
              <ServiceCard key={carType.id} carType={carType} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white py-24 border-t border-b">
          <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Mengapa Memilih CusWash?</h2>
                  <p className="mt-3 text-lg text-gray-600">Kami memberikan lebih dari sekadar cuci mobil.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  <FeatureCard 
                      icon={<Award className="h-8 w-8 text-blue-500" />}
                      title="Hasil Kualitas Premium"
                      description="Kami menggunakan produk impor dan teknik terbaik untuk hasil bersih maksimal tanpa goresan."
                  />
                  <FeatureCard 
                      icon={<ShieldCheck className="h-8 w-8 text-green-500" />}
                      title="Terpercaya & Amanah"
                      description="Tim profesional kami terlatih menangani mobil Anda dengan hati-hati. Kepuasan Anda adalah jaminan kami."
                  />
                  <FeatureCard 
                      icon={<Clock className="h-8 w-8 text-red-500" />}
                      title="Pemesanan Cepat & Mudah"
                      description="Tidak perlu antri. Pesan slot Anda secara online kapan saja dan di mana saja. Efisien waktu."
                  />
              </div>
          </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-16">Apa Kata Pelanggan Setia Kami?</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <TestimonialCard 
                    quote="Hasilnya luar biasa! Mobil saya kelihatan seperti baru lagi. Pengerjaannya detail dan rapi. Pasti balik lagi!" 
                    author="Budi, Jakarta Selatan"
                    index={0}
                />
                <TestimonialCard 
                    quote="Sistem booking online-nya sangat membantu. Nggak perlu lagi antri berjam-jam. Datang sesuai jadwal, langsung dikerjakan."
                    author="Citra, Bintaro"
                    index={1}
                />
                <TestimonialCard 
                    quote="Pelayanannya ramah dan profesional. Harganya juga sangat sepadan dengan kualitas yang didapat. Recommended!" 
                    author="Andi, Pondok Indah"
                    index={2}
                />
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10 border-t-4 border-blue-600">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} CusWash. All Rights Reserved.</p>
          <p className="text-sm text-gray-400 mt-2">Dibuat dengan ❤️ di Jakarta Selatan</p>
        </div>
      </footer>
    </div>
  );
}