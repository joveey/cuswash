// src/components/UserDashboardSidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, CalendarDays, User, Loader2 } from 'lucide-react';

const getInitials = (name?: string | null) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
};

const NavLink = ({ href, icon, children }: { href: string, icon: React.ReactNode, children: React.ReactNode }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link href={href}
            className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
            {icon}
            <span className="ml-3">{children}</span>
        </Link>
    );
};


export default function UserDashboardSidebar() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="flex h-full w-64 flex-col items-center justify-center bg-gray-800 p-4">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }
    
    return (
        <aside className="hidden h-screen w-64 flex-col border-r border-gray-700 bg-gray-800 p-4 lg:flex">
            <div className="mb-8 flex items-center space-x-3">
                 {session?.user?.image ? (
                    <img src={session.user.image} alt="User Avatar" className="h-12 w-12 rounded-full" />
                ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-semibold text-white">
                        {getInitials(session?.user?.name)}
                    </div>
                )}
                <div>
                    <p className="font-semibold text-white">{session?.user?.name || "User"}</p>
                    <p className="text-xs text-gray-400">{session?.user?.email || "No email"}</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                <NavLink href="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />}>
                    Dashboard
                </NavLink>
                <NavLink href="/my-bookings" icon={<CalendarDays className="h-5 w-5" />}>
                    My Bookings
                </NavLink>
                <NavLink href="/my-account" icon={<User className="h-5 w-5" />}>
                    My Account
                </NavLink>
            </nav>
        </aside>
    );
}