import Link from "next/link";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-100">
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 h-11 flex items-center">
        <Link
          href="/"
          className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors"
        >
          ← Licious Reports
        </Link>
      </nav>
      <div className="p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
