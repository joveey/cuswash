"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, FormEvent } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Loader2 } from "lucide-react";

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
            // @ts-ignore
            setPhoneNumber(session.user.phoneNumber || "");
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
            await update({ name, phoneNumber }); // Update session
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
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
                                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium">Phone Number</label>
                                <input id="phoneNumber" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium">Email</label>
                                <input id="email" type="email" value={session?.user?.email || ''} disabled className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed" />
                            </div>
                            <button type="submit" disabled={isProfileLoading} className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                                {isProfileLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Update Profile"}
                            </button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Choose a new password for your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label htmlFor="currentPassword"  className="block text-sm font-medium">Current Password</label>
                                <input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="newPassword"  className="block text-sm font-medium">New Password</label>
                                <input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-md" />
                            </div>
                            <button type="submit" disabled={isPasswordLoading} className="w-full px-4 py-2 font-semibold text-white bg-gray-800 rounded-md hover:bg-gray-900 disabled:bg-gray-400">
                                 {isPasswordLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Change Password"}
                            </button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}