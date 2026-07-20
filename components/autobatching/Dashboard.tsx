"use client";

import { useState, useMemo, Fragment } from "react";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
} from "recharts";
import type { RawDay, DelayDay } from "@/lib/autobatching";
import { Abbr } from "@/components/ui/Abbr";
import { COLOR_CTRL, COLOR_POST } from "@/lib/theme";
import { useChartTheme } from "@/lib/useChartTheme";
import { DashboardLayout } from "@/components/ui/DashboardLayout";
import { DashboardHeader } from "@/components/ui/DashboardHeader";
import { TimelineContent } from "@/components/autobatching/Timeline";

interface Props {
  hub: string;
  pre_range: string;
  generated_at: string;
  days: RawDay[];
  delayReasons?: { days: DelayDay[] };
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
  // SLA (DEL-based)
  overall_sla_pct: number;
  scheduled_sla_pct: number;
  express_sla_pct: number;
  dp_sla_pct: number;
  p3_sla_pct: number;
  avg_breach_mins: number;
  batched_sla_pct: number;
  batched_on_time_count: number;
  batched_with_rdl_count: number;
  avg_batched_breach_mins: number;
  avg_breach_p50_mins: number;
  avg_batched_breach_p50_mins: number;
  // SLA (RDL-based)
  overall_sla_pct_rdl: number;
  scheduled_sla_pct_rdl: number;
  express_sla_pct_rdl: number;
  dp_sla_pct_rdl: number;
  batched_sla_pct_rdl: number;
  overall_on_time_rdl_count: number;
  dp_on_time_rdl_count: number;
  express_on_time_rdl_count: number;
  scheduled_on_time_rdl_count: number;
  batched_on_time_rdl_count: number;
  // Trip SLA (DEL)
  trip_batched_count: number;
  trip_breached_count: number;
  trip_breach_rate: number;
  first_order_breach_pct: number;
  last_order_breach_pct: number;
  avg_breach_position: number;
  // Trip SLA (RDL)
  trip_breached_count_rdl: number;
  trip_breach_rate_rdl: number;
  first_order_breach_pct_rdl: number;
  last_order_breach_pct_rdl: number;
  avg_breach_position_rdl: number;
  // OD (3P fleet)
  total_3p_orders: number;
  avg_daily_3p_orders: number;
  // Express sub-buckets
  ex_30_45_orders_total: number;
  ex_30_45_sla_pct: number;
  ex_45_60_orders_total: number;
  ex_45_60_sla_pct: number;
  ex_60_90_orders_total: number;
  ex_60_90_sla_pct: number;
  ex_90p_orders_total: number;
  ex_90p_sla_pct: number;
  // Batching by type — absolute counts
  dp_batched_count: number;
  express_batched_count: number;
  scheduled_batched_count: number;
  // SLA — absolute counts (for order count display)
  overall_on_time_count: number;
  overall_with_rdl_count: number;
  dp_on_time_count: number;
  dp_with_rdl_count: number;
  express_on_time_count: number;
  express_with_rdl_count: number;
  scheduled_on_time_count: number;
  scheduled_with_rdl_count: number;
  p3_on_time_count: number;
  p3_delivered_count: number;
  // Batch metrics — absolute counts
  total_orders_batched_count: number;
  total_licious_dispatched_count: number;
  total_trips_count: number;
  // DP timeline — avg
  avg_dp_created_to_picked_mins: number;
  avg_dp_picked_to_packed_mins: number;
  avg_dp_packed_to_allotted_mins: number;
  avg_dp_allotted_to_accepted_mins: number;
  avg_dp_accepted_to_dispatch_mins: number;
  avg_dp_dispatch_to_ofd_mins: number;
  avg_dp_ofd_to_rdl_mins: number;
  avg_dp_rdl_to_del_mins: number;
  // DP timeline — p50/p90 (weighted avg of daily percentiles)
  p50_dp_created_to_picked_mins: number;
  p50_dp_picked_to_packed_mins: number;
  p50_dp_packed_to_allotted_mins: number;
  p50_dp_allotted_to_accepted_mins: number;
  p50_dp_accepted_to_dispatch_mins: number;
  p50_dp_dispatch_to_ofd_mins: number;
  p50_dp_ofd_to_rdl_mins: number;
  p50_dp_rdl_to_del_mins: number;
  p90_dp_created_to_picked_mins: number;
  p90_dp_picked_to_packed_mins: number;
  p90_dp_packed_to_allotted_mins: number;
  p90_dp_allotted_to_accepted_mins: number;
  p90_dp_accepted_to_dispatch_mins: number;
  p90_dp_dispatch_to_ofd_mins: number;
  p90_dp_ofd_to_rdl_mins: number;
  p90_dp_rdl_to_del_mins: number;
  // DP timeline — cnt for null detection
  dp_rdl_to_del_total_cnt: number;
  // Express timeline — avg
  avg_express_created_to_picked_mins: number;
  avg_express_picked_to_packed_mins: number;
  avg_express_packed_to_allotted_mins: number;
  avg_express_allotted_to_accepted_mins: number;
  avg_express_accepted_to_dispatch_mins: number;
  avg_express_dispatch_to_ofd_mins: number;
  avg_express_ofd_to_rdl_mins: number;
  avg_express_rdl_to_del_mins: number;
  // Express timeline — p50/p90
  p50_express_created_to_picked_mins: number;
  p50_express_picked_to_packed_mins: number;
  p50_express_packed_to_allotted_mins: number;
  p50_express_allotted_to_accepted_mins: number;
  p50_express_accepted_to_dispatch_mins: number;
  p50_express_dispatch_to_ofd_mins: number;
  p50_express_ofd_to_rdl_mins: number;
  p50_express_rdl_to_del_mins: number;
  p90_express_created_to_picked_mins: number;
  p90_express_picked_to_packed_mins: number;
  p90_express_packed_to_allotted_mins: number;
  p90_express_allotted_to_accepted_mins: number;
  p90_express_accepted_to_dispatch_mins: number;
  p90_express_dispatch_to_ofd_mins: number;
  p90_express_ofd_to_rdl_mins: number;
  p90_express_rdl_to_del_mins: number;
  express_rdl_to_del_total_cnt: number;
  // Scheduled timeline — avg
  avg_sched_allotted_to_accepted_mins: number;
  avg_sched_accepted_to_dispatched_mins: number;
  avg_sched_dispatch_to_ofd_mins: number;
  avg_sched_ofd_to_rdl_mins: number;
  avg_sched_rdl_to_del_mins: number;
  // Scheduled timeline — p50/p90
  p50_sched_allotted_to_accepted_mins: number;
  p50_sched_accepted_to_dispatched_mins: number;
  p50_sched_dispatch_to_ofd_mins: number;
  p50_sched_ofd_to_rdl_mins: number;
  p50_sched_rdl_to_del_mins: number;
  p90_sched_allotted_to_accepted_mins: number;
  p90_sched_accepted_to_dispatched_mins: number;
  p90_sched_dispatch_to_ofd_mins: number;
  p90_sched_ofd_to_rdl_mins: number;
  p90_sched_rdl_to_del_mins: number;
  sched_rdl_to_del_total_cnt: number;
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
    dp_batched_count: 0, express_batched_count: 0, scheduled_batched_count: 0,
    overall_sla_pct: 0, scheduled_sla_pct: 0, express_sla_pct: 0,
    dp_sla_pct: 0, p3_sla_pct: 0, avg_breach_mins: 0,
    batched_sla_pct: 0, batched_on_time_count: 0, batched_with_rdl_count: 0,
    avg_batched_breach_mins: 0, avg_breach_p50_mins: 0, avg_batched_breach_p50_mins: 0,
    overall_sla_pct_rdl: 0, scheduled_sla_pct_rdl: 0, express_sla_pct_rdl: 0,
    dp_sla_pct_rdl: 0, batched_sla_pct_rdl: 0,
    overall_on_time_rdl_count: 0, dp_on_time_rdl_count: 0,
    express_on_time_rdl_count: 0, scheduled_on_time_rdl_count: 0, batched_on_time_rdl_count: 0,
    overall_on_time_count: 0, overall_with_rdl_count: 0,
    dp_on_time_count: 0, dp_with_rdl_count: 0,
    express_on_time_count: 0, express_with_rdl_count: 0,
    scheduled_on_time_count: 0, scheduled_with_rdl_count: 0,
    p3_on_time_count: 0, p3_delivered_count: 0,
    total_orders_batched_count: 0, total_licious_dispatched_count: 0, total_trips_count: 0,
    trip_batched_count: 0, trip_breached_count: 0,
    trip_breach_rate: 0, first_order_breach_pct: 0, last_order_breach_pct: 0, avg_breach_position: 0,
    trip_breached_count_rdl: 0, trip_breach_rate_rdl: 0,
    first_order_breach_pct_rdl: 0, last_order_breach_pct_rdl: 0, avg_breach_position_rdl: 0,
    total_3p_orders: 0, avg_daily_3p_orders: 0,
    ex_30_45_orders_total: 0, ex_30_45_sla_pct: 0,
    ex_45_60_orders_total: 0, ex_45_60_sla_pct: 0,
    ex_60_90_orders_total: 0, ex_60_90_sla_pct: 0,
    ex_90p_orders_total: 0,   ex_90p_sla_pct: 0,
    avg_dp_created_to_picked_mins: 0, avg_dp_picked_to_packed_mins: 0,
    avg_dp_packed_to_allotted_mins: 0, avg_dp_allotted_to_accepted_mins: 0, avg_dp_accepted_to_dispatch_mins: 0,
    avg_dp_dispatch_to_ofd_mins: 0, avg_dp_ofd_to_rdl_mins: 0, avg_dp_rdl_to_del_mins: 0,
    p50_dp_created_to_picked_mins: 0, p50_dp_picked_to_packed_mins: 0,
    p50_dp_packed_to_allotted_mins: 0, p50_dp_allotted_to_accepted_mins: 0, p50_dp_accepted_to_dispatch_mins: 0,
    p50_dp_dispatch_to_ofd_mins: 0, p50_dp_ofd_to_rdl_mins: 0, p50_dp_rdl_to_del_mins: 0,
    p90_dp_created_to_picked_mins: 0, p90_dp_picked_to_packed_mins: 0,
    p90_dp_packed_to_allotted_mins: 0, p90_dp_allotted_to_accepted_mins: 0, p90_dp_accepted_to_dispatch_mins: 0,
    p90_dp_dispatch_to_ofd_mins: 0, p90_dp_ofd_to_rdl_mins: 0, p90_dp_rdl_to_del_mins: 0,
    dp_rdl_to_del_total_cnt: 0,
    avg_express_created_to_picked_mins: 0, avg_express_picked_to_packed_mins: 0,
    avg_express_packed_to_allotted_mins: 0, avg_express_allotted_to_accepted_mins: 0, avg_express_accepted_to_dispatch_mins: 0,
    avg_express_dispatch_to_ofd_mins: 0, avg_express_ofd_to_rdl_mins: 0, avg_express_rdl_to_del_mins: 0,
    p50_express_created_to_picked_mins: 0, p50_express_picked_to_packed_mins: 0,
    p50_express_packed_to_allotted_mins: 0, p50_express_allotted_to_accepted_mins: 0, p50_express_accepted_to_dispatch_mins: 0,
    p50_express_dispatch_to_ofd_mins: 0, p50_express_ofd_to_rdl_mins: 0, p50_express_rdl_to_del_mins: 0,
    p90_express_created_to_picked_mins: 0, p90_express_picked_to_packed_mins: 0,
    p90_express_packed_to_allotted_mins: 0, p90_express_allotted_to_accepted_mins: 0, p90_express_accepted_to_dispatch_mins: 0,
    p90_express_dispatch_to_ofd_mins: 0, p90_express_ofd_to_rdl_mins: 0, p90_express_rdl_to_del_mins: 0,
    express_rdl_to_del_total_cnt: 0,
    avg_sched_allotted_to_accepted_mins: 0, avg_sched_accepted_to_dispatched_mins: 0,
    avg_sched_dispatch_to_ofd_mins: 0, avg_sched_ofd_to_rdl_mins: 0, avg_sched_rdl_to_del_mins: 0,
    p50_sched_allotted_to_accepted_mins: 0, p50_sched_accepted_to_dispatched_mins: 0,
    p50_sched_dispatch_to_ofd_mins: 0, p50_sched_ofd_to_rdl_mins: 0, p50_sched_rdl_to_del_mins: 0,
    p90_sched_allotted_to_accepted_mins: 0, p90_sched_accepted_to_dispatched_mins: 0,
    p90_sched_dispatch_to_ofd_mins: 0, p90_sched_ofd_to_rdl_mins: 0, p90_sched_rdl_to_del_mins: 0,
    sched_rdl_to_del_total_cnt: 0,
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
  const trip_batched             = s("trip_sla_batched_trips");
  const trip_breached            = s("trip_sla_breached_trips");
  const first_breach             = s("trip_sla_first_order_breach");
  const last_breach              = s("trip_sla_last_order_breach");
  const trip_breached_rdl        = s("trip_sla_breached_trips_rdl");
  const first_breach_rdl         = s("trip_sla_first_order_breach_rdl");
  const last_breach_rdl          = s("trip_sla_last_order_breach_rdl");

  // Weighted avg of daily percentiles: sum(p * cnt) / sum(cnt)
  const wp = (pKey: keyof RawDay, wKey: keyof RawDay) =>
    div(days.reduce((acc, d) => acc + ((d[pKey] as number) ?? 0) * ((d[wKey] as number) ?? 0), 0), s(wKey));

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
    dp_batched_count:      s("dp_batched"),
    express_batched_count: s("express_batched"),
    scheduled_batched_count: s("scheduled_batched"),

    overall_sla_pct:       div(s("on_time_orders"),      orders_with_rdl),
    scheduled_sla_pct:     div(s("scheduled_on_time"),   s("scheduled_with_rdl")),
    express_sla_pct:       div(s("express_on_time"),     s("express_with_rdl")),
    dp_sla_pct:            div(s("dp_on_time"),          s("dp_with_rdl")),
    p3_sla_pct:            div(s("p3_on_time"),          s("p3_delivered")),
    avg_breach_mins:       div(breach_mins_sum, breach_count),
    batched_sla_pct:             div(s("batched_on_time"),          s("batched_with_rdl")),
    batched_on_time_count:       s("batched_on_time"),
    batched_with_rdl_count:      s("batched_with_rdl"),
    overall_sla_pct_rdl:       div(s("on_time_rdl"),          s("orders_with_rdl_ts")),
    scheduled_sla_pct_rdl:     div(s("scheduled_on_time_rdl"), s("scheduled_with_rdl_ts")),
    express_sla_pct_rdl:       div(s("express_on_time_rdl"),   s("express_with_rdl_ts")),
    dp_sla_pct_rdl:            div(s("dp_on_time_rdl"),        s("dp_with_rdl_ts")),
    batched_sla_pct_rdl:       div(s("batched_on_time_rdl"),   s("batched_with_rdl_ts")),
    overall_on_time_rdl_count:     s("on_time_rdl"),
    dp_on_time_rdl_count:          s("dp_on_time_rdl"),
    express_on_time_rdl_count:     s("express_on_time_rdl"),
    scheduled_on_time_rdl_count:   s("scheduled_on_time_rdl"),
    batched_on_time_rdl_count:     s("batched_on_time_rdl"),
    avg_batched_breach_mins:     div(s("batched_breach_mins_sum"),  s("batched_breach_count")),
    avg_breach_p50_mins:         div(s("breach_p50_mins"),          n),
    avg_batched_breach_p50_mins: div(s("batched_breach_p50_mins"),  n),
    overall_on_time_count:     s("on_time_orders"),
    overall_with_rdl_count:    orders_with_rdl,
    dp_on_time_count:          s("dp_on_time"),
    dp_with_rdl_count:         s("dp_with_rdl"),
    express_on_time_count:     s("express_on_time"),
    express_with_rdl_count:    s("express_with_rdl"),
    scheduled_on_time_count:   s("scheduled_on_time"),
    scheduled_with_rdl_count:  s("scheduled_with_rdl"),
    p3_on_time_count:          s("p3_on_time"),
    p3_delivered_count:        s("p3_delivered"),
    total_orders_batched_count:     total_orders_batched,
    total_licious_dispatched_count: total_licious_disp,
    total_trips_count:              total_trips,

    trip_batched_count:           trip_batched,
    trip_breached_count:          trip_breached,
    trip_breach_rate:             div(trip_breached, trip_batched),
    first_order_breach_pct:       div(first_breach, trip_breached),
    last_order_breach_pct:        div(last_breach,  trip_breached),
    avg_breach_position:          div(s("trip_sla_breach_pos_sum"), s("trip_sla_breach_pos_cnt")),
    trip_breached_count_rdl:      trip_breached_rdl,
    trip_breach_rate_rdl:         div(trip_breached_rdl, trip_batched),
    first_order_breach_pct_rdl:   div(first_breach_rdl, trip_breached_rdl),
    last_order_breach_pct_rdl:    div(last_breach_rdl,  trip_breached_rdl),
    avg_breach_position_rdl:      div(s("trip_sla_breach_pos_sum_rdl"), s("trip_sla_breach_pos_cnt_rdl")),

    total_3p_orders:       s("dispatched_3p"),
    avg_daily_3p_orders:   div(s("dispatched_3p"), n),

    ex_30_45_orders_total: s("ex_30_45_orders"),
    ex_30_45_sla_pct:      div(s("ex_30_45_on_time"), s("ex_30_45_with_rdl")),
    ex_45_60_orders_total: s("ex_45_60_orders"),
    ex_45_60_sla_pct:      div(s("ex_45_60_on_time"), s("ex_45_60_with_rdl")),
    ex_60_90_orders_total: s("ex_60_90_orders"),
    ex_60_90_sla_pct:      div(s("ex_60_90_on_time"), s("ex_60_90_with_rdl")),
    ex_90p_orders_total:   s("ex_90p_orders"),
    ex_90p_sla_pct:        div(s("ex_90p_on_time"),   s("ex_90p_with_rdl")),

    avg_dp_created_to_picked_mins:       div(s("dp_tl_created_to_picked_sum"),       s("dp_tl_created_to_picked_cnt")),
    avg_dp_picked_to_packed_mins:        div(s("dp_tl_picked_to_packed_sum"),        s("dp_tl_picked_to_packed_cnt")),
    avg_dp_packed_to_allotted_mins:      div(s("dp_tl_packed_to_allotted_sum"),      s("dp_tl_packed_to_allotted_cnt")),
    avg_dp_allotted_to_accepted_mins:    div(s("dp_tl_allotted_to_accepted_sum"),    s("dp_tl_allotted_to_accepted_cnt")),
    avg_dp_accepted_to_dispatch_mins:    div(s("dp_tl_accepted_to_dispatch_sum"),    s("dp_tl_accepted_to_dispatch_cnt")),
    avg_dp_dispatch_to_ofd_mins:         div(s("dp_tl_dispatch_to_ofd_sum"),         s("dp_tl_dispatch_to_ofd_cnt")),
    avg_dp_ofd_to_rdl_mins:              div(s("dp_tl_ofd_to_rdl_sum"),              s("dp_tl_ofd_to_rdl_cnt")),
    avg_dp_rdl_to_del_mins:              div(s("dp_tl_rdl_to_del_sum"),              s("dp_tl_rdl_to_del_cnt")),

    p50_dp_created_to_picked_mins:       wp("dp_tl_created_to_picked_p50",       "dp_tl_created_to_picked_cnt"),
    p50_dp_picked_to_packed_mins:        wp("dp_tl_picked_to_packed_p50",        "dp_tl_picked_to_packed_cnt"),
    p50_dp_packed_to_allotted_mins:      wp("dp_tl_packed_to_allotted_p50",      "dp_tl_packed_to_allotted_cnt"),
    p50_dp_allotted_to_accepted_mins:    wp("dp_tl_allotted_to_accepted_p50",    "dp_tl_allotted_to_accepted_cnt"),
    p50_dp_accepted_to_dispatch_mins:    wp("dp_tl_accepted_to_dispatch_p50",    "dp_tl_accepted_to_dispatch_cnt"),
    p50_dp_dispatch_to_ofd_mins:         wp("dp_tl_dispatch_to_ofd_p50",         "dp_tl_dispatch_to_ofd_cnt"),
    p50_dp_ofd_to_rdl_mins:              wp("dp_tl_ofd_to_rdl_p50",              "dp_tl_ofd_to_rdl_cnt"),
    p50_dp_rdl_to_del_mins:              wp("dp_tl_rdl_to_del_p50",              "dp_tl_rdl_to_del_cnt"),
    p90_dp_created_to_picked_mins:       wp("dp_tl_created_to_picked_p90",       "dp_tl_created_to_picked_cnt"),
    p90_dp_picked_to_packed_mins:        wp("dp_tl_picked_to_packed_p90",        "dp_tl_picked_to_packed_cnt"),
    p90_dp_packed_to_allotted_mins:      wp("dp_tl_packed_to_allotted_p90",      "dp_tl_packed_to_allotted_cnt"),
    p90_dp_allotted_to_accepted_mins:    wp("dp_tl_allotted_to_accepted_p90",    "dp_tl_allotted_to_accepted_cnt"),
    p90_dp_accepted_to_dispatch_mins:    wp("dp_tl_accepted_to_dispatch_p90",    "dp_tl_accepted_to_dispatch_cnt"),
    p90_dp_dispatch_to_ofd_mins:         wp("dp_tl_dispatch_to_ofd_p90",         "dp_tl_dispatch_to_ofd_cnt"),
    p90_dp_ofd_to_rdl_mins:              wp("dp_tl_ofd_to_rdl_p90",              "dp_tl_ofd_to_rdl_cnt"),
    p90_dp_rdl_to_del_mins:              wp("dp_tl_rdl_to_del_p90",              "dp_tl_rdl_to_del_cnt"),
    dp_rdl_to_del_total_cnt:             s("dp_tl_rdl_to_del_cnt"),

    avg_express_created_to_picked_mins:       div(s("express_tl_created_to_picked_sum"),       s("express_tl_created_to_picked_cnt")),
    avg_express_picked_to_packed_mins:        div(s("express_tl_picked_to_packed_sum"),        s("express_tl_picked_to_packed_cnt")),
    avg_express_packed_to_allotted_mins:      div(s("express_tl_packed_to_allotted_sum"),      s("express_tl_packed_to_allotted_cnt")),
    avg_express_allotted_to_accepted_mins:    div(s("express_tl_allotted_to_accepted_sum"),    s("express_tl_allotted_to_accepted_cnt")),
    avg_express_accepted_to_dispatch_mins:    div(s("express_tl_accepted_to_dispatch_sum"),    s("express_tl_accepted_to_dispatch_cnt")),
    avg_express_dispatch_to_ofd_mins:         div(s("express_tl_dispatch_to_ofd_sum"),         s("express_tl_dispatch_to_ofd_cnt")),
    avg_express_ofd_to_rdl_mins:              div(s("express_tl_ofd_to_rdl_sum"),              s("express_tl_ofd_to_rdl_cnt")),
    avg_express_rdl_to_del_mins:              div(s("express_tl_rdl_to_del_sum"),              s("express_tl_rdl_to_del_cnt")),

    p50_express_created_to_picked_mins:       wp("express_tl_created_to_picked_p50",       "express_tl_created_to_picked_cnt"),
    p50_express_picked_to_packed_mins:        wp("express_tl_picked_to_packed_p50",        "express_tl_picked_to_packed_cnt"),
    p50_express_packed_to_allotted_mins:      wp("express_tl_packed_to_allotted_p50",      "express_tl_packed_to_allotted_cnt"),
    p50_express_allotted_to_accepted_mins:    wp("express_tl_allotted_to_accepted_p50",    "express_tl_allotted_to_accepted_cnt"),
    p50_express_accepted_to_dispatch_mins:    wp("express_tl_accepted_to_dispatch_p50",    "express_tl_accepted_to_dispatch_cnt"),
    p50_express_dispatch_to_ofd_mins:         wp("express_tl_dispatch_to_ofd_p50",         "express_tl_dispatch_to_ofd_cnt"),
    p50_express_ofd_to_rdl_mins:              wp("express_tl_ofd_to_rdl_p50",              "express_tl_ofd_to_rdl_cnt"),
    p50_express_rdl_to_del_mins:              wp("express_tl_rdl_to_del_p50",              "express_tl_rdl_to_del_cnt"),
    p90_express_created_to_picked_mins:       wp("express_tl_created_to_picked_p90",       "express_tl_created_to_picked_cnt"),
    p90_express_picked_to_packed_mins:        wp("express_tl_picked_to_packed_p90",        "express_tl_picked_to_packed_cnt"),
    p90_express_packed_to_allotted_mins:      wp("express_tl_packed_to_allotted_p90",      "express_tl_packed_to_allotted_cnt"),
    p90_express_allotted_to_accepted_mins:    wp("express_tl_allotted_to_accepted_p90",    "express_tl_allotted_to_accepted_cnt"),
    p90_express_accepted_to_dispatch_mins:    wp("express_tl_accepted_to_dispatch_p90",    "express_tl_accepted_to_dispatch_cnt"),
    p90_express_dispatch_to_ofd_mins:         wp("express_tl_dispatch_to_ofd_p90",         "express_tl_dispatch_to_ofd_cnt"),
    p90_express_ofd_to_rdl_mins:              wp("express_tl_ofd_to_rdl_p90",              "express_tl_ofd_to_rdl_cnt"),
    p90_express_rdl_to_del_mins:              wp("express_tl_rdl_to_del_p90",              "express_tl_rdl_to_del_cnt"),
    express_rdl_to_del_total_cnt:             s("express_tl_rdl_to_del_cnt"),

    avg_sched_allotted_to_accepted_mins:   div(s("sched_tl_allotted_to_accepted_sum"),   s("sched_tl_allotted_to_accepted_cnt")),
    avg_sched_accepted_to_dispatched_mins: div(s("sched_tl_accepted_to_dispatched_sum"), s("sched_tl_accepted_to_dispatched_cnt")),
    avg_sched_dispatch_to_ofd_mins:        div(s("sched_tl_dispatch_to_ofd_sum"),        s("sched_tl_dispatch_to_ofd_cnt")),
    avg_sched_ofd_to_rdl_mins:             div(s("sched_tl_ofd_to_rdl_sum"),             s("sched_tl_ofd_to_rdl_cnt")),
    avg_sched_rdl_to_del_mins:             div(s("sched_tl_rdl_to_del_sum"),             s("sched_tl_rdl_to_del_cnt")),

    p50_sched_allotted_to_accepted_mins:   wp("sched_tl_allotted_to_accepted_p50",   "sched_tl_allotted_to_accepted_cnt"),
    p50_sched_accepted_to_dispatched_mins: wp("sched_tl_accepted_to_dispatched_p50", "sched_tl_accepted_to_dispatched_cnt"),
    p50_sched_dispatch_to_ofd_mins:        wp("sched_tl_dispatch_to_ofd_p50",        "sched_tl_dispatch_to_ofd_cnt"),
    p50_sched_ofd_to_rdl_mins:             wp("sched_tl_ofd_to_rdl_p50",             "sched_tl_ofd_to_rdl_cnt"),
    p50_sched_rdl_to_del_mins:             wp("sched_tl_rdl_to_del_p50",             "sched_tl_rdl_to_del_cnt"),
    p90_sched_allotted_to_accepted_mins:   wp("sched_tl_allotted_to_accepted_p90",   "sched_tl_allotted_to_accepted_cnt"),
    p90_sched_accepted_to_dispatched_mins: wp("sched_tl_accepted_to_dispatched_p90", "sched_tl_accepted_to_dispatched_cnt"),
    p90_sched_dispatch_to_ofd_mins:        wp("sched_tl_dispatch_to_ofd_p90",        "sched_tl_dispatch_to_ofd_cnt"),
    p90_sched_ofd_to_rdl_mins:             wp("sched_tl_ofd_to_rdl_p90",             "sched_tl_ofd_to_rdl_cnt"),
    p90_sched_rdl_to_del_mins:             wp("sched_tl_rdl_to_del_p90",             "sched_tl_rdl_to_del_cnt"),
    sched_rdl_to_del_total_cnt:            s("sched_tl_rdl_to_del_cnt"),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(v: number, decimals = 1, unit = ""): string {
  if (!isFinite(v)) return "—";
  return `${v.toFixed(decimals)}${unit}`;
}

// ── Comparison table ──────────────────────────────────────────────────────────

interface MetricRow {
  label: React.ReactNode;
  pre: number;
  post: number;
  unit?: string;
  higherIsBetter?: boolean;
  neutral?: boolean;
  decimals?: number;
  warn?: boolean;
  countPre?: number;
  countPost?: number;
}

function ComparisonTable({ rows }: { rows: MetricRow[] }) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-700">
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase w-1/2">Metric</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">Range 1</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">Range 2</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">Change</th>
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
              <tr key={i} className="border-b border-gray-50 dark:border-zinc-700/50 last:border-0 hover:bg-gray-50/60 dark:hover:bg-zinc-700/40 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-zinc-300">
                  {row.label}
                  {row.warn && <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">⚠ &gt;25%</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="tabular-nums">
                    <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{fmt(row.pre, dec, u)}</span>
                    {row.countPre != null && <div className="text-[10px] text-gray-400 dark:text-zinc-500">{row.countPre.toLocaleString()} orders</div>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="tabular-nums">
                    <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{fmt(row.post, dec, u)}</span>
                    {row.countPost != null && <div className="text-[10px] text-gray-400 dark:text-zinc-500">{row.countPost.toLocaleString()} orders</div>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {row.neutral ? (
                    <span className="text-sm text-gray-500 dark:text-zinc-400 tabular-nums">{sign}{fmt(Math.abs(delta), dec, u)}</span>
                  ) : (
                    <div className="inline-flex flex-col items-end">
                      <span className={`text-sm font-semibold tabular-nums ${isGood ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                        {delta >= 0 ? "↑" : "↓"} {sign}{fmt(Math.abs(delta), dec, u)}
                      </span>
                      <span className={`text-[10px] ${isGood ? "text-green-400 dark:text-green-500" : "text-red-400 dark:text-red-500"}`}>
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

const EXPRESS_BUCKETS = [
  { key: "ex_30_45", label: "30–45 min" },
  { key: "ex_45_60", label: "45–60 min" },
  { key: "ex_60_90", label: "60–90 min" },
  { key: "ex_90p",   label: "90+ min" },
] as const;

function OrderMixTable({ pre, post, expressExpanded, onToggleExpress }: {
  pre: Aggregated; post: Aggregated; expressExpanded: boolean; onToggleExpress: () => void;
}) {
  const dot = <span className="text-gray-300 dark:text-zinc-600">·</span>;
  const cell = (count: number, pct: number) => (
    <span className="tabular-nums">{count.toFixed(0)}&nbsp;{dot}&nbsp;{(pct * 100).toFixed(1)}%</span>
  );
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-700">
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase w-1/2">Order Type</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">Range 1</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">Range 2</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-50 dark:border-zinc-700/50 hover:bg-gray-50/60 dark:hover:bg-zinc-700/40 transition-colors">
            <td className="px-4 py-3 text-sm text-gray-700 dark:text-zinc-300">DP Orders</td>
            <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-zinc-300 text-right">{cell(pre.dp_orders_total, pre.dp_orders_pct)}</td>
            <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-zinc-300 text-right">{cell(post.dp_orders_total, post.dp_orders_pct)}</td>
          </tr>
          <tr className="border-b border-gray-50 dark:border-zinc-700/50 hover:bg-gray-50/60 dark:hover:bg-zinc-700/40 transition-colors cursor-pointer" onClick={onToggleExpress}>
            <td className="px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 dark:text-zinc-500 select-none">{expressExpanded ? "▾" : "▸"}</span>
              Express Orders
            </td>
            <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-zinc-300 text-right">{cell(pre.express_orders_total, pre.express_orders_pct)}</td>
            <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-zinc-300 text-right">{cell(post.express_orders_total, post.express_orders_pct)}</td>
          </tr>
          {expressExpanded && EXPRESS_BUCKETS.map(({ key, label }) => {
            const preCount  = pre[`${key}_orders_total` as keyof Aggregated] as number ?? 0;
            const postCount = post[`${key}_orders_total` as keyof Aggregated] as number ?? 0;
            const prePct    = pre.express_orders_total  > 0 ? preCount  / pre.express_orders_total  : 0;
            const postPct   = post.express_orders_total > 0 ? postCount / post.express_orders_total : 0;
            return (
              <tr key={key} className="border-b border-gray-50 dark:border-zinc-700/50 bg-gray-50/40 dark:bg-zinc-800/60">
                <td className="pl-9 pr-4 py-2 text-xs text-gray-500 dark:text-zinc-400">{label}</td>
                <td className="px-4 py-2 text-xs text-gray-500 dark:text-zinc-400 text-right tabular-nums">{preCount.toFixed(0)}&nbsp;{dot}&nbsp;{(prePct*100).toFixed(1)}%</td>
                <td className="px-4 py-2 text-xs text-gray-500 dark:text-zinc-400 text-right tabular-nums">{postCount.toFixed(0)}&nbsp;{dot}&nbsp;{(postPct*100).toFixed(1)}%</td>
              </tr>
            );
          })}
          <tr className="border-b border-gray-50 dark:border-zinc-700/50 last:border-0 hover:bg-gray-50/60 dark:hover:bg-zinc-700/40 transition-colors">
            <td className="px-4 py-3 text-sm text-gray-700 dark:text-zinc-300">Scheduled Orders</td>
            <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-zinc-300 text-right">{cell(pre.scheduled_orders_total, pre.scheduled_orders_pct)}</td>
            <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-zinc-300 text-right">{cell(post.scheduled_orders_total, post.scheduled_orders_pct)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── SLA table with express drill-down ─────────────────────────────────────────

function SlaTable({ pre, post, expressExpanded, onToggleExpress, slaMode }: {
  pre: Aggregated; post: Aggregated; expressExpanded: boolean; onToggleExpress: () => void;
  slaMode: "del" | "rdl";
}) {
  const rdl = slaMode === "rdl";
  const rows: MetricRow[] = [
    { label: "Overall SLA %",           pre: (rdl ? pre.overall_sla_pct_rdl   : pre.overall_sla_pct)   * 100, post: (rdl ? post.overall_sla_pct_rdl   : post.overall_sla_pct)   * 100, unit: "%", higherIsBetter: true,  decimals: 1, countPre: rdl ? pre.overall_on_time_rdl_count   : pre.overall_on_time_count,   countPost: rdl ? post.overall_on_time_rdl_count   : post.overall_on_time_count },
    { label: "DP SLA %",                pre: (rdl ? pre.dp_sla_pct_rdl        : pre.dp_sla_pct)        * 100, post: (rdl ? post.dp_sla_pct_rdl        : post.dp_sla_pct)        * 100, unit: "%", higherIsBetter: true,  decimals: 1, countPre: rdl ? pre.dp_on_time_rdl_count        : pre.dp_on_time_count,       countPost: rdl ? post.dp_on_time_rdl_count        : post.dp_on_time_count },
    { label: "Express SLA %",           pre: (rdl ? pre.express_sla_pct_rdl   : pre.express_sla_pct)   * 100, post: (rdl ? post.express_sla_pct_rdl   : post.express_sla_pct)   * 100, unit: "%", higherIsBetter: true,  decimals: 1, countPre: rdl ? pre.express_on_time_rdl_count   : pre.express_on_time_count,   countPost: rdl ? post.express_on_time_rdl_count   : post.express_on_time_count },
    { label: "Scheduled SLA %",         pre: (rdl ? pre.scheduled_sla_pct_rdl : pre.scheduled_sla_pct) * 100, post: (rdl ? post.scheduled_sla_pct_rdl : post.scheduled_sla_pct) * 100, unit: "%", higherIsBetter: true,  decimals: 1, countPre: rdl ? pre.scheduled_on_time_rdl_count : pre.scheduled_on_time_count, countPost: rdl ? post.scheduled_on_time_rdl_count : post.scheduled_on_time_count },
    { label: "3P SLA % (at Delivered)", pre: pre.p3_sla_pct * 100,        post: post.p3_sla_pct * 100,        unit: "%", higherIsBetter: true,  decimals: 1, countPre: pre.p3_on_time_count,         countPost: post.p3_on_time_count },
    { label: "Avg Breach (mins)",       pre: pre.avg_breach_mins,          post: post.avg_breach_mins,         higherIsBetter: false, decimals: 1 },
    { label: "Batched SLA %",           pre: (rdl ? pre.batched_sla_pct_rdl : pre.batched_sla_pct) * 100, post: (rdl ? post.batched_sla_pct_rdl : post.batched_sla_pct) * 100, unit: "%", higherIsBetter: true, decimals: 1, countPre: rdl ? pre.batched_on_time_rdl_count : pre.batched_on_time_count, countPost: rdl ? post.batched_on_time_rdl_count : post.batched_on_time_count },
    { label: "EOB — All (median breach)",     pre: pre.avg_breach_p50_mins,         post: post.avg_breach_p50_mins,         higherIsBetter: false, decimals: 1 },
    { label: "EOB — Batched (median breach)", pre: pre.avg_batched_breach_p50_mins, post: post.avg_batched_breach_p50_mins, higherIsBetter: false, decimals: 1 },
  ];
  // Express row index (2) needs the expand toggle
  const expressIdx = 2;

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-700">
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase w-1/2">Metric</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">Range 1</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">Range 2</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">Change</th>
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
            const isExpress = i === expressIdx;
            return (
              <Fragment key={i}>
                <tr className={`border-b border-gray-50 dark:border-zinc-700/50 hover:bg-gray-50/60 dark:hover:bg-zinc-700/40 transition-colors ${isExpress ? "cursor-pointer" : ""}`}
                    onClick={isExpress ? onToggleExpress : undefined}>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-zinc-300">
                    {isExpress ? (
                      <span className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400 dark:text-zinc-500 select-none">{expressExpanded ? "▾" : "▸"}</span>
                        {row.label}
                      </span>
                    ) : row.label}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="tabular-nums">
                      <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{fmt(row.pre, dec, u)}</span>
                      {row.countPre != null && <div className="text-[10px] text-gray-400 dark:text-zinc-500">{row.countPre.toLocaleString()} orders</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="tabular-nums">
                      <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{fmt(row.post, dec, u)}</span>
                      {row.countPost != null && <div className="text-[10px] text-gray-400 dark:text-zinc-500">{row.countPost.toLocaleString()} orders</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.neutral ? (
                      <span className="text-sm text-gray-500 dark:text-zinc-400 tabular-nums">{sign}{fmt(Math.abs(delta), dec, u)}</span>
                    ) : (
                      <div className="inline-flex flex-col items-end">
                        <span className={`text-sm font-semibold tabular-nums ${isGood ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                          {delta >= 0 ? "↑" : "↓"} {sign}{fmt(Math.abs(delta), dec, u)}
                        </span>
                        <span className={`text-[10px] ${isGood ? "text-green-400 dark:text-green-500" : "text-red-400 dark:text-red-500"}`}>
                          {sign}{Math.abs(pctDelta).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
                {isExpress && expressExpanded && EXPRESS_BUCKETS.map(({ key, label }) => {
                  const preSla  = (pre[`${key}_sla_pct` as keyof Aggregated] as number ?? 0) * 100;
                  const postSla = (post[`${key}_sla_pct` as keyof Aggregated] as number ?? 0) * 100;
                  const d = postSla - preSla;
                  const isPos = d > 0;
                  const bSign = d >= 0 ? "+" : "−";
                  return (
                    <tr key={key} className="border-b border-gray-50 dark:border-zinc-700/50 bg-gray-50/40 dark:bg-zinc-800/60">
                      <td className="pl-9 pr-4 py-2 text-xs text-gray-500 dark:text-zinc-400">{label} SLA %</td>
                      <td className="px-4 py-2 text-xs text-gray-500 dark:text-zinc-400 text-right tabular-nums">{preSla.toFixed(1)}%</td>
                      <td className="px-4 py-2 text-xs text-gray-500 dark:text-zinc-400 text-right tabular-nums">{postSla.toFixed(1)}%</td>
                      <td className="px-4 py-2 text-right">
                        <span className={`text-xs font-semibold tabular-nums ${isPos ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                          {d >= 0 ? "↑" : "↓"} {bSign}{Math.abs(d).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ children, noMargin }: { children: React.ReactNode; noMargin?: boolean }) {
  return <h2 className={`text-sm font-semibold text-gray-900 dark:text-zinc-100 ${noMargin ? "" : "mb-3"}`}>{children}</h2>;
}

// ── Status strip ──────────────────────────────────────────────────────────────

const STRIP_PERIOD_COLOR: Record<string, string> = {
  post: "bg-green-400 dark:bg-green-500",
  pre:  "bg-zinc-300 dark:bg-zinc-600",
  gap:  "bg-amber-300 dark:bg-amber-500",
};

const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function StatusStrip({ allDays, preStart, preEnd, postStart, postEnd }: {
  allDays: RawDay[];
  preStart: string; preEnd: string;
  postStart: string; postEnd: string;
}) {
  const dates = [...new Set(allDays.map(d => d.date))].sort();
  const dateMap: Record<string, string> = {};
  for (const d of allDays) dateMap[d.date] = d.period;

  const monthStarts: Record<number, string> = {};
  dates.forEach((date) => {
    const dt = new Date(date + "T00:00:00");
    const key = dt.getFullYear() * 12 + dt.getMonth();
    if (!(key in monthStarts)) {
      monthStarts[key] = date;
    }
  });
  const monthStartSet = new Set(Object.values(monthStarts));

  return (
    <div className="mb-5">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-1.5">
        {(["post", "pre", "gap"] as const).map((p) => (
          <div key={p} className="flex items-center gap-1.5">
            <span className={`inline-block w-4 h-3 rounded-sm ${STRIP_PERIOD_COLOR[p]}`} />
            <span className="text-[10px] text-gray-400 dark:text-zinc-500">
              {p === "post" ? "AB Live" : p === "pre" ? "No AB" : "Rolled back"}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-3 border-t-2 border-blue-500" />
          <span className="text-[10px] text-gray-400 dark:text-zinc-500">Range 1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-3 border-t-2 border-orange-500" />
          <span className="text-[10px] text-gray-400 dark:text-zinc-500">Range 2</span>
        </div>
      </div>
      {/* Strip */}
      <div className="relative overflow-x-auto">
        <div className="flex items-end" style={{ height: 28 }}>
          {dates.map((date) => {
            const period = dateMap[date] ?? "pre";
            const inPre  = date >= preStart && date <= preEnd;
            const inPost = date >= postStart && date <= postEnd;
            const isMonthStart = monthStartSet.has(date);
            const dt = new Date(date + "T00:00:00");
            return (
              <div
                key={date}
                className="relative flex-shrink-0 flex flex-col justify-end"
                style={{ width: 8 }}
              >
                {/* Month label */}
                {isMonthStart && (
                  <span
                    className="absolute bottom-full left-0 text-[8px] text-gray-400 dark:text-zinc-500 whitespace-nowrap leading-tight pb-0.5"
                  >
                    {MONTH_ABBR[dt.getMonth()]}
                  </span>
                )}
                {/* Cell */}
                <div
                  className={`w-full ${STRIP_PERIOD_COLOR[period]}`}
                  style={{
                    height: 12,
                    borderTop: inPre
                      ? "3px solid #3b82f6"
                      : inPost
                        ? "3px solid #f97316"
                        : undefined,
                    boxSizing: "border-box",
                  }}
                  title={`${date} · ${period}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Chart config ──────────────────────────────────────────────────────────────


// ── Glossary ──────────────────────────────────────────────────────────────────

const GLOSSARY = [
  { term: "DP (Dynamic Promise)",          definition: "Express order with a promise window under 30 min. Identified by wms_order_type = 'EXPRESS' AND expressminutes < 30." },
  { term: "Express",                        definition: "Express order with a promise window of 30 min or more (wms_order_type = 'EXPRESS' AND expressminutes >= 30)." },
  { term: "Scheduled",                      definition: "Scheduled slot order (wms_order_type = 'SCHEDULED'). Created the day before the promise date in WMS." },
  { term: "Batched Orders %",               definition: "Orders that left the hub on a trip with >1 order, as a % of all Licious-dispatched orders. Formula: batched_orders / total_licious_dispatched." },
  { term: "OPT (Orders / Trip)",             definition: "Total Licious-dispatched orders ÷ total dispatched trips. Higher = denser batching." },
  { term: "Single-Order Trips %",          definition: "Trips with exactly 1 order as a % of all trips. Lower is better post-autobatching." },
  { term: "Avg Orders / DE",               definition: "Total Licious-dispatched orders ÷ total DE headcount across the selected period." },
  { term: "Orders / Login Hr (OPH)",       definition: "Total orders ÷ total DE login hours. Measures throughput per hour of DE availability." },
  { term: "Trips / DE",                    definition: "Total trips ÷ total DE headcount. Measures how many trips each DE runs on average." },
  { term: "SLA",                            definition: "On-time delivery. Measured at actual delivery: deliveredat ≤ promiseendtime (order_events_fact). Only delivered orders count in denominator." },
  { term: "RDL (Reached Delivery Location)", definition: "Shipment state when the DE arrives at the customer's location. Used in the order timeline (OFD→RDL stage) but NOT used as the SLA event — SLA is measured at delivered." },
  { term: "Avg Breach (mins)",             definition: "Average minutes late across breached orders: (deliveredat − promiseendtime) / 60000, for delivered orders where deliveredat > promiseendtime." },
  { term: "Batched SLA %",                definition: "On-time rate for orders delivered with 2+ orders on the same trip. Formula: batched_on_time / batched_with_rdl." },
  { term: "SLA at DEL",                   definition: "Default SLA mode. Order is on-time if deliveredat ≤ promiseendtime. Anchored at the moment the customer confirms receipt." },
  { term: "SLA at RDL",                   definition: "Toggle mode. Order is on-time if reached_delivery_location ≤ promiseendtime. Anchored at the moment the DE arrives at the door. Typically a few minutes stricter than DEL." },
  { term: "EOB (Extent of Breach)",       definition: "Median breach time (mins) among orders that missed their SLA window. Lower is better. Shown for all orders (EOB — All) and batched-only orders (EOB — Batched). Computed as mean of daily medians across the selected period." },
  { term: "Trip Breach Rate %",            definition: "% of batched trips (>1 order) where at least one order breached SLA." },
  { term: "First-Order Breach %",          definition: "Of all breached batched trips: % where the breach was the first delivery on the trip." },
  { term: "Last-Order Breach %",           definition: "Of all breached batched trips: % where the breach was the last delivery on the trip." },
  { term: "Avg Breach Position",           definition: "0.0 = breach was first delivery, 1.0 = breach was last delivery. Mid-values indicate mid-trip breaches." },
  { term: "Created→Picked",               definition: "Time from WMS ORDER_CREATED to PICKED status. Covers picklist generation + picker travel + item picking." },
  { term: "Picked→Packed",                definition: "Time from PICKED to PACKED in WMS. Packing station processing time." },
  { term: "Packed→Allotted",              definition: "Time from WMS PACKED to LMS RIDER_ALLOTTED. The batching wait window — how long the algo holds an order before forming a trip and allotting a rider. Key autobatching impact metric: longer post-release = more aggressive batching." },
  { term: "Allotted→Accepted",           definition: "Time from RIDER_ALLOTTED to RIDER_ACCEPTED. The OTP acceptance window — how long the DE takes to accept the trip in-app." },
  { term: "Accepted→Dispatched",         definition: "Time from RIDER_ACCEPTED to DISPATCHED. Physical pickup from the hub counter — DE collecting the packed boxes." },
  { term: "Dispatched→OFD",              definition: "Time from LMS DISPATCHED to OUT_FOR_DELIVERY. Hub exit to first customer en route." },
  { term: "OFD→RDL",                     definition: "Time from OUT_FOR_DELIVERY to REACHED_DELIVERY_LOCATION. Travel time to customer doorstep." },
  { term: "RDL→DEL",                     definition: "Time from REACHED_DELIVERY_LOCATION to DELIVERED. Time the DE spends at the customer's door to hand over the order and confirm delivery." },
  { term: "Allotted→Accepted (Scheduled)", definition: "Time from RIDER_ALLOTTED to RIDER_ACCEPTED for scheduled orders. Rider OTP acceptance window." },
  { term: "Accepted→Dispatched (Scheduled)", definition: "Time from RIDER_ACCEPTED to DISPATCHED for scheduled orders. Pickup readiness lag." },
  { term: "OD (On-Demand)",                 definition: "Orders fulfilled by 3P fleet partners (Shadowfax, Pidge, ElasticRun, Shiprocket). Shown as 'OD' on dashboard. Count is avg orders/day to the 3P fleet." },
  { term: "Express sub-buckets",            definition: "Express orders split by promise window (expressminutes): 30–45 min, 45–60 min, 60–90 min, 90+ min. Click the ▸ next to Express in Order Mix or SLA to expand." },
  { term: "Median (P50)",                   definition: "50th percentile of stage duration across orders in the selected period. Weighted average of daily medians, weighted by order count. Less sensitive to outliers than avg." },
  { term: "P90",                            definition: "90th percentile of stage duration. Shows tail latency — the worst 10% of orders. Weighted average of daily P90s." },
  { term: "DE (Delivery Executive)",       definition: "Last-mile delivery rider. Headcount sourced from rider_events login data, filtered to hours with active logins." },
  { term: "Range 1",                        definition: "The baseline comparison window. Default: DOW-aligned pre-AB period (before Jun 18). Can be set to any date range using the picker." },
  { term: "Range 2",                        definition: "The comparison window. Default: AB live days (Phase 1 Jun 18–21 + Phase 2 Jul 7+). Can be set to any date range — e.g. Phase 1 vs Phase 2." },
  { term: "Gap (Jun 22 – Jul 6)",         definition: "Autobatching was rolled back ~Jun 22 due to ground ops issues and re-released Jul 6 night. These days are excluded from all aggregations." },
  { term: "Delay Reasons",               definition: "Breakdown of why orders breached SLA, from DL delay attribution. Available for all dates (Jun 1–Jul 16). Killer stage = the first pipeline stage where the cumulative SLA budget hit zero. Flags = co-occurring conditions on that order." },
  { term: "Last-mile (killer)",          definition: "OFD → RDL stage consumed the remaining SLA budget. Travel from hub to customer was slower than promise allows." },
  { term: "Handoff (killer)",            definition: "RDL → DEL stage (DE at customer door) consumed the remaining budget. Includes waiting for customer to answer door." },
  { term: "Cascade (killer)",            definition: "Order was on a multi-stop trip and inherited delay from earlier stops — killer is 'inherited time on prior stops'." },
  { term: "PREDICTED flag",             definition: "Algo knew this order would breach before dispatch (algo slastatus = BREACHED)." },
  { term: "RESEQUENCED flag",           definition: "The order's planned delivery sequence in the algo changed vs the actual delivery order." },
  { term: "CASCADE flag",               definition: "Order was on stop >1 of a multi-stop trip; inherited delay from prior stops exceeded 1 min." },
  { term: "SLOW_TRAVEL flag",           definition: "Actual OFD→RDL travel time exceeded algo's planned travel time by >3 min." },
  { term: "AUTO_FAIL flag",             definition: "Auto-allocation failed for this order; DE had to be assigned manually." },
  { term: "NO_RIDER flag",              definition: "Zero available riders at the time of auto-allocation scan." },
  { term: "LATE_DEP flag",              definition: "For first-stop orders: actual OFD time was >3 min later than algo's planned departure." },
  { term: "TEMPORAL flag",              definition: "DP order where algo ran AFTER PACKED event — algo had stale data when making the batching decision." },
];

// ── Date defaults ─────────────────────────────────────────────────────────────
// Range 2 = latest available day; Range 1 = the day before that.
function smartDateDefaults(preDays: RawDay[], postDays: RawDay[]) {
  const all = [...preDays, ...postDays].sort((a, b) => a.date.localeCompare(b.date));
  if (all.length === 0) return { preStart: "", preEnd: "", postStart: "", postEnd: "" };
  const latest = all[all.length - 1].date;
  const prev   = all.length >= 2 ? all[all.length - 2].date : latest;
  return { preStart: prev, preEnd: prev, postStart: latest, postEnd: latest };
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard({ hub, generated_at, days, delayReasons }: Props) {
  const { gridStroke, tickFill, tooltipStyle, legendProps } = useChartTheme();
  const initPreDays  = days.filter(d => d.period === "pre");
  const initPostDays = days.filter(d => d.period === "post");
  const defaults     = smartDateDefaults(initPreDays, initPostDays);

  const [selectedHub,       setSelectedHub]       = useState<string>(days[0]?.hub ?? hub);
  const [preStart,          setPreStart]          = useState(defaults.preStart);
  const [preEnd,            setPreEnd]            = useState(defaults.preEnd);
  const [postStart,         setPostStart]         = useState(defaults.postStart);
  const [postEnd,           setPostEnd]           = useState(defaults.postEnd);
  const [timelineType,      setTimelineType]      = useState<"dp" | "express" | "scheduled">("dp");
  const [tlMetric,          setTlMetric]          = useState<"avg" | "p50" | "p90">("avg");
  const [expressExpanded,   setExpressExpanded]   = useState(false);
  const [activeTab,         setActiveTab]         = useState<"metrics" | "glossary" | "timeline">("metrics");
  const [slaMode,           setSlaMode]           = useState<"del" | "rdl">("del");

  const availableHubs = useMemo(
    () => [...new Set(days.map(d => d.hub).filter(Boolean))].sort(), [days]
  );
  const hubDays = useMemo(() => days.filter(d => (d.hub ?? hub) === selectedHub), [days, selectedHub, hub]);

  const allMin = useMemo(() => hubDays[0]?.date ?? "", [hubDays]);
  const allMax = useMemo(() => hubDays[hubDays.length - 1]?.date ?? "", [hubDays]);

  const selectedPre  = useMemo(() => hubDays.filter(d => d.period !== "gap" && d.date >= preStart && d.date <= preEnd),   [hubDays, preStart, preEnd]);
  const selectedPost = useMemo(() => hubDays.filter(d => d.period !== "gap" && d.date >= postStart && d.date <= postEnd), [hubDays, postStart, postEnd]);
  const preAgg  = useMemo(() => aggregate(selectedPre),  [selectedPre]);
  const postAgg = useMemo(() => aggregate(selectedPost), [selectedPost]);

  const FLAG_LABELS: Record<string, string> = {
    TEMPORAL: "Algo ran after packed",
    OMS_LAG: "OMS→WMS lag >2m",
    SLOW_PICKLIST: "Slow picklist gen >5m",
    NO_RIDER: "Zero riders at scan",
    ALGO_DROP: "Algo UNASSIGNED",
    AUTO_FAIL: "Auto alloc failed",
    DIRECT_MANUAL: "Manual assign",
    SLOW_ACCEPT: "Slow rider accept >5m",
    CASCADE: "Cascade (prior stop)",
    RESEQUENCED: "Delivery resequenced",
    PREDICTED: "Algo predicted breach",
    MULTI_RUN: "Multiple algo runs",
    LATE_DEP: "Late departure >3m",
    SLOW_TRAVEL: "Slow travel vs plan",
    "3P": "3P fleet used",
    ESCALATED: "Escalated ticket",
  };

  // Delay reasons — filter for both selected ranges, tag which range each day belongs to
  const delayPreDays  = useMemo(() => !delayReasons ? [] : delayReasons.days.filter(d => d.date >= preStart  && d.date <= preEnd),  [delayReasons, preStart,  preEnd]);
  const delayPostDays = useMemo(() => !delayReasons ? [] : delayReasons.days.filter(d => d.date >= postStart && d.date <= postEnd), [delayReasons, postStart, postEnd]);

  const delayKillerChartData = useMemo(() => {
    const toRow = (d: DelayDay, suffix: string) => ({
      date: d.date.slice(8) + "/" + d.date.slice(5,7) + "/" + d.date.slice(2,4) + suffix,
      "Last-mile travel":    d.killer["travel_to_customer"] ?? 0,
      "Handoff at door":     d.killer["service_rdl_to_del"] ?? 0,
      "Cascade (prior stops)": d.killer["cascade_prev_stops"] ?? 0,
      "Rider allotment":     d.killer["allocation"] ?? 0,
      "Rider acceptance":    d.killer["rider_acceptance"] ?? 0,
      "Pre-dispatch at hub": d.killer["pre_dispatch"] ?? 0,
      "OFD event delay":     d.killer["ofd_event_delay"] ?? 0,
      "Algo / batching":     d.killer["algo_batching"] ?? 0,
      "Other stages":        (d.killer["picklist_gen"] ?? 0) + (d.killer["packing"] ?? 0) + (d.killer["picking"] ?? 0) + (d.killer["MARGINAL"] ?? 0),
      total:         d.total_breached,
    });
    const preRows  = delayPreDays.map(d  => toRow(d, " ①"));
    const postRows = delayPostDays.map(d => toRow(d, " ②"));
    // Show chronologically; if both ranges have same dates (same day selected) deduplicate
    const allRows = [...preRows, ...postRows].sort((a, b) => a.date.localeCompare(b.date));
    return allRows;
  }, [delayPreDays, delayPostDays]);

  const delayFlagSummary = useMemo(() => {
    const agg = (days: DelayDay[]) => {
      const totals: Record<string, number> = {};
      let totalBreached = 0;
      for (const d of days) {
        totalBreached += d.total_breached;
        for (const [tag, cnt] of Object.entries(d.tags)) totals[tag] = (totals[tag] ?? 0) + cnt;
      }
      return { totals, totalBreached };
    };
    const r1 = agg(delayPreDays);
    const r2 = agg(delayPostDays);
    const allTags = [...new Set([...Object.keys(r1.totals), ...Object.keys(r2.totals)])];
    return allTags
      .map(tag => ({
        tag,
        label: FLAG_LABELS[tag] ?? tag,
        r1Count: r1.totals[tag] ?? 0,
        r2Count: r2.totals[tag] ?? 0,
        r1Pct: r1.totalBreached > 0 ? (r1.totals[tag] ?? 0) / r1.totalBreached : 0,
        r2Pct: r2.totalBreached > 0 ? (r2.totals[tag] ?? 0) / r2.totalBreached : 0,
      }))
      .sort((a, b) => (b.r1Count + b.r2Count) - (a.r1Count + a.r2Count));
  }, [delayPreDays, delayPostDays]);

  const ordersWarn = preAgg.avg_daily_orders > 0
    && Math.abs(postAgg.avg_daily_orders - preAgg.avg_daily_orders) / preAgg.avg_daily_orders > 0.25;
  const ridersWarn = preAgg.avg_daily_riders > 0
    && Math.abs(postAgg.avg_daily_riders - preAgg.avg_daily_riders) / preAgg.avg_daily_riders > 0.25;

  // Timeline data per type + metric (avg/p50/p90)
  const timelineData = useMemo(() => {
    const pfx = tlMetric === "avg" ? "avg" : tlMetric;  // "avg" | "p50" | "p90"
    const g = (agg: Aggregated, base: string) =>
      +(agg[`${pfx}_${base}` as keyof Aggregated] as number ?? 0).toFixed(1);
    // Return null when a stage has no data for that period (cnt = 0)
    const gOrNull = (agg: Aggregated, base: string, cntKey: keyof Aggregated) =>
      (agg[cntKey] as number) > 0 ? g(agg, base) : null;

    if (timelineType === "dp") {
      return [
        { stage: "Created→Picked",      pre: g(preAgg,  "dp_created_to_picked_mins"),      post: g(postAgg, "dp_created_to_picked_mins") },
        { stage: "Picked→Packed",       pre: g(preAgg,  "dp_picked_to_packed_mins"),       post: g(postAgg, "dp_picked_to_packed_mins") },
        { stage: "Packed→Allotted",     pre: g(preAgg,  "dp_packed_to_allotted_mins"),     post: g(postAgg, "dp_packed_to_allotted_mins") },
        { stage: "Allotted→Accepted",   pre: g(preAgg,  "dp_allotted_to_accepted_mins"),   post: g(postAgg, "dp_allotted_to_accepted_mins") },
        { stage: "Accepted→Dispatched", pre: g(preAgg,  "dp_accepted_to_dispatch_mins"),   post: g(postAgg, "dp_accepted_to_dispatch_mins") },
        { stage: "Dispatched→OFD",      pre: g(preAgg,  "dp_dispatch_to_ofd_mins"),        post: g(postAgg, "dp_dispatch_to_ofd_mins") },
        { stage: "OFD→RDL",             pre: g(preAgg,  "dp_ofd_to_rdl_mins"),             post: g(postAgg, "dp_ofd_to_rdl_mins") },
        { stage: "RDL→DEL",             pre: gOrNull(preAgg,  "dp_rdl_to_del_mins", "dp_rdl_to_del_total_cnt"),  post: gOrNull(postAgg, "dp_rdl_to_del_mins", "dp_rdl_to_del_total_cnt") },
      ];
    }
    if (timelineType === "express") {
      return [
        { stage: "Created→Picked",      pre: g(preAgg,  "express_created_to_picked_mins"),      post: g(postAgg, "express_created_to_picked_mins") },
        { stage: "Picked→Packed",       pre: g(preAgg,  "express_picked_to_packed_mins"),       post: g(postAgg, "express_picked_to_packed_mins") },
        { stage: "Packed→Allotted",     pre: g(preAgg,  "express_packed_to_allotted_mins"),     post: g(postAgg, "express_packed_to_allotted_mins") },
        { stage: "Allotted→Accepted",   pre: g(preAgg,  "express_allotted_to_accepted_mins"),   post: g(postAgg, "express_allotted_to_accepted_mins") },
        { stage: "Accepted→Dispatched", pre: g(preAgg,  "express_accepted_to_dispatch_mins"),   post: g(postAgg, "express_accepted_to_dispatch_mins") },
        { stage: "Dispatched→OFD",      pre: g(preAgg,  "express_dispatch_to_ofd_mins"),        post: g(postAgg, "express_dispatch_to_ofd_mins") },
        { stage: "OFD→RDL",             pre: g(preAgg,  "express_ofd_to_rdl_mins"),             post: g(postAgg, "express_ofd_to_rdl_mins") },
        { stage: "RDL→DEL",             pre: gOrNull(preAgg,  "express_rdl_to_del_mins", "express_rdl_to_del_total_cnt"), post: gOrNull(postAgg, "express_rdl_to_del_mins", "express_rdl_to_del_total_cnt") },
      ];
    }
    // scheduled
    return [
      { stage: "Allotted→Accepted",   pre: g(preAgg,  "sched_allotted_to_accepted_mins"),   post: g(postAgg, "sched_allotted_to_accepted_mins") },
      { stage: "Accepted→Dispatched", pre: g(preAgg,  "sched_accepted_to_dispatched_mins"), post: g(postAgg, "sched_accepted_to_dispatched_mins") },
      { stage: "Dispatched→OFD",      pre: g(preAgg,  "sched_dispatch_to_ofd_mins"),        post: g(postAgg, "sched_dispatch_to_ofd_mins") },
      { stage: "OFD→RDL",             pre: g(preAgg,  "sched_ofd_to_rdl_mins"),             post: g(postAgg, "sched_ofd_to_rdl_mins") },
      { stage: "RDL→DEL",             pre: gOrNull(preAgg,  "sched_rdl_to_del_mins", "sched_rdl_to_del_total_cnt"), post: gOrNull(postAgg, "sched_rdl_to_del_mins", "sched_rdl_to_del_total_cnt") },
    ];
  }, [timelineType, tlMetric, preAgg, postAgg]);

  // Refresh banner
  const refreshLabel = useMemo(() => {
    if (!generated_at) return null;
    const d = new Date(generated_at);
    if (isNaN(d.getTime())) return null;
    const dd  = d.getDate().toString().padStart(2, "0");
    const mm  = (d.getMonth() + 1).toString().padStart(2, "0");
    const yy  = d.getFullYear().toString().slice(2);
    const hh  = d.getHours().toString().padStart(2, "0");
    const min = d.getMinutes().toString().padStart(2, "0");
    return `${dd}/${mm}/${yy} ${hh}:${min}`;
  }, [generated_at]);

  function handleDownload() {
    const cols = Object.keys(days[0] ?? {});
    const lines = [cols.join(","), ...days.map(d => cols.map(c => {
      const v = (d as unknown as Record<string, unknown>)[c];
      return typeof v === "string" && v.includes(",") ? `"${v}"` : String(v ?? "");
    }).join(","))];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `autobatching_raw_${hub}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const inputCls    = "bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-gray-400 dark:focus:border-zinc-500 shadow-sm";
  const typeBtnCls  = (active: boolean) =>
    `px-3 py-1 text-xs font-semibold rounded-full transition-colors ${active ? "bg-blue-600 text-white" : "bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:border-gray-400 dark:hover:border-zinc-500"}`;
  const tabCls = (t: string) =>
    `px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === t ? "border-gray-900 dark:border-zinc-100 text-gray-900 dark:text-zinc-100" : "border-transparent text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"}`;

  return (
    <DashboardLayout>

      <DashboardHeader
        title="Autobatching v2"
        subtitle={`Range comparison · ${hub}`}
        updatedAt={refreshLabel ?? undefined}
        onDownload={handleDownload}
        className="mb-4"
      />

      {/* Sticky filter + status strip + tab bar */}
      <div className="sticky top-11 z-30 bg-zinc-100 dark:bg-zinc-900 -mx-6 px-6 lg:-mx-8 lg:px-8 pt-3 pb-0 shadow-[0_1px_0_0_#e5e7eb] dark:shadow-[0_1px_0_0_#3f3f46] mb-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">Hub</span>
            <select value={selectedHub} onChange={e => setSelectedHub(e.target.value)} className={inputCls}>
              {availableHubs.length > 0
                ? availableHubs.map(h => <option key={h} value={h}>{h}</option>)
                : <option value={hub}>{hub}</option>}
            </select>
          </div>
          <span className="text-gray-200 dark:text-zinc-700 text-sm">|</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">Range 1</span>
            <input type="date" value={preStart} min={allMin} max={allMax} onChange={e => setPreStart(e.target.value)} className={inputCls} />
            <span className="text-gray-300 dark:text-zinc-600 text-sm">→</span>
            <input type="date" value={preEnd}   min={allMin} max={allMax} onChange={e => setPreEnd(e.target.value)}   className={inputCls} />
            <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-medium">{selectedPre.length}d</span>
          </div>
          <span className="text-gray-200 dark:text-zinc-700 text-sm">|</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">Range 2</span>
            <input type="date" value={postStart} min={allMin} max={allMax} onChange={e => setPostStart(e.target.value)} className={inputCls} />
            <span className="text-gray-300 dark:text-zinc-600 text-sm">→</span>
            <input type="date" value={postEnd}   min={allMin} max={allMax} onChange={e => setPostEnd(e.target.value)}   className={inputCls} />
            <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-medium">{selectedPost.length}d</span>
          </div>
        </div>

        {/* Status strip */}
        <StatusStrip
          allDays={hubDays}
          preStart={preStart} preEnd={preEnd}
          postStart={postStart} postEnd={postEnd}
        />

        {/* Tab bar */}
        <div className="flex border-b border-gray-200 dark:border-zinc-700">
          <button className={tabCls("metrics")}  onClick={() => setActiveTab("metrics")}>Metrics</button>
          <button className={tabCls("glossary")} onClick={() => setActiveTab("glossary")}>Glossary</button>
          <button className={tabCls("timeline")} onClick={() => setActiveTab("timeline")}>Timeline</button>
        </div>
      </div>

      {activeTab === "glossary" ? (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-700">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase w-1/3">Term</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">Definition</th>
              </tr>
            </thead>
            <tbody>
              {GLOSSARY.map((g, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-zinc-700/50 last:border-0 hover:bg-gray-50/60 dark:hover:bg-zinc-700/40 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-zinc-200 align-top">{g.term}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-zinc-400 align-top">{g.definition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === "timeline" ? (
        <TimelineContent allDays={hubDays} />
      ) : (
        <>
          {/* Comparability */}
          <div className="mb-5">
            <SectionHeader>Comparability</SectionHeader>
            <ComparisonTable rows={[
              { label: "Days",                pre: preAgg.num_days,              post: postAgg.num_days,              neutral: true, decimals: 0 },
              { label: "Total Orders",        pre: preAgg.total_orders_sum,      post: postAgg.total_orders_sum,      neutral: true, decimals: 0 },
              { label: "Avg Daily Orders",    pre: preAgg.avg_daily_orders,      post: postAgg.avg_daily_orders,      neutral: true, decimals: 1, warn: ordersWarn },
              { label: "Avg Daily DEs",       pre: preAgg.avg_daily_riders,      post: postAgg.avg_daily_riders,      neutral: true, decimals: 1, warn: ridersWarn },
              { label: <><Abbr tip="On-Demand: orders fulfilled by 3P fleet (Shadowfax, Pidge, etc.)" align="left">OD</Abbr> Orders (avg/day)</>, pre: preAgg.avg_daily_3p_orders, post: postAgg.avg_daily_3p_orders, neutral: true, decimals: 1 },
            ]} />
          </div>

          {/* Order Mix */}
          <div className="mb-5">
            <SectionHeader>Order Mix · Count &amp; Share of Dispatched Licious Orders</SectionHeader>
            <OrderMixTable pre={preAgg} post={postAgg} expressExpanded={expressExpanded} onToggleExpress={() => setExpressExpanded(x => !x)} />
          </div>

          {/* Batch Metrics */}
          <div className="mb-5">
            <SectionHeader>Batch Metrics — Success Signal</SectionHeader>
            <ComparisonTable rows={[
              { label: "Batched Orders %",        pre: preAgg.batched_orders_pct * 100,    post: postAgg.batched_orders_pct * 100,    unit: "%", higherIsBetter: true,  decimals: 1, countPre: preAgg.total_orders_batched_count, countPost: postAgg.total_orders_batched_count },
              { label: <>Orders / Trip (<Abbr tip="Total Licious-dispatched orders ÷ total dispatched trips. Higher = denser batching.">OPT</Abbr>)</>, pre: preAgg.avg_orders_per_trip, post: postAgg.avg_orders_per_trip, higherIsBetter: true, decimals: 2, countPre: preAgg.total_licious_dispatched_count, countPost: postAgg.total_licious_dispatched_count },
              { label: "Single-Order Trips %",    pre: preAgg.single_order_trips_pct * 100, post: postAgg.single_order_trips_pct * 100, unit: "%", higherIsBetter: false, decimals: 1, countPre: preAgg.total_trips_count, countPost: postAgg.total_trips_count },
              { label: "Avg Orders / DE",         pre: preAgg.avg_orders_per_de,            post: postAgg.avg_orders_per_de,            higherIsBetter: true,  decimals: 1 },
              { label: <>Orders / Login Hr (<Abbr tip="Total orders ÷ total DE login hours. Measures throughput per hour of rider availability.">OPH</Abbr>)</>, pre: preAgg.orders_per_login_hour,        post: postAgg.orders_per_login_hour,        higherIsBetter: true,  decimals: 2 },
              { label: "Trips / DE",              pre: preAgg.trips_per_de,                 post: postAgg.trips_per_de,                 higherIsBetter: true,  decimals: 2 },
            ]} />
          </div>

          {/* Batching by Order Type */}
          <div className="mb-5">
            <SectionHeader>Batching by Order Type · % of Orders Batched</SectionHeader>
            <ComparisonTable rows={[
              { label: "DP Batched %",        pre: preAgg.dp_batched_pct * 100,        post: postAgg.dp_batched_pct * 100,        unit: "%", higherIsBetter: true, decimals: 1, countPre: preAgg.dp_batched_count,        countPost: postAgg.dp_batched_count },
              { label: "Express Batched %",   pre: preAgg.express_batched_pct * 100,   post: postAgg.express_batched_pct * 100,   unit: "%", higherIsBetter: true, decimals: 1, countPre: preAgg.express_batched_count,   countPost: postAgg.express_batched_count },
              { label: "Scheduled Batched %", pre: preAgg.scheduled_batched_pct * 100, post: postAgg.scheduled_batched_pct * 100, unit: "%", higherIsBetter: true, decimals: 1, countPre: preAgg.scheduled_batched_count, countPost: postAgg.scheduled_batched_count },
            ]} />
          </div>

          {/* SLA */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <SectionHeader noMargin>SLA</SectionHeader>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">SLA anchor</span>
                <div className="flex rounded-lg border border-gray-200 dark:border-zinc-600 overflow-hidden text-[11px] font-semibold">
                  {(["del", "rdl"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSlaMode(mode)}
                      className={`px-3 py-1 transition-colors ${slaMode === mode ? "bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900" : "bg-white dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300"}`}
                    >
                      {mode === "del" ? "At DEL" : "At RDL"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <SlaTable pre={preAgg} post={postAgg} expressExpanded={expressExpanded} onToggleExpress={() => setExpressExpanded(x => !x)} slaMode={slaMode} />
          </div>

          {/* Trip-level SLA */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <SectionHeader noMargin>Trip-level SLA · Batched Trips · Trip Breached if Any Order Breached</SectionHeader>
              <div className="flex rounded-lg border border-gray-200 dark:border-zinc-600 overflow-hidden text-[11px] font-semibold">
                {(["del", "rdl"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSlaMode(mode)}
                    className={`px-3 py-1 transition-colors ${slaMode === mode ? "bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900" : "bg-white dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300"}`}
                  >
                    {mode === "del" ? "At DEL" : "At RDL"}
                  </button>
                ))}
              </div>
            </div>
            <ComparisonTable rows={[
              { label: "Batched Trips (count)",                     pre: preAgg.trip_batched_count,                                                          post: postAgg.trip_batched_count,                                                          higherIsBetter: true,  decimals: 0 },
              { label: "Breached Trips (count)",                    pre: slaMode === "del" ? preAgg.trip_breached_count     : preAgg.trip_breached_count_rdl,  post: slaMode === "del" ? postAgg.trip_breached_count     : postAgg.trip_breached_count_rdl,  higherIsBetter: false, decimals: 0 },
              { label: "Trip Breach Rate %",                        pre: slaMode === "del" ? preAgg.trip_breach_rate * 100  : preAgg.trip_breach_rate_rdl * 100, post: slaMode === "del" ? postAgg.trip_breach_rate * 100 : postAgg.trip_breach_rate_rdl * 100, unit: "%", higherIsBetter: false, decimals: 1 },
              { label: "First-Order Breach % (of breached trips)",  pre: slaMode === "del" ? preAgg.first_order_breach_pct * 100 : preAgg.first_order_breach_pct_rdl * 100, post: slaMode === "del" ? postAgg.first_order_breach_pct * 100 : postAgg.first_order_breach_pct_rdl * 100, unit: "%", higherIsBetter: false, decimals: 1 },
              { label: "Last-Order Breach % (of breached trips)",   pre: slaMode === "del" ? preAgg.last_order_breach_pct * 100  : preAgg.last_order_breach_pct_rdl * 100,  post: slaMode === "del" ? postAgg.last_order_breach_pct * 100  : postAgg.last_order_breach_pct_rdl * 100,  unit: "%", higherIsBetter: false, decimals: 1 },
              { label: "Avg Breach Position (0=first, 1=last)",     pre: slaMode === "del" ? preAgg.avg_breach_position          : preAgg.avg_breach_position_rdl,           post: slaMode === "del" ? postAgg.avg_breach_position          : postAgg.avg_breach_position_rdl,           higherIsBetter: true,  decimals: 2 },
            ]} />
          </div>

          {/* Delay Reasons */}
          {delayKillerChartData.length > 0 && (
            <div className="mb-5">
              <SectionHeader>Delay Reasons — Breached Orders</SectionHeader>
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-5 border border-gray-200 dark:border-zinc-700 shadow-sm mb-3">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={delayKillerChartData} margin={{ top: 10, right: 16, left: -8, bottom: 0 }} barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: tickFill }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend {...legendProps} />
                    <Bar dataKey="Last-mile travel"     stackId="a" fill="#f97316" />
                    <Bar dataKey="Handoff at door"      stackId="a" fill="#ef4444" />
                    <Bar dataKey="Cascade (prior stops)"stackId="a" fill="#8b5cf6" />
                    <Bar dataKey="Rider allotment"      stackId="a" fill="#3b82f6" />
                    <Bar dataKey="Rider acceptance"     stackId="a" fill="#06b6d4" />
                    <Bar dataKey="Pre-dispatch at hub"  stackId="a" fill="#14b8a6" />
                    <Bar dataKey="OFD event delay"      stackId="a" fill="#f59e0b" />
                    <Bar dataKey="Algo / batching"      stackId="a" fill="#84cc16" />
                    <Bar dataKey="Other stages"  stackId="a" fill="#d1d5db" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {delayFlagSummary.length > 0 && (
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-zinc-700">
                        <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-zinc-400">Flag</th>
                        <th className="text-right px-4 py-2 font-semibold text-gray-500 dark:text-zinc-400" style={{ color: COLOR_CTRL }}>① Orders</th>
                        <th className="text-right px-4 py-2 font-semibold text-gray-500 dark:text-zinc-400" style={{ color: COLOR_CTRL }}>① %</th>
                        <th className="text-right px-4 py-2 font-semibold text-gray-500 dark:text-zinc-400" style={{ color: COLOR_POST }}>② Orders</th>
                        <th className="text-right px-4 py-2 font-semibold text-gray-500 dark:text-zinc-400" style={{ color: COLOR_POST }}>② %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {delayFlagSummary.map((row, i) => (
                        <tr key={row.tag} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-800/50" : ""}>
                          <td className="px-4 py-1.5 text-gray-700 dark:text-zinc-300 font-medium">{row.label}</td>
                          <td className="px-4 py-1.5 text-right tabular-nums text-gray-900 dark:text-zinc-100">{row.r1Count || "—"}</td>
                          <td className="px-4 py-1.5 text-right tabular-nums text-gray-500 dark:text-zinc-400">{row.r1Count ? `${(row.r1Pct * 100).toFixed(0)}%` : "—"}</td>
                          <td className="px-4 py-1.5 text-right tabular-nums text-gray-900 dark:text-zinc-100">{row.r2Count || "—"}</td>
                          <td className="px-4 py-1.5 text-right tabular-nums text-gray-500 dark:text-zinc-400">{row.r2Count ? `${(row.r2Pct * 100).toFixed(0)}%` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Order Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <SectionHeader>Order Timeline · Mins per Stage</SectionHeader>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <button className={typeBtnCls(tlMetric === "avg")} onClick={() => setTlMetric("avg")}>Avg</button>
                  <button className={typeBtnCls(tlMetric === "p50")} onClick={() => setTlMetric("p50")}>Median</button>
                  <button className={typeBtnCls(tlMetric === "p90")} onClick={() => setTlMetric("p90")}>P90</button>
                </div>
                <span className="text-gray-200 dark:text-zinc-700 text-sm">|</span>
                <div className="flex gap-1.5">
                  <button className={typeBtnCls(timelineType === "dp")}        onClick={() => setTimelineType("dp")}>DP</button>
                  <button className={typeBtnCls(timelineType === "express")}   onClick={() => setTimelineType("express")}>Express</button>
                  <button className={typeBtnCls(timelineType === "scheduled")} onClick={() => setTimelineType("scheduled")}>Scheduled</button>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-5 border border-gray-200 dark:border-zinc-700 shadow-sm">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timelineData} margin={{ top: 22, right: 16, left: -8, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="stage" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} tickMargin={10} />
                  <YAxis tickFormatter={v => `${v}m`} tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)} mins`]} />
                  <Legend {...legendProps} />
                  <Bar dataKey="pre"  name="Range 1"  fill={COLOR_CTRL} radius={[4, 4, 0, 0]} barSize={28} minPointSize={2}>
                    <LabelList dataKey="pre"  position="top" style={{ fontSize: 10, fill: COLOR_CTRL, fontWeight: 600 }} formatter={(v: unknown) => v == null ? "" : `${v}m`} />
                  </Bar>
                  <Bar dataKey="post" name="Range 2" fill={COLOR_POST} radius={[4, 4, 0, 0]} barSize={28} minPointSize={2}>
                    <LabelList dataKey="post" position="top" style={{ fontSize: 10, fill: COLOR_POST, fontWeight: 600 }} formatter={(v: unknown) => v == null ? "" : `${v}m`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

    </DashboardLayout>
  );
}
