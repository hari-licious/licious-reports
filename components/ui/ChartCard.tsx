/*
 * Card wrapper for Recharts charts.
 * title   — bold label above the chart
 * caption — small muted description (methodology note, bucket scope, etc.)
 * children — the ResponsiveContainer / chart JSX
 */
export function ChartCard({ title, caption, children }: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 shadow-sm">
      <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-0.5">{title}</p>
      {caption && <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">{caption}</p>}
      {children}
    </div>
  );
}
