import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";

// Ini adalah Server Component, jadi bisa langsung akses database
export default async function HomePage() {
  const carTypes = await prisma.carType.findMany();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Layanan Cuci Mobil Profesional
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Pilih jenis layanan yang sesuai dengan mobil Anda dan pesan jadwal
            Anda sekarang juga.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {carTypes.map((carType) => (
            <div
              key={carType.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800">
                  {carType.name}
                </h3>
                <p className="mt-4 text-gray-600">
                  Layanan cuci premium untuk mobil jenis {carType.name}.
                  Termasuk cuci body, velg, dan vacuum interior.
                </p>
                <div className="mt-6">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {formatRupiah(carType.price)}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    / sesi
                  </span>
                </div>
                <Link
                  href={`/book?carTypeId=${carType.id}`}
                  className="mt-8 block w-full bg-blue-600 text-white text-center font-semibold py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Pesan Sekarang
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

