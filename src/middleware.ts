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

  const isUserOnAdminPage = pathname.startsWith('/admin');
  const isUserOnDashboardPage = pathname.startsWith('/dashboard');

  // 1. Jika pengguna tidak login dan mencoba mengakses halaman yang dilindungi
  if (!session?.user && (isUserOnAdminPage || isUserOnDashboardPage)) {
    // Arahkan ke halaman login dengan callbackUrl agar bisa kembali setelah login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Jika pengguna sudah login, tetapi bukan admin dan mencoba mengakses halaman admin
  if (session?.user && isUserOnAdminPage && session.user.role !== 'ADMIN') {
    // Arahkan ke halaman utama karena tidak memiliki otorisasi
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // 3. Izinkan permintaan untuk melanjutkan jika semua pemeriksaan lolos
  return NextResponse.next();
}

// Konfigurasi untuk menentukan path mana yang harus dijalankan oleh middleware
export const config = {
  matcher: [
    '/admin/:path*',     // Melindungi semua rute di bawah /admin
    '/dashboard/:path*'  // Melindungi semua rute di bawah /dashboard
  ],
  runtime: 'nodejs', // Penting: Gunakan Node.js runtime agar kompatibel dengan Prisma
};

