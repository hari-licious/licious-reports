"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { RawDay } from "@/lib/autobatching";

interface Props {
  hub: string;
  pre_range: string;
  generated_at: string;
  days: RawDay[];
}

// ── Aggregation ───────────────────────────────────────────────────────────────

interface Aggregated {
  num_days: number;
  total_orders: number;
  avg_daily_orders: number;
  avg_daily_riders: number;

  // Batching
  dispatched_licious_pct: number;
  dispatched_3p_pct: number;
  batched_orders_pct: number;
  avg_orders_per_trip: number;
  single_order_trips_pct: number;
  avg_orders_per_de: number;
  orders_per_login_hour: number;
  trips_per_de: number;

  // SLA
  overall_sla_pct: number;
  scheduled_sla_pct: number;
  express_sla_pct: number;
  dp_sla_pct: number;
  p3_sla_pct: number;
  avg_breach_mins: number;

  // DP warehouse timeline
  avg_dp_created_to_picked_mins: number;
  avg_dp_picked_to_packed_mins: number;
  avg_dp_packed_to_dispatched_mins: number;
}

function div(num: number, den: number): number {
  return den > 0 ? num / den : 0;
}

function aggregate(days: RawDay[]): Aggregated {
  const zero: Aggregated = {
    num_days: 0, total_orders: 0, avg_daily_orders: 0, avg_daily_riders: 0,
    dispatched_licious_pct: 0, dispatched_3p_pct: 0, batched_orders_pct: 0,
    avg_orders_per_trip: 0, single_order_trips_pct: 0,
    avg_orders_per_de: 0, orders_per_login_hour: 0, trips_per_de: 0,
    overall_sla_pct: 0, scheduled_sla_pct: 0, express_sla_pct: 0,
    dp_sla_pct: 0, p3_sla_pct: 0, avg_breach_mins: 0,
    avg_dp_created_to_picked_mins: 0, avg_dp_picked_to_packed_mins: 0, avg_dp_packed_to_dispatched_mins: 0,
  };
  if (days.length === 0) return zero;

  const n = days.length;

  const total_orders           = days.reduce((s, d) => s + (d.total_orders ?? 0), 0);
  const dispatched_licious     = days.reduce((s, d) => s + (d.dispatched_licious ?? 0), 0);
  const dispatched_3p          = days.reduce((s, d) => s + (d.dispatched_3p ?? 0), 0);
  const total_licious_disp     = days.reduce((s, d) => s + (d.total_licious_dispatched ?? 0), 0);
  const total_orders_batched   = days.reduce((s, d) => s + (d.total_orders_batched ?? 0), 0);
  const total_trips            = days.reduce((s, d) => s + (d.total_trips ?? 0), 0);
  const single_order_trips     = days.reduce((s, d) => s + (d.single_order_trips ?? 0), 0);
  const total_login_hrs        = days.reduce((s, d) => s + (d.total_login_hrs ?? 0), 0);
  const orders_with_rdl        = days.reduce((s, d) => s + (d.orders_with_rdl ?? 0), 0);
  const on_time_orders         = days.reduce((s, d) => s + (d.on_time_orders ?? 0), 0);
  const breach_mins_sum        = days.reduce((s, d) => s + (d.breach_mins_sum ?? 0), 0);
  const breach_count           = days.reduce((s, d) => s + (d.breach_count ?? 0), 0);
  const scheduled_with_rdl     = days.reduce((s, d) => s + (d.scheduled_with_rdl ?? 0), 0);
  const scheduled_on_time      = days.reduce((s, d) => s + (d.scheduled_on_time ?? 0), 0);
  const express_with_rdl       = days.reduce((s, d) => s + (d.express_with_rdl ?? 0), 0);
  const express_on_time        = days.reduce((s, d) => s + (d.express_on_time ?? 0), 0);
  const dp_with_rdl            = days.reduce((s, d) => s + (d.dp_with_rdl ?? 0), 0);
  const dp_on_time             = days.reduce((s, d) => s + (d.dp_on_time ?? 0), 0);
  const p3_delivered           = days.reduce((s, d) => s + (d.p3_delivered ?? 0), 0);
  const p3_on_time             = days.reduce((s, d) => s + (d.p3_on_time ?? 0), 0);

  // DP timeline weighted sums
  const dp_c2p_sum  = days.reduce((s, d) => s + (d.dp_tl_created_to_picked_sum ?? 0), 0);
  const dp_c2p_cnt  = days.reduce((s, d) => s + (d.dp_tl_created_to_picked_cnt ?? 0), 0);
  const dp_p2p_sum  = days.reduce((s, d) => s + (d.dp_tl_picked_to_packed_sum ?? 0), 0);
  const dp_p2p_cnt  = days.reduce((s, d) => s + (d.dp_tl_picked_to_packed_cnt ?? 0), 0);
  const dp_p2d_sum  = days.reduce((s, d) => s + (d.dp_tl_packed_to_dispatched_sum ?? 0), 0);
  const dp_p2d_cnt  = days.reduce((s, d) => s + (d.dp_tl_packed_to_dispatched_cnt ?? 0), 0);

  // Day-agnostic: mean of per-day ratios
  const de_hc_values       = days.map(d => d.de_hc ?? 0);
  const avg_daily_riders   = div(de_hc_values.reduce((s, v) => s + v, 0), n);

  const opde_days          = days.filter(d => (d.de_hc ?? 0) > 0);
  const avg_orders_per_de  = opde_days.length > 0
    ? div(opde_days.reduce((s, d) => s + div(d.total_licious_dispatched ?? 0, d.de_hc), 0), opde_days.length)
    : 0;

  const tpde_days          = days.filter(d => (d.de_hc ?? 0) > 0);
  const trips_per_de       = tpde_days.length > 0
    ? div(tpde_days.reduce((s, d) => s + div(d.total_trips ?? 0, d.de_hc), 0), tpde_days.length)
    : 0;

  return {
    num_days:                    n,
    total_orders,
    avg_daily_orders:            div(total_orders, n),
    avg_daily_riders,
    dispatched_licious_pct:      div(dispatched_licious, total_orders),
    dispatched_3p_pct:           div(dispatched_3p, total_orders),
    batched_orders_pct:          div(total_orders_batched, total_licious_disp),
    avg_orders_per_trip:         div(total_licious_disp, total_trips),
    single_order_trips_pct:      div(single_order_trips, total_trips),
    avg_orders_per_de,
    orders_per_login_hour:       div(total_orders, total_login_hrs),
    trips_per_de,
    overall_sla_pct:             div(on_time_orders, orders_with_rdl),
    scheduled_sla_pct:           div(scheduled_on_time, scheduled_with_rdl),
    express_sla_pct:             div(express_on_time, express_with_rdl),
    dp_sla_pct:                  div(dp_on_time, dp_with_rdl),
    p3_sla_pct:                  div(p3_on_time, p3_delivered),
    avg_breach_mins:             div(breach_mins_sum, breach_count),
    avg_dp_created_to_picked_mins:    div(dp_c2p_sum, dp_c2p_cnt),
    avg_dp_picked_to_packed_mins:     div(dp_p2p_sum, dp_p2p_cnt),
    avg_dp_packed_to_dispatched_mins: div(dp_p2d_sum, dp_p2d_cnt),
  };
}

// ── MetricCard ────────────────────────────────────────────────────────────────

function fmt(v: number, decimals = 1, unit = ""): string {
  if (!isFinite(v)) return "—";
  return `${v.toFixed(decimals)}${unit}`;
}

function MetricCard({
  label, pre, post, unit, higherIsBetter, neutral, decimals = 1,
}: {
  label: string;
  pre: number;
  post: number;
  unit?: string;
  higherIsBetter?: boolean;
  neutral?: boolean;
  decimals?: number;
}) {
  const delta    = post - pre;
  const absDelta = Math.abs(delta);
  const pctDelta = pre !== 0 ? (delta / Math.abs(pre)) * 100 : 0;
  const isGood   = neutral ? null : higherIsBetter ? delta > 0 : delta < 0;
  const sign     = delta >= 0 ? "+" : "−";
  const arrow    = delta >= 0 ? "↑" : "↓";

  return (
    <div className="bg-[#242424] rounded-2xl p-5 border border-white/5">
      <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-3">{label}</p>
      <div className="flex items-end gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Pre</p>
          <p className="text-xl font-semibold text-gray-400">{fmt(pre, decimals, unit ?? "")}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Post</p>
          <p className="text-2xl font-bold text-white">{fmt(post, decimals, unit ?? "")}</p>
        </div>
      </div>
      {!neutral && (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            isGood ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
          }`}
        >
          {arrow} {sign}{fmt(absDelta, decimals, unit ?? "")} ({sign}{Math.abs(pctDelta).toFixed(1)}%)
        </span>
      )}
    </div>
  );
}

// ── Comparability strip ───────────────────────────────────────────────────────

function CompareStat({ label, preVal, postVal, warn }: {
  label: string; preVal: string; postVal: string; warn: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">{label}</p>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">Pre: <span className="text-white font-medium">{preVal}</span></span>
        <span className="text-gray-600">·</span>
        <span className="text-sm text-gray-400">Post: <span className="text-white font-medium">{postVal}</span></span>
        {warn && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
            ⚠ &gt;25% diff
          </span>
        )}
      </div>
    </div>
  );
}

// ── Tooltip style ─────────────────────────────────────────────────────────────

const tooltipStyle = {
  backgroundColor: "#2E2E2E",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
  fontSize: 12,
  color: "#fff",
};

const PRE_COLOR  = "#6B7280";
const POST_COLOR = "#3B82F6";

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard({ hub, generated_at, days }: Props) {
  // Derive initial bounds from data
  const initPreDays  = days.filter(d => d.period === "pre");
  const initPostDays = days.filter(d => d.period === "post");

  const [selectedHub, setSelectedHub] = useState<string>(days[0]?.hub ?? hub);
  const [preStart,  setPreStart]  = useState(initPreDays[0]?.date ?? "");
  const [preEnd,    setPreEnd]    = useState(initPreDays[initPreDays.length - 1]?.date ?? "");
  const [postStart, setPostStart] = useState(initPostDays[0]?.date ?? "");
  const [postEnd,   setPostEnd]   = useState(initPostDays[initPostDays.length - 1]?.date ?? "");

  // Available hubs from data
  const availableHubs = useMemo(
    () => [...new Set(days.map(d => d.hub).filter(Boolean))].sort(),
    [days]
  );

  // Hub-filtered days
  const hubDays = useMemo(
    () => days.filter(d => (d.hub ?? hub) === selectedHub),
    [days, selectedHub, hub]
  );

  const allPreDays  = useMemo(() => hubDays.filter(d => d.period === "pre"),  [hubDays]);
  const allPostDays = useMemo(() => hubDays.filter(d => d.period === "post"), [hubDays]);

  // Bounds for date pickers
  const preMin  = allPreDays[0]?.date  ?? "";
  const preMax  = allPreDays[allPreDays.length - 1]?.date  ?? "";
  const postMin = allPostDays[0]?.date ?? "";
  const postMax = allPostDays[allPostDays.length - 1]?.date ?? "";

  const selectedPre = useMemo(
    () => allPreDays.filter(d => d.date >= preStart && d.date <= preEnd),
    [allPreDays, preStart, preEnd]
  );
  const selectedPost = useMemo(
    () => allPostDays.filter(d => d.date >= postStart && d.date <= postEnd),
    [allPostDays, postStart, postEnd]
  );

  const preAgg  = useMemo(() => aggregate(selectedPre),  [selectedPre]);
  const postAgg = useMemo(() => aggregate(selectedPost), [selectedPost]);

  const ordersWarn = preAgg.avg_daily_orders > 0
    && Math.abs(postAgg.avg_daily_orders - preAgg.avg_daily_orders) / preAgg.avg_daily_orders > 0.25;
  const ridersWarn = preAgg.avg_daily_riders > 0
    && Math.abs(postAgg.avg_daily_riders - preAgg.avg_daily_riders) / preAgg.avg_daily_riders > 0.25;

  const timelineData = [
    { stage: "Created → Picked",      pre: parseFloat(preAgg.avg_dp_created_to_picked_mins.toFixed(1)),    post: parseFloat(postAgg.avg_dp_created_to_picked_mins.toFixed(1)) },
    { stage: "Picked → Packed",       pre: parseFloat(preAgg.avg_dp_picked_to_packed_mins.toFixed(1)),     post: parseFloat(postAgg.avg_dp_picked_to_packed_mins.toFixed(1)) },
    { stage: "Packed → Dispatched",   pre: parseFloat(preAgg.avg_dp_packed_to_dispatched_mins.toFixed(1)), post: parseFloat(postAgg.avg_dp_packed_to_dispatched_mins.toFixed(1)) },
  ];

  const generatedDate = generated_at ? generated_at.slice(0, 10) : "—";

  const dateInputCls = "bg-[#242424] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-white/20";

  return (
    <div className="min-h-screen bg-[#1A1A1A] p-8">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-1">Operations</p>
          <h1 className="text-2xl font-bold text-white">Autobatching v2</h1>
          <p className="text-sm text-gray-500 mt-1">Data as of: {generatedDate}</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3">

          {/* Hub filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase w-12">Hub</span>
            <select
              value={selectedHub}
              onChange={e => setSelectedHub(e.target.value)}
              className={dateInputCls}
            >
              {availableHubs.length > 0
                ? availableHubs.map(h => <option key={h} value={h}>{h}</option>)
                : <option value={hub}>{hub}</option>
              }
            </select>
          </div>

          {/* Pre range */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase w-12">Pre</span>
            <input type="date" value={preStart} min={preMin} max={preEnd}
              onChange={e => setPreStart(e.target.value)} className={dateInputCls} />
            <span className="text-gray-600">→</span>
            <input type="date" value={preEnd} min={preStart} max={preMax}
              onChange={e => setPreEnd(e.target.value)} className={dateInputCls} />
          </div>

          {/* Post range */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase w-12">Post</span>
            <input type="date" value={postStart} min={postMin} max={postEnd}
              onChange={e => setPostStart(e.target.value)} className={dateInputCls} />
            <span className="text-gray-600">→</span>
            <input type="date" value={postEnd} min={postStart} max={postMax}
              onChange={e => setPostEnd(e.target.value)} className={dateInputCls} />
          </div>

        </div>
      </div>

      {/* Section 1: Comparability */}
      <div className="bg-[#242424] rounded-2xl p-5 border border-white/5 mb-6">
        <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">Comparability</p>
        <div className="flex flex-col sm:flex-row gap-6">
          <CompareStat label="Days"             preVal={String(preAgg.num_days)}              postVal={String(postAgg.num_days)}              warn={false} />
          <CompareStat label="Avg Daily Orders" preVal={preAgg.avg_daily_orders.toFixed(0)}   postVal={postAgg.avg_daily_orders.toFixed(0)}   warn={ordersWarn} />
          <CompareStat label="Avg Daily DEs"    preVal={preAgg.avg_daily_riders.toFixed(0)}   postVal={postAgg.avg_daily_riders.toFixed(0)}   warn={ridersWarn} />
        </div>
      </div>

      {/* Section 2: Batch Metrics */}
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
          Batch Metrics — Success Signal
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard label="Batched Orders %"     pre={preAgg.batched_orders_pct * 100}    post={postAgg.batched_orders_pct * 100}    unit="%" higherIsBetter decimals={1} />
          <MetricCard label="Avg Orders / Trip"    pre={preAgg.avg_orders_per_trip}          post={postAgg.avg_orders_per_trip}          higherIsBetter decimals={2} />
          <MetricCard label="Single-Order Trips %" pre={preAgg.single_order_trips_pct * 100} post={postAgg.single_order_trips_pct * 100} unit="%" higherIsBetter={false} decimals={1} />
          <MetricCard label="Avg Orders / DE"      pre={preAgg.avg_orders_per_de}            post={postAgg.avg_orders_per_de}            higherIsBetter decimals={1} />
          <MetricCard label="Orders / Login Hr (OPH)" pre={preAgg.orders_per_login_hour}    post={postAgg.orders_per_login_hour}        higherIsBetter decimals={2} />
          <MetricCard label="Trips / DE"           pre={preAgg.trips_per_de}                 post={postAgg.trips_per_de}                 higherIsBetter decimals={2} />
        </div>
      </div>

      {/* Section 3: SLA */}
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
          SLA — Check Signal · Licious at RDL · 3P at Delivered
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard label="Overall SLA %"          pre={preAgg.overall_sla_pct * 100}   post={postAgg.overall_sla_pct * 100}   unit="%" higherIsBetter decimals={1} />
          <MetricCard label="DP SLA %"               pre={preAgg.dp_sla_pct * 100}        post={postAgg.dp_sla_pct * 100}        unit="%" higherIsBetter decimals={1} />
          <MetricCard label="Express SLA %"          pre={preAgg.express_sla_pct * 100}   post={postAgg.express_sla_pct * 100}   unit="%" higherIsBetter decimals={1} />
          <MetricCard label="Scheduled SLA %"        pre={preAgg.scheduled_sla_pct * 100} post={postAgg.scheduled_sla_pct * 100} unit="%" higherIsBetter decimals={1} />
          <MetricCard label="3P SLA % (at Delivered)" pre={preAgg.p3_sla_pct * 100}      post={postAgg.p3_sla_pct * 100}        unit="%" higherIsBetter decimals={1} />
          <MetricCard label="Avg Breach (mins)"      pre={preAgg.avg_breach_mins}          post={postAgg.avg_breach_mins}         higherIsBetter={false} decimals={1} />
        </div>
      </div>

      {/* Section 4: Warehouse Order Timeline */}
      <div>
        <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
          Warehouse Order Timeline · DP Orders · Avg Mins per Stage
        </p>
        <div className="bg-[#242424] rounded-2xl p-6 border border-white/5">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={timelineData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${v}m`} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)} mins`]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
              <Bar dataKey="pre"  name="Pre"  fill={PRE_COLOR}  radius={[4, 4, 0, 0]} barSize={32} />
              <Bar dataKey="post" name="Post" fill={POST_COLOR} radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
