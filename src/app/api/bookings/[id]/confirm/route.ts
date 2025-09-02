import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { generateInvoiceEmailHtml } from "@/components/emails/InvoiceEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const booking = await prisma.booking.update({
            where: { id: params.id },
            data: { status: 'CONFIRMED' },
            include: {
                user: true,
                carType: true,
            },
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        if (!booking.user.email) {
            return NextResponse.json({ error: "User email not found" }, { status: 400 });
        }

        // Generate HTML email content
        const emailHtml = generateInvoiceEmailHtml(booking);

        // Send email notification
        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'CusWash <noreply@cuswash.com>',
            to: booking.user.email,
            subject: `🚗 Booking Confirmed - Invoice #${booking.id.substring(0, 8)}`,
            html: emailHtml,
        });

        return NextResponse.json(booking);

    } catch (error) {
        console.error("Confirmation failed:", error);
        return NextResponse.json({ 
            error: "Internal Server Error", 
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}