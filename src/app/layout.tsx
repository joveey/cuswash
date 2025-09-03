import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';
import WhatsAppButton from "@/components/WhatsAppButton";

// Konfigurasi font
const inter = Inter({ 
  subsets: ["latin"], 
  variable: '--font-inter',
  display: 'swap'
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap'
});

export const metadata: Metadata = {
  title: "CusWash - Premium Car Wash Booking",
  description: "Book your premium car wash session easily with CusWash.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} scroll-smooth`}>
      <body className={`font-sans`}>
        <Providers>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#343A40', // text-dark
                color: '#F8F9FA', // background-light
                borderRadius: '9999px',
              },
            }}
          />
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
