"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Car, LogIn, LogOut, LayoutDashboard, Wrench, ChevronDown, UserCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";

// Helper untuk mendapatkan inisial dari nama
const getInitials = (name?: string | null) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
};

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Menutup dropdown saat klik di luar area dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Car className="h-7 w-7 text-blue-600" />
          <span className="font-bold text-xl text-gray-800">CusWash</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-9 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          ) : session?.user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                {session.user.image ? (
                    <Image src={session.user.image} alt="User Avatar" width={32} height={32} className="h-8 w-8 rounded-full" />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                        {getInitials(session.user.name)}
                    </div>
                )}
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    Hi, {session.user.name?.split(' ')[0]}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div className="py-1">
                       <div className="px-4 py-2 border-b border-gray-100">
                         <p className="text-sm font-semibold text-gray-900">{session.user.name}</p>
                         <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                       </div>
                       <Link href="/my-account" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                         <UserCircle className="mr-3 h-5 w-5 text-gray-400" />
                         Profil Saya
                       </Link>
                       <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                         <LayoutDashboard className="mr-3 h-5 w-5 text-gray-400" />
                         Dashboard
                       </Link>
                       {session.user.role === 'ADMIN' && (
                         <Link href="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                           <Wrench className="mr-3 h-5 w-5 text-gray-400" />
                           Panel Admin
                         </Link>
                       )}
                       <div className="border-t border-gray-100 my-1"></div>
                       <button
                         onClick={() => signOut({ callbackUrl: '/' })}
                         className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                       >
                         <LogOut className="mr-3 h-5 w-5" />
                         Logout
                       </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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

