    import type { Metadata } from "next";
    import { Inter } from "next/font/google";
    import "./globals.css";
    import Providers from "@/components/Providers"; // Import provider
    import Navbar from "@/components/Navbar";       // Import navbar
    import { Toaster } from 'react-hot-toast';    // Import toaster untuk notifikasi

    const inter = Inter({ subsets: ["latin"] });

    export const metadata: Metadata = {
      title: "CusWash - Car Wash Booking",
      description: "Book your car wash session easily.",
    };

    export default function RootLayout({
      children,
    }: Readonly<{
      children: React.ReactNode;
    }>) {
      return (
        <html lang="en">
          <body className={inter.className}>
            <Providers> {/* Bungkus semuanya dengan Provider */}
              <Toaster position="top-center" /> {/* Tambahkan Toaster di sini */}
              <Navbar /> {/* Tampilkan Navbar di setiap halaman */}
              <main>{children}</main> {/* Konten halaman akan muncul di sini */}
            </Providers>
          </body>
        </html>
      );
    }
    
