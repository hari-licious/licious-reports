import Link from "next/link";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-zinc-100" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Licious Reports
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">Internal analytics · Product &amp; Operations</p>
        </div>
        <DarkModeToggle />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/ai-chatbot">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-600 transition-all cursor-pointer">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-400 dark:text-zinc-500 uppercase mb-3">A/B Test</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-1">AI Chatbot</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Guided Help vs AI Chatbot · Apr–Jun 2026</p>
          </div>
        </Link>
        <Link href="/autobatching">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-600 transition-all cursor-pointer">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-400 dark:text-zinc-500 uppercase mb-3">Operations</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-1">Autobatching v2</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Pre vs Post impact · Jun 2026</p>
          </div>
        </Link>
        <Link href="/ai-chatbot-wow">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-600 transition-all cursor-pointer">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-400 dark:text-zinc-500 uppercase mb-3">A/B Test</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-1">AI Chatbot WoW</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Week-on-week metrics · Jun 3–28 2026</p>
          </div>
        </Link>
        <Link href="/autobatching-timeline">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-600 transition-all cursor-pointer">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-400 dark:text-zinc-500 uppercase mb-3">Operations</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-1">AB Timeline</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Autobatching rollout history · by hub</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
