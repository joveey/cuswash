import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import type { NextRequest } from 'next/server';

/**
 * Middleware untuk melindungi rute dan memeriksa otorisasi pengguna.
 * @param request Objek permintaan masuk dari Next.js.
 */
export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isUserLoggedIn = !!session?.user;
  const isUserOnAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isUserOnAdminPage = pathname.startsWith('/admin');
  const isUserOnProtectedPage = pathname.startsWith('/my-bookings') || pathname.startsWith('/book'); // Tambahkan halaman lain yang perlu login

  // 1. Jika pengguna SUDAH LOGIN dan mencoba mengakses halaman login/register
  if (isUserLoggedIn && isUserOnAuthPage) {
    // Alihkan ke halaman utama setelah login (misalnya /my-bookings)
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Jika pengguna BELUM LOGIN dan mencoba mengakses halaman yang dilindungi
  if (!isUserLoggedIn && (isUserOnAdminPage || isUserOnProtectedPage)) {
    // Arahkan ke halaman login dengan callbackUrl agar bisa kembali setelah login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Jika pengguna sudah login, tetapi bukan admin dan mencoba mengakses halaman admin
  if (isUserLoggedIn && isUserOnAdminPage && session.user.role !== 'ADMIN') {
    // Arahkan ke halaman utama karena tidak memiliki otorisasi
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // 4. Izinkan permintaan untuk melanjutkan jika semua pemeriksaan lolos
  return NextResponse.next();
}

// Konfigurasi untuk menentukan path mana yang harus dijalankan oleh middleware
export const config = {
  matcher: [
    '/login',
    '/register',
    '/admin/:path*',
    '/dashboard/:path*', // Anda mungkin ingin mengganti ini dengan /my-bookings
    '/my-bookings/:path*',
    '/book/:path*'
  ],
  runtime: 'nodejs',
};