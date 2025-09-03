import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';

// Setup the Inter font
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "CusWash - Premium Car Wash Booking",
  description: "Book your premium car wash session easily and quickly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply the Inter font class to the body */}
      <body className={`${inter.variable} font-sans bg-gray-50`}>
        <Providers>
          <Toaster 
            position="top-center" 
            toastOptions={{
              duration: 3000,
            }}
          />
          <Navbar />
          {/* Add padding to the main content area */}
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
