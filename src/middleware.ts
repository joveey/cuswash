import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isUserOnAdminPage = pathname.startsWith('/admin');
  const isUserOnDashboardPage = pathname.startsWith('/dashboard');

  // Jika pengguna tidak login dan mencoba mengakses halaman yang dilindungi
  if (!session?.user && (isUserOnAdminPage || isUserOnDashboardPage)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika pengguna sudah login, tetapi bukan admin dan mencoba mengakses halaman admin
  if (session?.user && isUserOnAdminPage && session.user.role !== 'ADMIN') {
    // Arahkan ke halaman utama karena tidak memiliki otorisasi
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Izinkan permintaan untuk melanjutkan jika tidak ada kondisi di atas yang terpenuhi
  return NextResponse.next();
}

// Konfigurasi untuk menentukan path mana yang harus dijalankan oleh middleware dan runtime-nya
export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
  runtime: 'nodejs', // Penting: Gunakan Node.js runtime, BUKAN edge
};

