import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <header className="absolute top-0 right-0 p-8">
        {session?.user ? (
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Go to Dashboard
          </Link>
        ) : (
          <Link href="/api/auth/signin" className="text-blue-600 hover:underline">
            Login
          </Link>
        )}
      </header>
      <main className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Welcome to <span className="text-blue-600">CusWash</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          The easiest way to get your car sparkling clean.
        </p>
        <Link 
          href="/book"
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Book a Wash Now
        </Link>
      </main>
    </div>
  );
}