import React from 'react';

interface BookingDetails {
  id: string;
  bookingDate: Date;
  totalPrice: number;
  user: {
    name: string | null;
  };
  carType: {
    name: string;
  };
}

interface InvoiceEmailProps {
  booking: BookingDetails;
}

// Fungsi untuk generate HTML string (bukan React component)
export function generateInvoiceEmailHtml(booking: BookingDetails): string {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('id-ID');
  };

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CusWash Booking Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        .container {
            margin: 0 auto;
            padding: 20px;
            max-width: 580px;
        }
        .header {
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
        }
        .content {
            font-size: 16px;
            margin-bottom: 16px;
        }
        .details-box {
            border: 2px solid #2563eb;
            border-radius: 8px;
            padding: 24px;
            background-color: #f8fafc;
            margin: 24px 0;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
        }
        .details-table td {
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .details-table .label {
            font-weight: bold;
            color: #374151;
        }
        .details-table .value {
            text-align: right;
            color: #1f2937;
        }
        .total-row {
            font-size: 18px;
            font-weight: bold;
            border-top: 2px solid #2563eb;
            padding-top: 12px;
        }
        .total-value {
            color: #2563eb;
            font-size: 20px;
        }
        .footer {
            color: #6b7280;
            text-align: center;
            margin-top: 32px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="header">🚗 CusWash Booking Confirmation</h1>
        
        <p class="content">Hi <strong>${booking.user.name || 'Customer'}</strong>,</p>
        
        <p class="content">
            Great news! Your car wash session has been <strong>confirmed</strong>. 
            We're excited to make your car sparkle! ✨
        </p>
        
        <div class="details-box">
            <h3 style="margin-top: 0; color: #2563eb;">📋 Booking Details</h3>
            
            <table class="details-table">
                <tr>
                    <td class="label">Invoice #:</td>
                    <td class="value"><strong>${booking.id.substring(0, 8).toUpperCase()}</strong></td>
                </tr>
                <tr>
                    <td class="label">Service:</td>
                    <td class="value">${booking.carType.name} Wash</td>
                </tr>
                <tr>
                    <td class="label">Date & Time:</td>
                    <td class="value">${formatDate(booking.bookingDate)}</td>
                </tr>
                <tr class="total-row">
                    <td class="label">Total Amount:</td>
                    <td class="value total-value">${formatPrice(booking.totalPrice)}</td>
                </tr>
            </table>
        </div>
        
        <p class="content">
            📍 <strong>What's next?</strong><br>
            Our team will be ready for you at the scheduled time. Please arrive 5 minutes early.
        </p>
        
        <p class="content">
            💧 We look forward to giving your car the premium wash it deserves!
        </p>
        
        <div class="footer">
            <p><strong>— The CusWash Team</strong></p>
            <p style="font-size: 14px; color: #9ca3af;">
                Questions? Reply to this email or contact our support team.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

// Export default untuk backward compatibility
const InvoiceEmail: React.FC<InvoiceEmailProps> = ({ booking }) => {
  // This component won't be used directly, but kept for compatibility
  return <div dangerouslySetInnerHTML={{ __html: generateInvoiceEmailHtml(booking) }} />;
};

export default InvoiceEmail;