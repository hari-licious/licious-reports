/*
 * Unified KPI card — two display variants controlled by props:
 *
 * Single  (value provided):   large metric, optional delta badge (pp vs Control), optional sub-text
 * Dual    (ctrlValue/testValue provided):  side-by-side Control / Test values at 2xl
 *
 * downIsGood — reverses ↑↓ colour logic (e.g. escalation rate, O2C)
 */

interface KpiCardProps {
  label: string;
  // Single variant
  value?: string;
  sub?: string;
  delta?: number;
  downIsGood?: boolean;
  // Dual variant (ctrl / test side-by-side)
  ctrlValue?: string;
  testValue?: string;
  ctrlSub?: string;
  testSub?: string;
}

export function KpiCard({
  label, value, sub, delta, downIsGood,
  ctrlValue, testValue, ctrlSub, testSub,
}: KpiCardProps) {
  if (ctrlValue !== undefined || testValue !== undefined) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 shadow-sm">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-400 dark:text-zinc-500 uppercase mb-3">{label}</p>
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1">Control</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{ctrlValue}</p>
            {ctrlSub && <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{ctrlSub}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1">Test</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{testValue}</p>
            {testSub && <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{testSub}</p>}
          </div>
        </div>
      </div>
    );
  }

  const isGood = delta !== undefined ? (downIsGood ? delta < 0 : delta > 0) : null;
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-400 dark:text-zinc-500 uppercase mb-3">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">{value}</p>
      {delta !== undefined && (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          isGood
            ? "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400"
            : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
        }`}>
          {isGood ? "↑" : "↓"} {Math.abs(delta)}pp vs Control
        </span>
      )}
      {sub && <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{sub}</p>}
    </div>
  );
}
