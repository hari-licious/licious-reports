import Link from "next/link";
import { DarkModeToggle } from "./DarkModeToggle";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <nav className="sticky top-0 z-40 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 px-6 h-11 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-medium text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors"
        >
          ← Licious Reports
        </Link>
        <DarkModeToggle />
      </nav>
      <div className="p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
