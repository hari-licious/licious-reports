import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-100 p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Licious Reports
        </h1>
        <p className="text-sm text-gray-500 mt-2">Internal analytics · Product &amp; Operations</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/ai-chatbot">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-400 uppercase mb-3">A/B Test</p>
            <h2 className="text-lg font-bold text-gray-900 mb-1">AI Chatbot</h2>
            <p className="text-sm text-gray-500">Guided Help vs AI Chatbot · Apr–Jun 2026</p>
          </div>
        </Link>
        <Link href="/autobatching">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-400 uppercase mb-3">Operations</p>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Autobatching v2</h2>
            <p className="text-sm text-gray-500">Pre vs Post impact · Jun 2026</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
