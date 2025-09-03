import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';
import WhatsAppButton from "@/components/WhatsAppButton"; // Import the new component

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

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
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans bg-gray-50`}>
        <Providers>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1F2937',
                color: '#F9FAFB',
                borderRadius: '9999px',
              },
            }}
          />
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <WhatsAppButton /> {/* Add the button here */}
        </Providers>
      </body>
    </html>
  );
}