"use client";

import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { RawDay } from "@/lib/autobatching";
import { tooltipStyle } from "@/lib/theme";
import { ChartCard } from "@/components/ui/ChartCard";

const C_R1 = "#3b82f6"; // blue-500  — Range 1 (dashed)
const C_R2 = "#f97316"; // orange-500 — Range 2 (solid)

// ── DOW helpers (Mon = 0 … Sun = 6) ──────────────────────────────────────────

const DOW_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type DowName = typeof DOW_NAMES[number];

function getDowIdx(dateStr: string): number {
  const jsDay = new Date(dateStr + "T12:00:00").getDay(); // 0=Sun … 6=Sat
  return jsDay === 0 ? 6 : jsDay - 1;                    // 0=Mon … 6=Sun
}

function fmtDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  const M = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(d)} ${M[parseInt(m)]}`;
}

// ── Slot point (one x-axis position) ─────────────────────────────────────────

interface SlotPoint {
  slot: string;        // "0","1",… — unique categorical key for Recharts
  label: DowName;     // display label on x-axis
  r1: number | null;
  r2: number | null;
  r1Date: string | null;
  r2Date: string | null;
  noR1Data: boolean;  // drives shading
}

// ── Metric definitions ────────────────────────────────────────────────────────

interface MetricConfig {
  key: string;
  label: string;
  getValue: (d: RawDay, rdl: boolean) => number | null;
}

const METRICS: MetricConfig[] = [
  {
    key: "overall",
    label: "Licious Fleet SLA",
    getValue: (d, rdl) =>
      rdl ? (d.orders_with_rdl_ts > 0 ? d.on_time_rdl / d.orders_with_rdl_ts : null)
          : (d.orders_with_rdl > 0    ? d.on_time_orders / d.orders_with_rdl  : null),
  },
  {
    key: "dp",
    label: "DP SLA",
    getValue: (d, rdl) =>
      rdl ? (d.dp_with_rdl_ts > 0 ? d.dp_on_time_rdl / d.dp_with_rdl_ts : null)
          : (d.dp_with_rdl > 0    ? d.dp_on_time      / d.dp_with_rdl   : null),
  },
  {
    key: "express",
    label: "Express SLA",
    getValue: (d, rdl) =>
      rdl ? (d.express_with_rdl_ts > 0 ? d.express_on_time_rdl / d.express_with_rdl_ts : null)
          : (d.express_with_rdl > 0    ? d.express_on_time     / d.express_with_rdl    : null),
  },
  {
    key: "scheduled",
    label: "Scheduled SLA",
    getValue: (d, rdl) =>
      rdl ? (d.scheduled_with_rdl_ts > 0 ? d.scheduled_on_time_rdl / d.scheduled_with_rdl_ts : null)
          : (d.scheduled_with_rdl > 0    ? d.scheduled_on_time     / d.scheduled_with_rdl    : null),
  },
  {
    key: "p3",
    label: "3P SLA",
    getValue: (d) => d.p3_delivered > 0 ? d.p3_on_time / d.p3_delivered : null,
  },
];

// ── Data builders ─────────────────────────────────────────────────────────────

/**
 * Short mode — both ranges ≤ 7 days.
 * Assigns each day a slot by day-index from a common DOW anchor, so different
 * starting DOWs produce an 8-slot (or wider) axis naturally.
 *
 * Anchor DOW = start of the longer range; if equal, the earlier actual date.
 */
function buildShortMode(
  r1Days: RawDay[],
  r2Days: RawDay[],
  getValue: (d: RawDay, rdl: boolean) => number | null,
  rdl: boolean,
): SlotPoint[] {
  if (!r1Days.length && !r2Days.length) return [];

  let axisStartDow: number;
  if (!r1Days.length)                       axisStartDow = getDowIdx(r2Days[0].date);
  else if (!r2Days.length)                  axisStartDow = getDowIdx(r1Days[0].date);
  else if (r1Days.length > r2Days.length)   axisStartDow = getDowIdx(r1Days[0].date);
  else if (r2Days.length > r1Days.length)   axisStartDow = getDowIdx(r2Days[0].date);
  else {
    // Equal length: pick the anchor DOW that minimises axis width.
    // Using "earlier date" is wrong — it can produce a 13-slot axis for
    // adjacent-week selections (e.g. anchor=Tue puts Mon at offset 6).
    // Instead, anchor at whichever range's start DOW gives the smaller
    // offset for the other range, so the axis stays as narrow as possible.
    const r1Dow = getDowIdx(r1Days[0].date);
    const r2Dow = getDowIdx(r2Days[0].date);
    const offsetIfR1 = (r2Dow - r1Dow + 7) % 7; // r2's offset if anchored at r1
    const offsetIfR2 = (r1Dow - r2Dow + 7) % 7; // r1's offset if anchored at r2
    axisStartDow = offsetIfR1 <= offsetIfR2 ? r1Dow : r2Dow;
  }

  // Offset of each range's start from the axis anchor (0–6)
  const r1Off = r1Days.length ? (getDowIdx(r1Days[0].date) - axisStartDow + 7) % 7 : 0;
  const r2Off = r2Days.length ? (getDowIdx(r2Days[0].date) - axisStartDow + 7) % 7 : 0;

  const r1Map = new Map<number, RawDay>();
  const r2Map = new Map<number, RawDay>();
  r1Days.forEach((d, i) => r1Map.set(r1Off + i, d));
  r2Days.forEach((d, i) => r2Map.set(r2Off + i, d));

  const maxSlot = Math.max(
    r1Days.length ? r1Off + r1Days.length - 1 : 0,
    r2Days.length ? r2Off + r2Days.length - 1 : 0,
  );

  return Array.from({ length: maxSlot + 1 }, (_, s) => {
    const d1 = r1Map.get(s);
    const d2 = r2Map.get(s);
    const v1 = d1 ? getValue(d1, rdl) : null;
    const v2 = d2 ? getValue(d2, rdl) : null;
    return {
      slot: String(s),
      label: DOW_NAMES[(axisStartDow + s) % 7],
      r1: v1 != null ? +(v1 * 100).toFixed(1) : null,
      r2: v2 != null ? +(v2 * 100).toFixed(1) : null,
      r1Date: d1 ? fmtDate(d1.date) : null,
      r2Date: d2 ? fmtDate(d2.date) : null,
      noR1Data: !d1,
    };
  });
}

/**
 * Long mode — at least one range > 7 days.
 * 7 fixed DOW slots; each slot averages all values in that range that fall on
 * the same day-of-week. Axis anchored at the longer range's starting DOW.
 */
function buildLongMode(
  r1Days: RawDay[],
  r2Days: RawDay[],
  getValue: (d: RawDay, rdl: boolean) => number | null,
  rdl: boolean,
): SlotPoint[] {
  const anchorDay = r1Days.length >= r2Days.length ? r1Days[0] : r2Days[0];
  const axisStartDow = anchorDay ? getDowIdx(anchorDay.date) : 0;

  const r1Sums = Array(7).fill(0) as number[];
  const r1Cnts = Array(7).fill(0) as number[];
  const r2Sums = Array(7).fill(0) as number[];
  const r2Cnts = Array(7).fill(0) as number[];

  for (const d of r1Days) {
    const sl = (getDowIdx(d.date) - axisStartDow + 7) % 7;
    const v = getValue(d, rdl);
    if (v != null) { r1Sums[sl] += v * 100; r1Cnts[sl]++; }
  }
  for (const d of r2Days) {
    const sl = (getDowIdx(d.date) - axisStartDow + 7) % 7;
    const v = getValue(d, rdl);
    if (v != null) { r2Sums[sl] += v * 100; r2Cnts[sl]++; }
  }

  return Array.from({ length: 7 }, (_, i) => ({
    slot: String(i),
    label: DOW_NAMES[(axisStartDow + i) % 7],
    r1: r1Cnts[i] > 0 ? +(r1Sums[i] / r1Cnts[i]).toFixed(1) : null,
    r2: r2Cnts[i] > 0 ? +(r2Sums[i] / r2Cnts[i]).toFixed(1) : null,
    r1Date: r1Cnts[i] > 0 ? `${r1Cnts[i]}d avg` : null,
    r2Date: r2Cnts[i] > 0 ? `${r2Cnts[i]}d avg` : null,
    noR1Data: r1Cnts[i] === 0,
  }));
}

function buildSlotData(
  r1Days: RawDay[],
  r2Days: RawDay[],
  getValue: (d: RawDay, rdl: boolean) => number | null,
  rdl: boolean,
): { points: SlotPoint[]; isLong: boolean } {
  const isLong = r1Days.length > 7 || r2Days.length > 7;
  const points = isLong
    ? buildLongMode(r1Days, r2Days, getValue, rdl)
    : buildShortMode(r1Days, r2Days, getValue, rdl);
  return { points, isLong };
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function SlaTooltip({ active, payload }: {
  active?: boolean;
  payload?: { dataKey: string; value: number | null; payload: SlotPoint }[];
}) {
  if (!active || !payload?.length) return null;

  const pt     = payload[0]?.payload;
  const r2Entry = payload.find((p) => p.dataKey === "r2");
  const r1Entry = payload.find((p) => p.dataKey === "r1");
  const r2Val  = typeof r2Entry?.value === "number" ? r2Entry.value : null;
  const r1Val  = typeof r1Entry?.value === "number" ? r1Entry.value : null;
  const r2Date = pt?.r2Date ?? null;
  const r1Date = pt?.r1Date ?? null;
  const delta  = r1Val != null && r2Val != null ? +(r2Val - r1Val).toFixed(1) : null;

  return (
    <div style={tooltipStyle} className="p-3 min-w-[168px]">
      <p className="font-semibold text-gray-800 mb-2 text-xs">{pt?.label}</p>
      {r2Val != null && (
        <div className="flex items-center justify-between gap-4 text-xs mb-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: C_R2 }} />
            <span style={{ color: C_R2 }}>Range 2{r2Date ? ` · ${r2Date}` : ""}</span>
          </span>
          <span className="font-semibold text-gray-800">{r2Val.toFixed(1)}%</span>
        </div>
      )}
      {r1Val != null && (
        <div className="flex items-center justify-between gap-4 text-xs mb-1">
          <span className="flex items-center gap-1.5">
            <svg width="12" height="6" viewBox="0 0 12 6" className="overflow-visible">
              <line x1="0" y1="3" x2="12" y2="3" stroke={C_R1} strokeWidth="2" strokeDasharray="4 3" />
            </svg>
            <span style={{ color: C_R1 }}>Range 1{r1Date ? ` · ${r1Date}` : ""}</span>
          </span>
          <span className="font-semibold text-gray-800">{r1Val.toFixed(1)}%</span>
        </div>
      )}
      {delta != null && (
        <div className="flex items-center justify-between gap-4 text-xs pt-1.5 mt-1.5 border-t border-gray-100">
          <span className="text-gray-400">Δ vs Range 1</span>
          <span className={`font-bold ${delta > 0 ? "text-emerald-600" : delta < 0 ? "text-red-500" : "text-gray-500"}`}>
            {delta > 0 ? "+" : ""}{delta}pp
          </span>
        </div>
      )}
    </div>
  );
}

// ── Single metric chart ───────────────────────────────────────────────────────

function SlaMetricChart({ points, label, isLong }: {
  points: SlotPoint[];
  label: string;
  isLong: boolean;
}) {
  const hasR1 = points.some((p) => p.r1 != null);
  const hasR2 = points.some((p) => p.r2 != null);

  const tickFormatter = (slot: string) => points[parseInt(slot)]?.label ?? slot;

  return (
    <ChartCard
      title={label}
      caption={isLong ? "Each point = DOW average across selected range" : undefined}
    >
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={points} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>

          <CartesianGrid strokeDasharray="5 4" stroke="#E5E7EB" strokeOpacity={0.5} vertical={false} />

          <XAxis
            dataKey="slot"
            tickFormatter={tickFormatter}
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[40, 100]}
            tickFormatter={(v) => `${v}%`}
            ticks={[40, 60, 80, 95, 100]}
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            tickLine={false}
            axisLine={false}
            width={38}
          />

          <Tooltip content={(props) => <SlaTooltip {...(props as unknown as Parameters<typeof SlaTooltip>[0])} />} />

          <ReferenceLine
            y={95}
            stroke="#9CA3AF"
            strokeDasharray="3 3"
            strokeWidth={1.5}
            label={{ value: "95%", position: "insideTopRight", fontSize: 10, fill: "#9CA3AF", dy: -5 }}
          />

          {hasR2 && (
            <Line type="monotone" dataKey="r2" name="Range 2"
              stroke={C_R2} strokeWidth={2}
              dot={{ r: 3, fill: C_R2, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              connectNulls={false}
            />
          )}
          {hasR1 && (
            <Line type="monotone" dataKey="r1" name="Range 1"
              stroke={C_R1} strokeWidth={2}
              dot={{ r: 3, fill: C_R1, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              connectNulls={false}
            />
          )}

        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function SlaSmallMultiples({ selectedPre, selectedPost, slaMode }: {
  selectedPre: RawDay[];
  selectedPost: RawDay[];
  slaMode: "del" | "rdl";
}) {
  const rdl = slaMode === "rdl";

  const { charts, isLong } = useMemo(() => {
    const result = METRICS.map((m) => {
      const { points, isLong } = buildSlotData(selectedPre, selectedPost, m.getValue, rdl);
      return { key: m.key, label: m.label, points, isLong };
    });
    return { charts: result, isLong: result[0]?.isLong ?? false };
  }, [selectedPre, selectedPost, rdl]);

  if (!selectedPre.length && !selectedPost.length) return null;

  return (
    <div className="mb-4">
      {/* Shared legend */}
      <div className="flex flex-wrap items-center gap-5 text-xs text-gray-500 dark:text-zinc-400 mb-3">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-6 h-0.5 rounded" style={{ backgroundColor: C_R2 }} />
          Range 2
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-6 h-0.5 rounded" style={{ backgroundColor: C_R1 }} />
          Range 1
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="24" height="6" viewBox="0 0 24 6" className="overflow-visible">
            <line x1="0" y1="3" x2="24" y2="3" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>
          Target (95%)
        </span>
        {isLong && (
          <span className="text-[10px] text-amber-600 font-medium">
            ⌀ &gt;7 days selected — each point is a DOW average
          </span>
        )}
      </div>

      {/* 2×N grid */}
      <div className="grid grid-cols-2 gap-4">
        {charts.map((c, i) => (
          <div key={c.key} className={charts.length % 2 !== 0 && i === charts.length - 1 ? "col-span-2" : ""}>
            <SlaMetricChart points={c.points} label={c.label} isLong={c.isLong} />
          </div>
        ))}
      </div>

      <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-2">
        {isLong
          ? "X-axis = day of week. Axis anchored at the longer range's starting DOW. Each point averages all values on that DOW across the selected range."
          : "X-axis = day of week, anchored at the longer range's starting DOW. Shaded columns = Range 1 has no data on that day."}
      </p>
    </div>
  );
}
