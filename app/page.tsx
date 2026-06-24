import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1A1A1A] p-8">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-1">Analytics</p>
        <h1 className="text-2xl font-bold text-white">Licious — Product Reports</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/ai-chatbot">
          <div className="bg-[#242424] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
            <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-3">A/B Test</p>
            <h2 className="text-lg font-bold text-white mb-1">AI Chatbot</h2>
            <p className="text-sm text-gray-500">Guided Help vs AI Chatbot · Apr–Jun 2026</p>
          </div>
        </Link>
        <Link href="/autobatching">
          <div className="bg-[#242424] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
            <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-3">Operations</p>
            <h2 className="text-lg font-bold text-white mb-1">Autobatching v2</h2>
            <p className="text-sm text-gray-500">Pre vs Post impact · Jun 2026</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
