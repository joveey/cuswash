import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcryptjs from 'bcryptjs';

export async function PATCH(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, phoneNumber, currentPassword, newPassword } = body;

        const user = await prisma.user.findUnique({ where: { id: session.user.id }});

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // --- Handle Password Change ---
        if (currentPassword && newPassword) {
            if (!user.password) {
                return NextResponse.json({ error: 'Cannot change password for accounts without a password.' }, { status: 400 });
            }
            const isPasswordCorrect = await bcryptjs.compare(currentPassword, user.password);
            if (!isPasswordCorrect) {
                return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
            }
            const hashedNewPassword = await bcryptjs.hash(newPassword, 10);
            
            await prisma.user.update({
                where: { id: session.user.id },
                data: { password: hashedNewPassword },
            });
            
            return NextResponse.json({ message: 'Password updated successfully' });
        }
        
        // --- Handle Name and Phone Number Update ---
        if (name !== undefined || phoneNumber !== undefined) {
             await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    name: name ?? user.name,
                    phoneNumber: phoneNumber ?? user.phoneNumber,
                },
            });
            return NextResponse.json({ message: 'Profile updated successfully' });
        }

        return NextResponse.json({ error: 'No update data provided' }, { status: 400 });

    } catch (error) {
        console.error("Account update error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}