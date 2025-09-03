import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { generateInvoiceEmailHtml } from "@/components/emails/InvoiceEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { id } = params;

    try {
        const bookingToConfirm = await prisma.booking.findUnique({
            where: { id: id },
        });

        if (!bookingToConfirm) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }
        
        // Ensure we only confirm bookings that are already paid
        if (bookingToConfirm.status !== 'PAID') {
            return NextResponse.json({ error: `Booking cannot be confirmed. Current status: ${bookingToConfirm.status}` }, { status: 400 });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: id },
            data: { status: 'CONFIRMED' },
            include: {
                user: true,
                carType: true,
            },
        });

        if (!updatedBooking.user.email) {
            console.warn(`Booking ${updatedBooking.id} confirmed, but user has no email address.`);
            return NextResponse.json(updatedBooking);
        }

        // Generate HTML email content
        const emailHtml = generateInvoiceEmailHtml(updatedBooking);

        // Send email notification
        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'CusWash <noreply@yourdomain.com>',
            to: updatedBooking.user.email,
            subject: `🚗 Booking Confirmed - Invoice #${updatedBooking.id.substring(0, 8)}`,
            html: emailHtml,
        });

        return NextResponse.json(updatedBooking);

    } catch (error) {
        console.error("Confirmation failed:", error);
        return NextResponse.json({ 
            error: "Internal Server Error", 
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}