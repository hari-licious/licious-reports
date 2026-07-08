"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
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
  total_orders_sum: number;
  avg_daily_orders: number;
  avg_daily_riders: number;
  // Order mix
  dp_orders_total: number;
  express_orders_total: number;
  scheduled_orders_total: number;
  dp_orders_pct: number;
  express_orders_pct: number;
  scheduled_orders_pct: number;
  // Batch metrics
  batched_orders_pct: number;
  avg_orders_per_trip: number;
  single_order_trips_pct: number;
  avg_orders_per_de: number;
  orders_per_login_hour: number;
  trips_per_de: number;
  // Batching by type
  dp_batched_pct: number;
  express_batched_pct: number;
  scheduled_batched_pct: number;
  // SLA
  overall_sla_pct: number;
  scheduled_sla_pct: number;
  express_sla_pct: number;
  dp_sla_pct: number;
  p3_sla_pct: number;
  avg_breach_mins: number;
  // Trip SLA
  trip_breach_rate: number;
  first_order_breach_pct: number;
  last_order_breach_pct: number;
  avg_breach_position: number;
  // DP timeline
  avg_dp_created_to_picked_mins: number;
  avg_dp_picked_to_packed_mins: number;
  avg_dp_packed_to_dispatched_mins: number;
  avg_dp_dispatch_to_ofd_mins: number;
  avg_dp_ofd_to_rdl_mins: number;
  // Express timeline
  avg_express_created_to_picked_mins: number;
  avg_express_picked_to_packed_mins: number;
  avg_express_packed_to_dispatched_mins: number;
  avg_express_dispatch_to_ofd_mins: number;
  avg_express_ofd_to_rdl_mins: number;
  // Scheduled timeline
  avg_sched_allotted_to_accepted_mins: number;
  avg_sched_accepted_to_dispatched_mins: number;
  avg_sched_dispatch_to_ofd_mins: number;
  avg_sched_ofd_to_rdl_mins: number;
}

function div(a: number, b: number) { return b > 0 ? a / b : 0; }

function aggregate(days: RawDay[]): Aggregated {
  const zero: Aggregated = {
    num_days: 0, total_orders_sum: 0, avg_daily_orders: 0, avg_daily_riders: 0,
    dp_orders_total: 0, express_orders_total: 0, scheduled_orders_total: 0,
    dp_orders_pct: 0, express_orders_pct: 0, scheduled_orders_pct: 0,
    batched_orders_pct: 0, avg_orders_per_trip: 0, single_order_trips_pct: 0,
    avg_orders_per_de: 0, orders_per_login_hour: 0, trips_per_de: 0,
    dp_batched_pct: 0, express_batched_pct: 0, scheduled_batched_pct: 0,
    overall_sla_pct: 0, scheduled_sla_pct: 0, express_sla_pct: 0,
    dp_sla_pct: 0, p3_sla_pct: 0, avg_breach_mins: 0,
    trip_breach_rate: 0, first_order_breach_pct: 0, last_order_breach_pct: 0, avg_breach_position: 0,
    avg_dp_created_to_picked_mins: 0, avg_dp_picked_to_packed_mins: 0, avg_dp_packed_to_dispatched_mins: 0,
    avg_dp_dispatch_to_ofd_mins: 0, avg_dp_ofd_to_rdl_mins: 0,
    avg_express_created_to_picked_mins: 0, avg_express_picked_to_packed_mins: 0,
    avg_express_packed_to_dispatched_mins: 0, avg_express_dispatch_to_ofd_mins: 0, avg_express_ofd_to_rdl_mins: 0,
    avg_sched_allotted_to_accepted_mins: 0, avg_sched_accepted_to_dispatched_mins: 0,
    avg_sched_dispatch_to_ofd_mins: 0, avg_sched_ofd_to_rdl_mins: 0,
  };
  if (days.length === 0) return zero;

  const n = days.length;
  const s = <K extends keyof RawDay>(k: K) => days.reduce((acc, d) => acc + ((d[k] as number) ?? 0), 0);

  const total_orders         = s("total_orders");
  const total_licious_disp   = s("total_licious_dispatched");
  const total_orders_batched = s("total_orders_batched");
  const total_trips          = s("total_trips");
  const single_order_trips   = s("single_order_trips");
  const total_login_hrs      = s("total_login_hrs");
  const total_de_hc          = s("de_hc");
  const orders_with_rdl      = s("orders_with_rdl");
  const breach_mins_sum      = s("breach_mins_sum");
  const breach_count         = s("breach_count");
  const dp_orders            = s("dp_orders");
  const express_orders       = s("express_orders");
  const scheduled_orders     = s("scheduled_orders");
  const total_licious_sla    = s("total_licious");
  const trip_batched         = s("trip_sla_batched_trips");
  const trip_breached        = s("trip_sla_breached_trips");
  const first_breach         = s("trip_sla_first_order_breach");
  const last_breach          = s("trip_sla_last_order_breach");

  return {
    num_days:              n,
    total_orders_sum:      total_orders,
    avg_daily_orders:      div(total_orders, n),
    avg_daily_riders:      div(total_de_hc, n),

    dp_orders_total:       dp_orders,
    express_orders_total:  express_orders,
    scheduled_orders_total:scheduled_orders,
    dp_orders_pct:         div(dp_orders,        total_licious_sla),
    express_orders_pct:    div(express_orders,   total_licious_sla),
    scheduled_orders_pct:  div(scheduled_orders, total_licious_sla),

    batched_orders_pct:    div(total_orders_batched, total_licious_disp),
    avg_orders_per_trip:   div(total_licious_disp, total_trips),
    single_order_trips_pct:div(single_order_trips, total_trips),
    avg_orders_per_de:     div(total_licious_disp, total_de_hc),
    orders_per_login_hour: div(total_orders, total_login_hrs),
    trips_per_de:          div(total_trips, total_de_hc),

    dp_batched_pct:        div(s("dp_batched"),        dp_orders),
    express_batched_pct:   div(s("express_batched"),   express_orders),
    scheduled_batched_pct: div(s("scheduled_batched"), scheduled_orders),

    overall_sla_pct:       div(s("on_time_orders"),      orders_with_rdl),
    scheduled_sla_pct:     div(s("scheduled_on_time"),   s("scheduled_with_rdl")),
    express_sla_pct:       div(s("express_on_time"),     s("express_with_rdl")),
    dp_sla_pct:            div(s("dp_on_time"),          s("dp_with_rdl")),
    p3_sla_pct:            div(s("p3_on_time"),          s("p3_delivered")),
    avg_breach_mins:       div(breach_mins_sum, breach_count),

    trip_breach_rate:           div(trip_breached, trip_batched),
    first_order_breach_pct:     div(first_breach, trip_breached),
    last_order_breach_pct:      div(last_breach,  trip_breached),
    avg_breach_position:        div(s("trip_sla_breach_pos_sum"), s("trip_sla_breach_pos_cnt")),

    avg_dp_created_to_picked_mins:    div(s("dp_tl_created_to_picked_sum"),    s("dp_tl_created_to_picked_cnt")),
    avg_dp_picked_to_packed_mins:     div(s("dp_tl_picked_to_packed_sum"),     s("dp_tl_picked_to_packed_cnt")),
    avg_dp_packed_to_dispatched_mins: div(s("dp_tl_packed_to_dispatched_sum"), s("dp_tl_packed_to_dispatched_cnt")),
    avg_dp_dispatch_to_ofd_mins:      div(s("dp_tl_dispatch_to_ofd_sum"),      s("dp_tl_dispatch_to_ofd_cnt")),
    avg_dp_ofd_to_rdl_mins:           div(s("dp_tl_ofd_to_rdl_sum"),           s("dp_tl_ofd_to_rdl_cnt")),

    avg_express_created_to_picked_mins:    div(s("express_tl_created_to_picked_sum"),    s("express_tl_created_to_picked_cnt")),
    avg_express_picked_to_packed_mins:     div(s("express_tl_picked_to_packed_sum"),     s("express_tl_picked_to_packed_cnt")),
    avg_express_packed_to_dispatched_mins: div(s("express_tl_packed_to_dispatched_sum"), s("express_tl_packed_to_dispatched_cnt")),
    avg_express_dispatch_to_ofd_mins:      div(s("express_tl_dispatch_to_ofd_sum"),      s("express_tl_dispatch_to_ofd_cnt")),
    avg_express_ofd_to_rdl_mins:           div(s("express_tl_ofd_to_rdl_sum"),           s("express_tl_ofd_to_rdl_cnt")),

    avg_sched_allotted_to_accepted_mins:   div(s("sched_tl_allotted_to_accepted_sum"),   s("sched_tl_allotted_to_accepted_cnt")),
    avg_sched_accepted_to_dispatched_mins: div(s("sched_tl_accepted_to_dispatched_sum"), s("sched_tl_accepted_to_dispatched_cnt")),
    avg_sched_dispatch_to_ofd_mins:        div(s("sched_tl_dispatch_to_ofd_sum"),        s("sched_tl_dispatch_to_ofd_cnt")),
    avg_sched_ofd_to_rdl_mins:             div(s("sched_tl_ofd_to_rdl_sum"),             s("sched_tl_ofd_to_rdl_cnt")),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(v: number, decimals = 1, unit = ""): string {
  if (!isFinite(v)) return "—";
  return `${v.toFixed(decimals)}${unit}`;
}

// ── Comparison table ──────────────────────────────────────────────────────────

interface MetricRow {
  label: string;
  pre: number;
  post: number;
  unit?: string;
  higherIsBetter?: boolean;
  neutral?: boolean;
  decimals?: number;
  warn?: boolean;
}

function ComparisonTable({ rows }: { rows: MetricRow[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 uppercase w-1/2">Metric</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Pre</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Post</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const delta    = row.post - row.pre;
            const pctDelta = row.pre !== 0 ? (delta / Math.abs(row.pre)) * 100 : 0;
            const isGood   = row.neutral ? null : row.higherIsBetter ? delta > 0 : delta < 0;
            const sign     = delta >= 0 ? "+" : "−";
            const u        = row.unit ?? "";
            const dec      = row.decimals ?? 1;

            return (
              <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-700">
                  {row.label}
                  {row.warn && <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">⚠ &gt;25%</span>}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400 text-right tabular-nums">{fmt(row.pre, dec, u)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right tabular-nums">{fmt(row.post, dec, u)}</td>
                <td className="px-4 py-3 text-right">
                  {row.neutral ? (
                    <span className="text-sm text-gray-500 tabular-nums">{sign}{fmt(Math.abs(delta), dec, u)}</span>
                  ) : (
                    <div className="inline-flex flex-col items-end">
                      <span className={`text-sm font-semibold tabular-nums ${isGood ? "text-green-600" : "text-red-500"}`}>
                        {delta >= 0 ? "↑" : "↓"} {sign}{fmt(Math.abs(delta), dec, u)}
                      </span>
                      <span className={`text-[10px] ${isGood ? "text-green-400" : "text-red-400"}`}>
                        {sign}{Math.abs(pctDelta).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Order mix table ───────────────────────────────────────────────────────────

function OrderMixTable({ pre, post }: { pre: Aggregated; post: Aggregated }) {
  const rows = [
    { label: "DP Orders",        preCount: pre.dp_orders_total,         postCount: post.dp_orders_total,         prePct: pre.dp_orders_pct,         postPct: post.dp_orders_pct },
    { label: "Express Orders",   preCount: pre.express_orders_total,    postCount: post.express_orders_total,    prePct: pre.express_orders_pct,    postPct: post.express_orders_pct },
    { label: "Scheduled Orders", preCount: pre.scheduled_orders_total,  postCount: post.scheduled_orders_total,  prePct: pre.scheduled_orders_pct,  postPct: post.scheduled_orders_pct },
  ];
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 uppercase w-1/2">Order Type</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Pre</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Post</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
              <td className="px-4 py-3 text-sm text-gray-700">{row.label}</td>
              <td className="px-4 py-3 text-sm text-gray-400 text-right tabular-nums">
                {row.preCount.toFixed(0)}&nbsp;<span className="text-gray-300">·</span>&nbsp;{(row.prePct * 100).toFixed(1)}%
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right tabular-nums">
                {row.postCount.toFixed(0)}&nbsp;<span className="text-gray-300">·</span>&nbsp;{(row.postPct * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-gray-700 mb-3">{children}</h2>;
}

// ── Chart config ──────────────────────────────────────────────────────────────

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: "10px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  fontSize: 12,
  color: "#111827",
};

// ── Glossary ──────────────────────────────────────────────────────────────────

const GLOSSARY = [
  { term: "DP (Dynamic Promise)",          definition: "Express order with a promise window under 30 min. Identified by wms_order_type = 'EXPRESS' AND expressminutes < 30." },
  { term: "Express",                        definition: "Express order with a promise window of 30 min or more (wms_order_type = 'EXPRESS' AND expressminutes >= 30)." },
  { term: "Scheduled",                      definition: "Scheduled slot order (wms_order_type = 'SCHEDULED'). Created the day before the promise date in WMS." },
  { term: "Batched Orders %",               definition: "Orders that left the hub on a trip with >1 order, as a % of all Licious-dispatched orders. Formula: batched_orders / total_licious_dispatched." },
  { term: "Avg Orders / Trip",              definition: "Total Licious-dispatched orders ÷ total trips. Higher = more efficient batching." },
  { term: "Single-Order Trips %",          definition: "Trips with exactly 1 order as a % of all trips. Lower is better post-autobatching." },
  { term: "Avg Orders / DE",               definition: "Total Licious-dispatched orders ÷ total DE headcount across the selected period." },
  { term: "Orders / Login Hr (OPH)",       definition: "Total orders ÷ total DE login hours. Measures throughput per hour of DE availability." },
  { term: "Trips / DE",                    definition: "Total trips ÷ total DE headcount. Measures how many trips each DE runs on average." },
  { term: "SLA",                            definition: "On-time delivery. Licious fleet: measured at RDL vs promiseddeliverytime. 3P fleet: measured at Delivered timestamp." },
  { term: "RDL (Reached Delivery Location)", definition: "Shipment state when the DE arrives at the customer's location. Used as the SLA event for Licious fleet." },
  { term: "Avg Breach (mins)",             definition: "Average minutes late across all breached orders (rdl_time > promised_delivery_time)." },
  { term: "Trip Breach Rate %",            definition: "% of batched trips (>1 order) where at least one order breached SLA." },
  { term: "First-Order Breach %",          definition: "Of all breached batched trips: % where the breach was the first delivery on the trip." },
  { term: "Last-Order Breach %",           definition: "Of all breached batched trips: % where the breach was the last delivery on the trip." },
  { term: "Avg Breach Position",           definition: "0.0 = breach was first delivery, 1.0 = breach was last delivery. Mid-values indicate mid-trip breaches." },
  { term: "Created→Picked",               definition: "Time from WMS ORDER_CREATED to PICKED status. Covers picklist generation + picker travel + item picking." },
  { term: "Picked→Packed",                definition: "Time from PICKED to PACKED in WMS. Packing station processing time." },
  { term: "Packed→Dispatched",            definition: "Time from PACKED in WMS to DISPATCHED in LMS. Covers staging wait, rider allotment, and OTP acceptance." },
  { term: "Dispatched→OFD",              definition: "Time from LMS DISPATCHED to OUT_FOR_DELIVERY. Hub exit to first customer en route." },
  { term: "OFD→RDL",                     definition: "Time from OUT_FOR_DELIVERY to REACHED_DELIVERY_LOCATION. Travel time to customer doorstep." },
  { term: "Allotted→Accepted (Scheduled)", definition: "Time from RIDER_ALLOTTED to RIDER_ACCEPTED for scheduled orders. Rider OTP acceptance window." },
  { term: "Accepted→Dispatched (Scheduled)", definition: "Time from RIDER_ACCEPTED to DISPATCHED for scheduled orders. Pickup readiness lag." },
  { term: "DE (Delivery Executive)",       definition: "Last-mile delivery rider. Headcount sourced from rider_events login data, filtered to hours with active logins." },
  { term: "Pre Period",                    definition: "Baseline period before autobatching v2 went live. Ends Jun 17. Length matches number of post days — extends backward as post grows." },
  { term: "Post Period",                   definition: "Two phases: Phase 1 Jun 18–21 (initial release), Phase 2 Jul 7+ (re-release). Both tagged 'post'. Jun 22–Jul 6 is a gap (rollback)." },
  { term: "Gap (Jun 22 – Jul 6)",         definition: "Autobatching was rolled back ~Jun 22 due to ground ops issues and re-released Jul 6 night. These days are excluded from all aggregations." },
];

// ── Smart date defaults ───────────────────────────────────────────────────────
// Post = all post days (Jun 18 → yesterday). Pre = same count, same day-of-week
// alignment: preEnd = most recent pre day with same DOW as postEnd;
// preStart = postCount days back from preEnd.
function smartDateDefaults(preDays: RawDay[], postDays: RawDay[]) {
  if (preDays.length === 0 || postDays.length === 0) return {
    preStart:  preDays[0]?.date  ?? "",
    preEnd:    preDays[preDays.length - 1]?.date  ?? "",
    postStart: postDays[0]?.date ?? "",
    postEnd:   postDays[postDays.length - 1]?.date ?? "",
  };

  const postStart = postDays[0].date;
  const postEnd   = postDays[postDays.length - 1].date;
  const postCount = postDays.length;
  const postEndDow = new Date(postEnd + "T00:00:00").getDay(); // 0=Sun…6=Sat

  // Walk backwards through pre days to find the most recent one matching postEnd DOW
  let preEndIdx = preDays.length - 1;
  while (preEndIdx >= 0 && new Date(preDays[preEndIdx].date + "T00:00:00").getDay() !== postEndDow) {
    preEndIdx--;
  }

  if (preEndIdx < 0) {
    // No DOW match found — fall back to full pre range
    return { preStart: preDays[0].date, preEnd: preDays[preDays.length - 1].date, postStart, postEnd };
  }

  const preStartIdx = Math.max(0, preEndIdx - postCount + 1);
  return {
    preStart:  preDays[preStartIdx].date,
    preEnd:    preDays[preEndIdx].date,
    postStart,
    postEnd,
  };
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard({ hub, generated_at, days }: Props) {
  const initPreDays  = days.filter(d => d.period === "pre");
  const initPostDays = days.filter(d => d.period === "post");
  const defaults     = smartDateDefaults(initPreDays, initPostDays);

  const [selectedHub,   setSelectedHub]   = useState<string>(days[0]?.hub ?? hub);
  const [preStart,      setPreStart]      = useState(defaults.preStart);
  const [preEnd,        setPreEnd]        = useState(defaults.preEnd);
  const [postStart,     setPostStart]     = useState(defaults.postStart);
  const [postEnd,       setPostEnd]       = useState(defaults.postEnd);
  const [timelineType,  setTimelineType]  = useState<"dp" | "express" | "scheduled">("dp");
  const [activeTab,     setActiveTab]     = useState<"metrics" | "glossary">("metrics");

  const availableHubs = useMemo(
    () => [...new Set(days.map(d => d.hub).filter(Boolean))].sort(), [days]
  );
  const hubDays     = useMemo(() => days.filter(d => (d.hub ?? hub) === selectedHub), [days, selectedHub, hub]);
  const allPreDays  = useMemo(() => hubDays.filter(d => d.period === "pre"),  [hubDays]);
  const allPostDays = useMemo(() => hubDays.filter(d => d.period === "post"), [hubDays]);

  const preMin  = allPreDays[0]?.date  ?? "";
  const preMax  = allPreDays[allPreDays.length - 1]?.date  ?? "";
  const postMin = allPostDays[0]?.date ?? "";
  const postMax = allPostDays[allPostDays.length - 1]?.date ?? "";

  const selectedPre  = useMemo(() => allPreDays.filter(d => d.date >= preStart && d.date <= preEnd),   [allPreDays, preStart, preEnd]);
  const selectedPost = useMemo(() => allPostDays.filter(d => d.date >= postStart && d.date <= postEnd), [allPostDays, postStart, postEnd]);
  const preAgg  = useMemo(() => aggregate(selectedPre),  [selectedPre]);
  const postAgg = useMemo(() => aggregate(selectedPost), [selectedPost]);

  const ordersWarn = preAgg.avg_daily_orders > 0
    && Math.abs(postAgg.avg_daily_orders - preAgg.avg_daily_orders) / preAgg.avg_daily_orders > 0.25;
  const ridersWarn = preAgg.avg_daily_riders > 0
    && Math.abs(postAgg.avg_daily_riders - preAgg.avg_daily_riders) / preAgg.avg_daily_riders > 0.25;

  // Timeline data per type
  const timelineData = useMemo(() => {
    if (timelineType === "dp") {
      const preTotal  = preAgg.avg_dp_created_to_picked_mins + preAgg.avg_dp_picked_to_packed_mins + preAgg.avg_dp_packed_to_dispatched_mins + preAgg.avg_dp_dispatch_to_ofd_mins + preAgg.avg_dp_ofd_to_rdl_mins;
      const postTotal = postAgg.avg_dp_created_to_picked_mins + postAgg.avg_dp_picked_to_packed_mins + postAgg.avg_dp_packed_to_dispatched_mins + postAgg.avg_dp_dispatch_to_ofd_mins + postAgg.avg_dp_ofd_to_rdl_mins;
      return [
        { stage: "Created→Picked",    pre: +preAgg.avg_dp_created_to_picked_mins.toFixed(1),    post: +postAgg.avg_dp_created_to_picked_mins.toFixed(1) },
        { stage: "Picked→Packed",     pre: +preAgg.avg_dp_picked_to_packed_mins.toFixed(1),     post: +postAgg.avg_dp_picked_to_packed_mins.toFixed(1) },
        { stage: "Packed→Dispatched", pre: +preAgg.avg_dp_packed_to_dispatched_mins.toFixed(1), post: +postAgg.avg_dp_packed_to_dispatched_mins.toFixed(1) },
        { stage: "Dispatched→OFD",    pre: +preAgg.avg_dp_dispatch_to_ofd_mins.toFixed(1),      post: +postAgg.avg_dp_dispatch_to_ofd_mins.toFixed(1) },
        { stage: "OFD→RDL",           pre: +preAgg.avg_dp_ofd_to_rdl_mins.toFixed(1),           post: +postAgg.avg_dp_ofd_to_rdl_mins.toFixed(1) },
        { stage: "Total",             pre: +preTotal.toFixed(1),                                 post: +postTotal.toFixed(1) },
      ];
    }
    if (timelineType === "express") {
      const preTotal  = preAgg.avg_express_created_to_picked_mins + preAgg.avg_express_picked_to_packed_mins + preAgg.avg_express_packed_to_dispatched_mins + preAgg.avg_express_dispatch_to_ofd_mins + preAgg.avg_express_ofd_to_rdl_mins;
      const postTotal = postAgg.avg_express_created_to_picked_mins + postAgg.avg_express_picked_to_packed_mins + postAgg.avg_express_packed_to_dispatched_mins + postAgg.avg_express_dispatch_to_ofd_mins + postAgg.avg_express_ofd_to_rdl_mins;
      return [
        { stage: "Created→Picked",    pre: +preAgg.avg_express_created_to_picked_mins.toFixed(1),    post: +postAgg.avg_express_created_to_picked_mins.toFixed(1) },
        { stage: "Picked→Packed",     pre: +preAgg.avg_express_picked_to_packed_mins.toFixed(1),     post: +postAgg.avg_express_picked_to_packed_mins.toFixed(1) },
        { stage: "Packed→Dispatched", pre: +preAgg.avg_express_packed_to_dispatched_mins.toFixed(1), post: +postAgg.avg_express_packed_to_dispatched_mins.toFixed(1) },
        { stage: "Dispatched→OFD",    pre: +preAgg.avg_express_dispatch_to_ofd_mins.toFixed(1),      post: +postAgg.avg_express_dispatch_to_ofd_mins.toFixed(1) },
        { stage: "OFD→RDL",           pre: +preAgg.avg_express_ofd_to_rdl_mins.toFixed(1),           post: +postAgg.avg_express_ofd_to_rdl_mins.toFixed(1) },
        { stage: "Total",             pre: +preTotal.toFixed(1),                                      post: +postTotal.toFixed(1) },
      ];
    }
    // scheduled
    const preTotal  = preAgg.avg_sched_allotted_to_accepted_mins + preAgg.avg_sched_accepted_to_dispatched_mins + preAgg.avg_sched_dispatch_to_ofd_mins + preAgg.avg_sched_ofd_to_rdl_mins;
    const postTotal = postAgg.avg_sched_allotted_to_accepted_mins + postAgg.avg_sched_accepted_to_dispatched_mins + postAgg.avg_sched_dispatch_to_ofd_mins + postAgg.avg_sched_ofd_to_rdl_mins;
    return [
      { stage: "Allotted→Accepted",   pre: +preAgg.avg_sched_allotted_to_accepted_mins.toFixed(1),   post: +postAgg.avg_sched_allotted_to_accepted_mins.toFixed(1) },
      { stage: "Accepted→Dispatched", pre: +preAgg.avg_sched_accepted_to_dispatched_mins.toFixed(1), post: +postAgg.avg_sched_accepted_to_dispatched_mins.toFixed(1) },
      { stage: "Dispatched→OFD",      pre: +preAgg.avg_sched_dispatch_to_ofd_mins.toFixed(1),        post: +postAgg.avg_sched_dispatch_to_ofd_mins.toFixed(1) },
      { stage: "OFD→RDL",             pre: +preAgg.avg_sched_ofd_to_rdl_mins.toFixed(1),             post: +postAgg.avg_sched_ofd_to_rdl_mins.toFixed(1) },
      { stage: "Total",               pre: +preTotal.toFixed(1),                                      post: +postTotal.toFixed(1) },
    ];
  }, [timelineType, preAgg, postAgg]);

  // Refresh banner
  const refreshLabel = useMemo(() => {
    if (!generated_at) return null;
    const d = new Date(generated_at);
    if (isNaN(d.getTime())) return null;
    const dd   = d.getDate().toString().padStart(2, "0");
    const mm   = (d.getMonth() + 1).toString().padStart(2, "0");
    const hh   = d.getHours().toString().padStart(2, "0");
    const min  = d.getMinutes().toString().padStart(2, "0");
    return `${dd}/${mm} ${hh}:${min}`;
  }, [generated_at]);

  const inputCls   = "bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-gray-400 shadow-sm";
  const typeBtnCls = (t: string) =>
    `px-3 py-1 text-xs font-semibold rounded-full transition-colors ${timelineType === t ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400"}`;
  const tabCls = (t: string) =>
    `px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === t ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`;

  return (
    <div className="min-h-screen bg-zinc-100 p-6">

      {/* Header row: title + refresh */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Autobatching v2
          </h1>
          <p className="text-sm text-gray-500 mt-1">Pre vs Post impact · {hub}</p>
        </div>
        {refreshLabel && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse inline-block" />
            <span className="text-xs text-blue-700 font-medium">Data refreshed at {refreshLabel}</span>
          </div>
        )}
      </div>

      {/* Filters — single row, left-aligned */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Hub</span>
          <select value={selectedHub} onChange={e => setSelectedHub(e.target.value)} className={inputCls}>
            {availableHubs.length > 0
              ? availableHubs.map(h => <option key={h} value={h}>{h}</option>)
              : <option value={hub}>{hub}</option>}
          </select>
        </div>
        <span className="text-gray-200 text-sm">|</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Pre</span>
          <input type="date" value={preStart} min={preMin} max={preEnd}   onChange={e => setPreStart(e.target.value)} className={inputCls} />
          <span className="text-gray-300 text-sm">→</span>
          <input type="date" value={preEnd}   min={preStart} max={preMax} onChange={e => setPreEnd(e.target.value)}   className={inputCls} />
        </div>
        <span className="text-gray-200 text-sm">|</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Post</span>
          <input type="date" value={postStart} min={postMin} max={postEnd}   onChange={e => setPostStart(e.target.value)} className={inputCls} />
          <span className="text-gray-300 text-sm">→</span>
          <input type="date" value={postEnd}   min={postStart} max={postMax} onChange={e => setPostEnd(e.target.value)}   className={inputCls} />
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-6">
        <button className={tabCls("metrics")}  onClick={() => setActiveTab("metrics")}>Metrics</button>
        <button className={tabCls("glossary")} onClick={() => setActiveTab("glossary")}>Glossary</button>
      </div>

      {activeTab === "glossary" ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 uppercase w-1/3">Term</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Definition</th>
              </tr>
            </thead>
            <tbody>
              {GLOSSARY.map((g, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800 align-top">{g.term}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 align-top">{g.definition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {/* Comparability */}
          <div className="mb-5">
            <SectionHeader>Comparability</SectionHeader>
            <ComparisonTable rows={[
              { label: "Days",             pre: preAgg.num_days,            post: postAgg.num_days,            neutral: true, decimals: 0 },
              { label: "Total Orders",     pre: preAgg.total_orders_sum,    post: postAgg.total_orders_sum,    neutral: true, decimals: 0 },
              { label: "Avg Daily Orders", pre: preAgg.avg_daily_orders,    post: postAgg.avg_daily_orders,    neutral: true, decimals: 1, warn: ordersWarn },
              { label: "Avg Daily DEs",   pre: preAgg.avg_daily_riders,    post: postAgg.avg_daily_riders,    neutral: true, decimals: 1, warn: ridersWarn },
            ]} />
          </div>

          {/* Order Mix */}
          <div className="mb-5">
            <SectionHeader>Order Mix · Count &amp; Share of Dispatched Licious Orders</SectionHeader>
            <OrderMixTable pre={preAgg} post={postAgg} />
          </div>

          {/* Batch Metrics */}
          <div className="mb-5">
            <SectionHeader>Batch Metrics — Success Signal</SectionHeader>
            <ComparisonTable rows={[
              { label: "Batched Orders %",        pre: preAgg.batched_orders_pct * 100,    post: postAgg.batched_orders_pct * 100,    unit: "%", higherIsBetter: true,  decimals: 1 },
              { label: "Avg Orders / Trip",       pre: preAgg.avg_orders_per_trip,          post: postAgg.avg_orders_per_trip,          higherIsBetter: true,  decimals: 2 },
              { label: "Single-Order Trips %",    pre: preAgg.single_order_trips_pct * 100, post: postAgg.single_order_trips_pct * 100, unit: "%", higherIsBetter: false, decimals: 1 },
              { label: "Avg Orders / DE",         pre: preAgg.avg_orders_per_de,            post: postAgg.avg_orders_per_de,            higherIsBetter: true,  decimals: 1 },
              { label: "Orders / Login Hr (OPH)", pre: preAgg.orders_per_login_hour,        post: postAgg.orders_per_login_hour,        higherIsBetter: true,  decimals: 2 },
              { label: "Trips / DE",              pre: preAgg.trips_per_de,                 post: postAgg.trips_per_de,                 higherIsBetter: true,  decimals: 2 },
            ]} />
          </div>

          {/* Batching by Order Type */}
          <div className="mb-5">
            <SectionHeader>Batching by Order Type · % of Orders Batched</SectionHeader>
            <ComparisonTable rows={[
              { label: "DP Batched %",        pre: preAgg.dp_batched_pct * 100,        post: postAgg.dp_batched_pct * 100,        unit: "%", higherIsBetter: true, decimals: 1 },
              { label: "Express Batched %",   pre: preAgg.express_batched_pct * 100,   post: postAgg.express_batched_pct * 100,   unit: "%", higherIsBetter: true, decimals: 1 },
              { label: "Scheduled Batched %", pre: preAgg.scheduled_batched_pct * 100, post: postAgg.scheduled_batched_pct * 100, unit: "%", higherIsBetter: true, decimals: 1 },
            ]} />
          </div>

          {/* SLA */}
          <div className="mb-5">
            <SectionHeader>SLA — Check Signal · Licious at RDL · 3P at Delivered</SectionHeader>
            <ComparisonTable rows={[
              { label: "Overall SLA %",           pre: preAgg.overall_sla_pct * 100,   post: postAgg.overall_sla_pct * 100,   unit: "%", higherIsBetter: true,  decimals: 1 },
              { label: "DP SLA %",                pre: preAgg.dp_sla_pct * 100,        post: postAgg.dp_sla_pct * 100,        unit: "%", higherIsBetter: true,  decimals: 1 },
              { label: "Express SLA %",           pre: preAgg.express_sla_pct * 100,   post: postAgg.express_sla_pct * 100,   unit: "%", higherIsBetter: true,  decimals: 1 },
              { label: "Scheduled SLA %",         pre: preAgg.scheduled_sla_pct * 100, post: postAgg.scheduled_sla_pct * 100, unit: "%", higherIsBetter: true,  decimals: 1 },
              { label: "3P SLA % (at Delivered)", pre: preAgg.p3_sla_pct * 100,       post: postAgg.p3_sla_pct * 100,        unit: "%", higherIsBetter: true,  decimals: 1 },
              { label: "Avg Breach (mins)",       pre: preAgg.avg_breach_mins,          post: postAgg.avg_breach_mins,         higherIsBetter: false, decimals: 1 },
            ]} />
          </div>

          {/* Trip-level SLA */}
          <div className="mb-5">
            <SectionHeader>Trip-level SLA · Batched Trips · Trip Breached if Any Order Breached</SectionHeader>
            <ComparisonTable rows={[
              { label: "Trip Breach Rate %",                        pre: preAgg.trip_breach_rate * 100,       post: postAgg.trip_breach_rate * 100,       unit: "%", higherIsBetter: false, decimals: 1 },
              { label: "First-Order Breach % (of breached trips)",  pre: preAgg.first_order_breach_pct * 100, post: postAgg.first_order_breach_pct * 100, unit: "%", neutral: true, decimals: 1 },
              { label: "Last-Order Breach % (of breached trips)",   pre: preAgg.last_order_breach_pct * 100,  post: postAgg.last_order_breach_pct * 100,  unit: "%", neutral: true, decimals: 1 },
              { label: "Avg Breach Position (0=first, 1=last)",     pre: preAgg.avg_breach_position,          post: postAgg.avg_breach_position,          neutral: true, decimals: 2 },
            ]} />
          </div>

          {/* Order Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <SectionHeader>Order Timeline · Avg Mins per Stage</SectionHeader>
              <div className="flex gap-1.5">
                <button className={typeBtnCls("dp")}        onClick={() => setTimelineType("dp")}>DP</button>
                <button className={typeBtnCls("express")}   onClick={() => setTimelineType("express")}>Express</button>
                <button className={typeBtnCls("scheduled")} onClick={() => setTimelineType("scheduled")}>Scheduled</button>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timelineData} margin={{ top: 22, right: 16, left: -8, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `${v}m`} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)} mins`]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 10, color: "#6B7280" }} />
                  <Bar dataKey="pre"  name="Pre"  fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={28}>
                    <LabelList dataKey="pre"  position="top" style={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }} formatter={(v) => `${v}m`} />
                  </Bar>
                  <Bar dataKey="post" name="Post" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={28}>
                    <LabelList dataKey="post" position="top" style={{ fontSize: 10, fill: "#2563EB", fontWeight: 600 }} formatter={(v) => `${v}m`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
