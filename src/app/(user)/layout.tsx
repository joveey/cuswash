// src/app/(user)/layout.tsx
import UserDashboardSidebar from "@/components/UserDashboardSidebar";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Pastikan menggunakan flex untuk menempatkan sidebar dan konten utama berdampingan
    <div className="flex min-h-screen bg-gray-50">
      <UserDashboardSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}