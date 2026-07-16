/*
 * ─── Standard Dashboard Template ────────────────────────────────────────────
 *
 * Every dashboard follows this vertical structure:
 *
 *   <DashboardLayout>
 *     <DashboardHeader
 *       title="..."
 *       subtitle="..."
 *       updatedAt={...}       optional — "pending" | "dd/mm hh:mm" | undefined
 *       onDownload={fn}       optional — shows "↓ Download CSV" button
 *       filters={<JSX>}       optional — date pickers, selects, toggles
 *     />
 *
 *     <SectionLabel>Label text</SectionLabel>
 *     <div className="grid ... gap-4 mb-8">
 *       <KpiCard label="..." value="..." ... />
 *     </div>
 *
 *     <SectionLabel>Section name</SectionLabel>
 *     <div className="grid ... gap-4 mb-8">
 *       <ChartCard title="..." caption="...">
 *         <ResponsiveContainer>...</ResponsiveContainer>
 *       </ChartCard>
 *     </div>
 *
 *     <GlossarySection items={[{ term, def }, ...]} />  ← always last
 *   </DashboardLayout>
 *
 * Shared primitives: DashboardHeader, SectionLabel, KpiCard, ChartCard, GlossarySection
 * All in components/ui/ — import individually, no barrel export.
 * ────────────────────────────────────────────────────────────────────────────
 */

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
