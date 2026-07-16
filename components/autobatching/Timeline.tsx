"use client";

import { useMemo } from "react";
import type { RawDay } from "@/lib/autobatching";
import { DashboardLayout } from "@/components/ui/DashboardLayout";

interface Props {
  allDays: RawDay[];
}

// Period colors
const PERIOD_COLOR: Record<string, string> = {
  post: "bg-green-400 dark:bg-green-500",
  pre:  "bg-zinc-300 dark:bg-zinc-600",
  gap:  "bg-amber-300 dark:bg-amber-500",
};

function periodLabel(from: string | null, to: string): string {
  if (from === null || from === "pre")  return to === "post" ? "Phase 1 →" : "";
  if (from === "post" && to === "gap")  return "Rollback →";
  if (from === "gap"  && to === "post") return "Phase 2 →";
  return "";
}

export function AutobatchingTimeline({ allDays }: Props) {
  // Group by hub
  const hubs = useMemo(
    () => [...new Set(allDays.map(d => d.hub).filter(Boolean))].sort(),
    [allDays]
  );

  // All unique dates sorted
  const dates = useMemo(
    () => [...new Set(allDays.map(d => d.date))].sort(),
    [allDays]
  );

  // Map: hub -> { date -> period }
  const hubDateMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    for (const d of allDays) {
      if (!map[d.hub]) map[d.hub] = {};
      map[d.hub][d.date] = d.period;
    }
    return map;
  }, [allDays]);

  // Month boundaries: first date index per month label
  const monthBoundaries = useMemo(() => {
    const seen = new Set<string>();
    const result: { idx: number; label: string }[] = [];
    dates.forEach((date, idx) => {
      const d = new Date(date + "T00:00:00");
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          idx,
          label: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
        });
      }
    });
    return result;
  }, [dates]);

  // Milestone labels: derived from period transitions per hub
  const milestones = useMemo(() => {
    const result: Record<string, string> = {};  // date -> label (for first hub transition)
    for (const hub of hubs) {
      const dm = hubDateMap[hub] ?? {};
      let prevPeriod: string | null = null;
      for (const date of dates) {
        const period = dm[date];
        if (!period) { prevPeriod = null; continue; }
        if (prevPeriod !== period) {
          const lbl = periodLabel(prevPeriod, period);
          if (lbl && !result[date]) result[date] = lbl;
          prevPeriod = period;
        }
      }
    }
    return result;
  }, [hubs, dates, hubDateMap]);

  // Summary stats per hub
  const summary = useMemo(() => {
    return hubs.map(hub => {
      const days = allDays.filter(d => d.hub === hub);
      const postDays = days.filter(d => d.period === "post");
      const preDays  = days.filter(d => d.period === "pre");
      const gapDays  = days.filter(d => d.period === "gap");
      const firstGoLive = postDays[0]?.date ?? "—";
      return { hub, postDays: postDays.length, preDays: preDays.length, gapDays: gapDays.length, firstGoLive };
    });
  }, [hubs, allDays]);

  const CELL_W = 16;
  const CELL_H = 28;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Autobatching Timeline
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">AB status history by hub</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6">
        {[
          { period: "post", label: "AB Live (post)" },
          { period: "pre",  label: "No AB (pre)" },
          { period: "gap",  label: "Rolled back (gap)" },
        ].map(({ period, label }) => (
          <div key={period} className="flex items-center gap-2">
            <span className={`inline-block w-4 h-3 rounded-sm ${PERIOD_COLOR[period]}`} />
            <span className="text-xs text-gray-600 dark:text-zinc-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Gantt chart */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm p-5 mb-6 overflow-x-auto">
        <div className="inline-block min-w-max">
          {/* Milestone row */}
          <div className="flex mb-1" style={{ marginLeft: 64 }}>
            {dates.map((date) => (
              <div
                key={date}
                className="relative flex-shrink-0"
                style={{ width: CELL_W }}
              >
                {milestones[date] && (
                  <div
                    className="absolute bottom-0 left-0 origin-bottom-left"
                    style={{
                      transform: "rotate(-55deg) translateY(-2px)",
                      whiteSpace: "nowrap",
                      fontSize: 9,
                      lineHeight: 1,
                      color: "#6b7280",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {milestones[date]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Rows per hub */}
          {hubs.map((hub) => {
            const dm = hubDateMap[hub] ?? {};
            return (
              <div key={hub} className="flex items-center mb-1">
                {/* Hub label */}
                <div
                  className="flex-shrink-0 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase text-right pr-3"
                  style={{ width: 64 }}
                >
                  {hub}
                </div>
                {/* Cells */}
                {dates.map((date) => {
                  const period = dm[date] ?? "pre";
                  const hasMilestone = !!milestones[date];
                  return (
                    <div
                      key={date}
                      className={`flex-shrink-0 ${PERIOD_COLOR[period]}`}
                      style={{
                        width: CELL_W,
                        height: CELL_H,
                        borderLeft: hasMilestone ? "2px solid rgba(107,114,128,0.5)" : undefined,
                      }}
                      title={`${date} · ${period}`}
                    />
                  );
                })}
              </div>
            );
          })}

          {/* X-axis: month labels */}
          <div className="flex mt-2" style={{ marginLeft: 64 }}>
            {dates.map((date, idx) => {
              const mb = monthBoundaries.find(m => m.idx === idx);
              return (
                <div
                  key={date}
                  className="relative flex-shrink-0"
                  style={{ width: CELL_W }}
                >
                  {mb && (
                    <span
                      className="absolute left-0 top-0 text-[10px] font-semibold tracking-wide text-gray-400 dark:text-zinc-500 whitespace-nowrap"
                    >
                      {mb.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary table */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-700">
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">Hub</th>
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">AB Live Days</th>
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">Pre Days</th>
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">Gap Days</th>
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">First Go-Live</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row) => (
              <tr key={row.hub} className="border-b border-gray-50 dark:border-zinc-700/50 last:border-0 hover:bg-gray-50/60 dark:hover:bg-zinc-700/40 transition-colors">
                <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-zinc-200">{row.hub}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 text-right tabular-nums">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`inline-block w-2.5 h-2.5 rounded-sm ${PERIOD_COLOR.post}`} />
                    {row.postDays}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 text-right tabular-nums">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`inline-block w-2.5 h-2.5 rounded-sm ${PERIOD_COLOR.pre}`} />
                    {row.preDays}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 text-right tabular-nums">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`inline-block w-2.5 h-2.5 rounded-sm ${PERIOD_COLOR.gap}`} />
                    {row.gapDays}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 text-right tabular-nums">{row.firstGoLive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Glossary */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-700">
          <span className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">Glossary</span>
        </div>
        <table className="w-full">
          <tbody>
            {[
              { term: "post (AB Live)",        def: "Days when autobatching v2 was live. Phase 1: Jun 18–21. Phase 2: Jul 7+." },
              { term: "pre (No AB)",           def: "Baseline days before autobatching v2 went live (before Jun 18)." },
              { term: "gap (Rolled back)",      def: "Jun 22 – Jul 6: autobatching was rolled back due to ground ops issues. Re-released Jul 6 night." },
              { term: "First Go-Live",         def: "Date of the first post-period day for this hub." },
              { term: "Phase 1 →",            def: "Transition from pre to post on Jun 18 (initial AB v2 release)." },
              { term: "Rollback →",           def: "Transition from post to gap on Jun 22 (rollback)." },
              { term: "Phase 2 →",            def: "Transition from gap to post on Jul 7 (re-release)." },
            ].map((row, i) => (
              <tr key={i} className="border-b border-gray-50 dark:border-zinc-700/50 last:border-0 hover:bg-gray-50/60 dark:hover:bg-zinc-700/40 transition-colors">
                <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-zinc-200 w-1/4 align-top">{row.term}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-zinc-400 align-top">{row.def}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
