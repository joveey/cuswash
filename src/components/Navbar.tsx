"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Car, LogIn, LogOut, User, LayoutDashboard, Wrench } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-lg">CusWash</span>
        </Link>
        <nav className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>
          ) : session?.user ? (
            <>
              <span className="hidden sm:inline text-sm text-gray-600">
                Hi, {session.user.name || session.user.email}
              </span>
              
              {session.user.role === 'ADMIN' && (
                 <Link href="/admin" className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                    <Wrench className="h-4 w-4 mr-1" />
                    Admin
                </Link>
              )}

              <Link href="/my-bookings" className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                <LayoutDashboard className="h-4 w-4 mr-1" />
                My Bookings
              </Link>
              
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-all shadow-sm"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-all shadow-sm">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

