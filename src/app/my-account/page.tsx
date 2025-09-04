// src/app/my-account/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, FormEvent } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Loader2, User, Phone, Mail, Lock } from "lucide-react";
import { InputWithIcon } from "@/components/ui/InputWithIcon";

export default function MyAccountPage() {
    const { data: session, status, update } = useSession();
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isProfileLoading, setProfileLoading] = useState(false);
    const [isPasswordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "");
            setPhoneNumber((session.user as { phoneNumber?: string }).phoneNumber || "");
        }
    }, [session]);

    const handleProfileUpdate = async (e: FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        const res = await fetch('/api/account', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phoneNumber }),
        });
        if (res.ok) {
            toast.success('Profile updated successfully!');
            await update({ name, phoneNumber });
        } else {
            const data = await res.json();
            toast.error(data.error || 'Failed to update profile.');
        }
        setProfileLoading(false);
    };
    
    const handlePasswordChange = async (e: FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long.");
            return;
        }
        setPasswordLoading(true);
        const res = await fetch('/api/account', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        if (res.ok) {
            toast.success('Password changed successfully!');
            setCurrentPassword("");
            setNewPassword("");
        } else {
            const data = await res.json();
            toast.error(data.error || 'Failed to change password.');
        }
        setPasswordLoading(false);
    };

    if (status === "loading") {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
                <p className="mt-1 text-gray-600">Update your personal details and manage your password.</p>
            </header>
            
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Profile Information Card */}
                <Card className="shadow-lg border-gray-200">
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <InputWithIcon
                                    id="name" type="text" value={name} onChange={e => setName(e.target.value)} required
                                    icon={<User className="h-5 w-5 text-gray-400" />}
                                />
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <InputWithIcon
                                    id="phoneNumber" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required
                                    icon={<Phone className="h-5 w-5 text-gray-400" />}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input id="email" type="email" value={session?.user?.email || ''} disabled 
                                    className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 py-2.5 pl-10 pr-4 text-gray-500 shadow-sm" />
                                </div>
                            </div>
                            <button type="submit" disabled={isProfileLoading} 
                                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                {isProfileLoading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Update Profile"}
                            </button>
                        </form>
                    </CardContent>
                </Card>

                {/* Change Password Card */}
                <Card className="shadow-lg border-gray-200">
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Choose a new password for your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div>
                                <label htmlFor="currentPassword"  className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <InputWithIcon
                                    id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required
                                    icon={<Lock className="h-5 w-5 text-gray-400" />}
                                />
                            </div>
                            <div>
                                <label htmlFor="newPassword"  className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <InputWithIcon
                                    id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                                    icon={<Lock className="h-5 w-5 text-gray-400" />}
                                />
                            </div>
                             <button type="submit" disabled={isPasswordLoading} 
                                className="w-full rounded-lg bg-gray-800 px-4 py-3 font-semibold text-white shadow-sm transition-all hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                 {isPasswordLoading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Change Password"}
                            </button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}