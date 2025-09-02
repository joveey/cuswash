"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          CusWash
        </Link>
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          ) : session?.user ? (
            <>
              <span className="text-gray-700">Hi, {session.user.name}</span>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                My Bookings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

