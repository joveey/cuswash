import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

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

    let newPaymentStatus = transaction_status;
    
    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        newPaymentStatus = 'success';
      }
    } else if (transaction_status === 'settlement') {
      newPaymentStatus = 'success';
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      newPaymentStatus = 'failed';
    }

    await prisma.booking.update({
      where: { midtransOrderId: order_id },
      data: {
        paymentStatus: newPaymentStatus,
      },
    });

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Midtrans webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}