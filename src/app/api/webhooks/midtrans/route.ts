import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { BookingStatus } from '@prisma/client';

// Initialize Midtrans Core API
const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export async function POST(req: Request) {
  try {
    const notificationJson = await req.json();

    // Verify notification signature key
    const serverKey = process.env.MIDTRANS_SERVER_KEY as string;
    const signatureKey = crypto
      .createHash('sha512')
      .update(notificationJson.order_id + notificationJson.status_code + notificationJson.gross_amount + serverKey)
      .digest('hex');

    if (signatureKey !== notificationJson.signature_key) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }
    
    // Process notification
    const { order_id, transaction_status, fraud_status } = notificationJson;

    const booking = await prisma.booking.findUnique({
        where: { midtransOrderId: order_id },
    });

    if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    // Determine the new status based on the notification
    let paymentStatusUpdate = booking.paymentStatus;
    let bookingStatusUpdate: BookingStatus = booking.status;

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept') {
        paymentStatusUpdate = 'success';
        // Only update status to PAID if it's currently PENDING
        if (booking.status === 'PENDING') {
            bookingStatusUpdate = 'PAID';
        }
      }
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      paymentStatusUpdate = 'failed';
       if (booking.status === 'PENDING' || booking.status === 'PAID') {
           bookingStatusUpdate = 'CANCELLED';
       }
    } else {
      paymentStatusUpdate = transaction_status;
    }

    // Update the booking in the database
    await prisma.booking.update({
      where: { midtransOrderId: order_id },
      data: {
        paymentStatus: paymentStatusUpdate,
        status: bookingStatusUpdate,
      },
    });

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Midtrans webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

