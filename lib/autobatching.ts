import fs from "fs";
import path from "path";

export interface RawDay {
  date: string;
  hub: string;
  period: "pre" | "post";

  // Orders query
  total_orders: number;
  dispatched_licious: number;
  dispatched_3p: number;
  p3_delivered: number;
  p3_on_time: number;
  total_licious_dispatched: number;
  total_orders_batched: number;

  // Trips query
  total_trips: number;
  single_order_trips: number;
  trip_duration_sum: number;
  total_riders: number;

  // Riders query
  de_hc: number;
  total_login_hrs: number;

  // SLA query
  total_licious: number;
  orders_with_rdl: number;
  on_time_orders: number;
  breached_orders: number;
  breach_mins_sum: number;
  breach_count: number;
  scheduled_orders: number;
  scheduled_with_rdl: number;
  scheduled_on_time: number;
  express_orders: number;
  express_with_rdl: number;
  express_on_time: number;
  dp_orders: number;
  dp_with_rdl: number;
  dp_on_time: number;

  // Timeline query
  orders_in_timeline: number;
  tl_created_to_picklist_sum: number;
  tl_created_to_picklist_cnt: number;
  tl_picklist_to_picked_sum: number;
  tl_picklist_to_picked_cnt: number;
  tl_picked_to_packed_sum: number;
  tl_picked_to_packed_cnt: number;
  tl_packed_to_allotted_sum: number;
  tl_packed_to_allotted_cnt: number;
  tl_allotted_to_accepted_sum: number;
  tl_allotted_to_accepted_cnt: number;
  tl_accepted_to_dispatch_sum: number;
  tl_accepted_to_dispatch_cnt: number;
  tl_dispatch_to_ofd_sum: number;
  tl_dispatch_to_ofd_cnt: number;
  tl_ofd_to_rdl_sum: number;
  tl_ofd_to_rdl_cnt: number;
  warehouse_sum: number;
  warehouse_cnt: number;
  staging_sum: number;
  staging_cnt: number;
  lastmile_sum: number;
  lastmile_cnt: number;
  total_to_rdl_sum: number;
  total_to_rdl_cnt: number;

  // DP warehouse timeline (created→picked, picked→packed, packed→dispatched)
  dp_tl_created_to_picked_sum: number;
  dp_tl_created_to_picked_cnt: number;
  dp_tl_picked_to_packed_sum: number;
  dp_tl_picked_to_packed_cnt: number;
  dp_tl_packed_to_dispatched_sum: number;
  dp_tl_packed_to_dispatched_cnt: number;

  // DP last-mile timeline
  dp_tl_dispatch_to_ofd_sum: number;
  dp_tl_dispatch_to_ofd_cnt: number;
  dp_tl_ofd_to_rdl_sum: number;
  dp_tl_ofd_to_rdl_cnt: number;

  // Express warehouse + last-mile timeline
  express_tl_created_to_picked_sum: number;
  express_tl_created_to_picked_cnt: number;
  express_tl_picked_to_packed_sum: number;
  express_tl_picked_to_packed_cnt: number;
  express_tl_packed_to_dispatched_sum: number;
  express_tl_packed_to_dispatched_cnt: number;
  express_tl_dispatch_to_ofd_sum: number;
  express_tl_dispatch_to_ofd_cnt: number;
  express_tl_ofd_to_rdl_sum: number;
  express_tl_ofd_to_rdl_cnt: number;

  // Scheduled last-mile timeline
  sched_tl_allotted_to_accepted_sum: number;
  sched_tl_allotted_to_accepted_cnt: number;
  sched_tl_accepted_to_dispatched_sum: number;
  sched_tl_accepted_to_dispatched_cnt: number;
  sched_tl_dispatch_to_ofd_sum: number;
  sched_tl_dispatch_to_ofd_cnt: number;
  sched_tl_ofd_to_rdl_sum: number;
  sched_tl_ofd_to_rdl_cnt: number;

  // Batching by order type (from SLA query)
  dp_batched: number;
  express_batched: number;
  scheduled_batched: number;

  // Trip-level SLA
  trip_sla_batched_trips: number;
  trip_sla_breached_trips: number;
  trip_sla_first_order_breach: number;
  trip_sla_last_order_breach: number;
  trip_sla_breach_pos_sum: number;
  trip_sla_breach_pos_cnt: number;
}

export interface AutobatchingData {
  hub: string;
  pre_range: string;
  post_range: string;
  generated_at: string;
  days: RawDay[];
}

export function getAutobatchingData(): AutobatchingData {
  const filePath = path.join(process.cwd(), "data", "autobatching", "raw_daily.json");

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as AutobatchingData;
  } catch {
    // File not yet generated — return empty shell
    return {
      hub: "PSN",
      pre_range: "2026-06-10 to 2026-06-16",
      post_range: "2026-06-18 to 2026-06-23",
      generated_at: "",
      days: [],
    };
  }
}
