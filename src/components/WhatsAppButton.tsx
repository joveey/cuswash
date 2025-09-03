"use client";

import Link from 'next/link';

const WhatsAppButton = () => {
    // Ganti dengan nomor WhatsApp Customer Service Anda (gunakan format internasional tanpa + atau 0)
    const whatsAppNumber = "6285156634341"; 
    const message = "Halo CusWash, saya ingin bertanya tentang layanan cuci mobil.";
    
    const whatsAppUrl = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`;

    return (
        <Link 
            href={whatsAppUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            aria-label="Chat on WhatsApp"
        >
            <svg 
                xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                className="w-8 h-8"
            >
                <path d="M16.6 14.2c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.7-.8.9-.1.1-.3.2-.4.1-.2-.1-.9-.3-1.6-.9-.6-.5-1-1.1-1.1-1.3-.1-.2 0-.3.1-.4l.2-.2c.1-.1.1-.2.2-.3.1-.1 0-.2 0-.3s-.8-1.8-.9-2.1c-.1-.3-.3-.3-.4-.3h-.4c-.1 0-.3.1-.4.2-.2.2-.7.6-.7 1.5s.7 1.7.8 1.8c.1.1 1.5 2.3 3.6 3.2.5.2.8.3 1.1.4.5.1.9.1 1.2.1.4 0 1.1-.5 1.3-.9s.2-.8.1-.9c-.1-.1-.2-.2-.4-.3zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
            </svg>
        </Link>
    );
};

export default WhatsAppButton;