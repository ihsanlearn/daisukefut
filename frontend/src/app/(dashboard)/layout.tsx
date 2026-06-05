"use client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {children}
    </main>
  );
}
