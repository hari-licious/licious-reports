import rawData from "@/data/autobatching/raw_daily.json";
import rawDelayReasons from "@/data/autobatching/delay_reasons.json";

import rawPSN  from "@/data/autobatching/raw_daily_PSN.json";
import rawJPNS from "@/data/autobatching/raw_daily_JPNS.json";
import rawOUC  from "@/data/autobatching/raw_daily_OUC.json";
import rawKYN  from "@/data/autobatching/raw_daily_KYN.json";
import rawTBM  from "@/data/autobatching/raw_daily_TBM.json";

import delayPSN  from "@/data/autobatching/delay_reasons_PSN.json";
import delayJPNS from "@/data/autobatching/delay_reasons_JPNS.json";
import delayOUC  from "@/data/autobatching/delay_reasons_OUC.json";
import delayKYN  from "@/data/autobatching/delay_reasons_KYN.json";
import delayTBM  from "@/data/autobatching/delay_reasons_TBM.json";

export interface RawDay {
  date: string;
  hub: string;
  period: "pre" | "post" | "gap";

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
  dp_tl_created_to_picked_sum: number | null;
  dp_tl_created_to_picked_cnt: number;
  dp_tl_picked_to_packed_sum: number | null;
  dp_tl_picked_to_packed_cnt: number;
  dp_tl_packed_to_dispatched_sum: number | null;
  dp_tl_packed_to_dispatched_cnt: number;

  // DP last-mile timeline
  dp_tl_dispatch_to_ofd_sum: number | null;
  dp_tl_dispatch_to_ofd_cnt: number;
  dp_tl_ofd_to_rdl_sum: number | null;
  dp_tl_ofd_to_rdl_cnt: number;

  // Express warehouse + last-mile timeline
  express_tl_created_to_picked_sum: number | null;
  express_tl_created_to_picked_cnt: number;
  express_tl_picked_to_packed_sum: number | null;
  express_tl_picked_to_packed_cnt: number;
  express_tl_packed_to_dispatched_sum: number | null;
  express_tl_packed_to_dispatched_cnt: number;
  express_tl_dispatch_to_ofd_sum: number | null;
  express_tl_dispatch_to_ofd_cnt: number;
  express_tl_ofd_to_rdl_sum: number | null;
  express_tl_ofd_to_rdl_cnt: number;

  // DP allocation sub-stages (packed→allotted, allotted→accepted, accepted→dispatch)
  dp_tl_packed_to_allotted_sum: number | null;
  dp_tl_packed_to_allotted_cnt: number;
  dp_tl_allotted_to_accepted_sum: number | null;
  dp_tl_allotted_to_accepted_cnt: number;
  dp_tl_accepted_to_dispatch_sum: number | null;
  dp_tl_accepted_to_dispatch_cnt: number;

  // Express allocation sub-stages
  express_tl_packed_to_allotted_sum: number | null;
  express_tl_packed_to_allotted_cnt: number;
  express_tl_allotted_to_accepted_sum: number | null;
  express_tl_allotted_to_accepted_cnt: number;
  express_tl_accepted_to_dispatch_sum: number | null;
  express_tl_accepted_to_dispatch_cnt: number;

  // Scheduled last-mile timeline
  sched_tl_allotted_to_accepted_sum: number | null;
  sched_tl_allotted_to_accepted_cnt: number;
  sched_tl_accepted_to_dispatched_sum: number | null;
  sched_tl_accepted_to_dispatched_cnt: number;
  sched_tl_dispatch_to_ofd_sum: number | null;
  sched_tl_dispatch_to_ofd_cnt: number;
  sched_tl_ofd_to_rdl_sum: number | null;
  sched_tl_ofd_to_rdl_cnt: number;

  // RDL→DEL timeline
  dp_tl_rdl_to_del_sum: number | null;
  dp_tl_rdl_to_del_cnt: number;
  dp_tl_rdl_to_del_p50: number | null;
  dp_tl_rdl_to_del_p90: number | null;
  express_tl_rdl_to_del_sum: number | null;
  express_tl_rdl_to_del_cnt: number;
  express_tl_rdl_to_del_p50: number | null;
  express_tl_rdl_to_del_p90: number | null;
  sched_tl_rdl_to_del_sum: number | null;
  sched_tl_rdl_to_del_cnt: number;
  sched_tl_rdl_to_del_p50: number | null;
  sched_tl_rdl_to_del_p90: number | null;

  // Percentiles (p50/p90) per day — weighted avg by cnt used in dashboard aggregation
  dp_tl_created_to_picked_p50: number | null;
  dp_tl_created_to_picked_p90: number | null;
  dp_tl_picked_to_packed_p50: number | null;
  dp_tl_picked_to_packed_p90: number | null;
  dp_tl_packed_to_dispatched_p50: number | null;
  dp_tl_packed_to_dispatched_p90: number | null;
  dp_tl_dispatch_to_ofd_p50: number | null;
  dp_tl_dispatch_to_ofd_p90: number | null;
  dp_tl_ofd_to_rdl_p50: number | null;
  dp_tl_ofd_to_rdl_p90: number | null;
  dp_tl_packed_to_allotted_p50: number | null;
  dp_tl_packed_to_allotted_p90: number | null;
  dp_tl_allotted_to_accepted_p50: number | null;
  dp_tl_allotted_to_accepted_p90: number | null;
  dp_tl_accepted_to_dispatch_p50: number | null;
  dp_tl_accepted_to_dispatch_p90: number | null;

  express_tl_created_to_picked_p50: number | null;
  express_tl_created_to_picked_p90: number | null;
  express_tl_picked_to_packed_p50: number | null;
  express_tl_picked_to_packed_p90: number | null;
  express_tl_packed_to_dispatched_p50: number | null;
  express_tl_packed_to_dispatched_p90: number | null;
  express_tl_dispatch_to_ofd_p50: number | null;
  express_tl_dispatch_to_ofd_p90: number | null;
  express_tl_ofd_to_rdl_p50: number | null;
  express_tl_ofd_to_rdl_p90: number | null;
  express_tl_packed_to_allotted_p50: number | null;
  express_tl_packed_to_allotted_p90: number | null;
  express_tl_allotted_to_accepted_p50: number | null;
  express_tl_allotted_to_accepted_p90: number | null;
  express_tl_accepted_to_dispatch_p50: number | null;
  express_tl_accepted_to_dispatch_p90: number | null;

  sched_tl_allotted_to_accepted_p50: number | null;
  sched_tl_allotted_to_accepted_p90: number | null;
  sched_tl_accepted_to_dispatched_p50: number | null;
  sched_tl_accepted_to_dispatched_p90: number | null;
  sched_tl_dispatch_to_ofd_p50: number | null;
  sched_tl_dispatch_to_ofd_p90: number | null;
  sched_tl_ofd_to_rdl_p50: number | null;
  sched_tl_ofd_to_rdl_p90: number | null;

  // Batching by order type (from SLA query)
  dp_batched: number;
  express_batched: number;
  scheduled_batched: number;

  // Express sub-buckets by promise window
  ex_30_45_orders: number;
  ex_30_45_with_rdl: number;
  ex_30_45_on_time: number;
  ex_45_60_orders: number;
  ex_45_60_with_rdl: number;
  ex_45_60_on_time: number;
  ex_60_90_orders: number;
  ex_60_90_with_rdl: number;
  ex_60_90_on_time: number;
  ex_90p_orders: number;
  ex_90p_with_rdl: number;
  ex_90p_on_time: number;

  // Trip-level SLA (DEL-based)
  trip_sla_batched_trips: number;
  trip_sla_breached_trips: number;
  trip_sla_first_order_breach: number;
  trip_sla_last_order_breach: number;
  trip_sla_breach_pos_sum: number;
  trip_sla_breach_pos_cnt: number;
  // Trip-level SLA (RDL-based)
  trip_sla_breached_trips_rdl: number;
  trip_sla_first_order_breach_rdl: number;
  trip_sla_last_order_breach_rdl: number;
  trip_sla_breach_pos_sum_rdl: number;
  trip_sla_breach_pos_cnt_rdl: number;

  // Batched order SLA + EOB
  batched_with_rdl: number;
  batched_on_time: number;
  batched_breach_mins_sum: number;
  batched_breach_count: number;
  breach_p50_mins: number;
  batched_breach_p50_mins: number;

  // RDL-based SLA (SLA measured at REACHED_DELIVERY_LOCATION instead of DELIVERED)
  orders_with_rdl_ts: number;
  on_time_rdl: number;
  breached_rdl: number;
  breach_mins_rdl_sum: number;
  scheduled_with_rdl_ts: number;
  scheduled_on_time_rdl: number;
  express_with_rdl_ts: number;
  express_on_time_rdl: number;
  dp_with_rdl_ts: number;
  dp_on_time_rdl: number;
  batched_with_rdl_ts: number;
  batched_on_time_rdl: number;
  batched_breach_mins_rdl_sum: number;
  batched_breach_rdl_count: number;

  // Rider queue metrics (rider_auto_allocation_events)
  empty_queue_mins?: number;
  rider_return_trip_count?: number;
  rider_return_p50?: number;
  rider_return_p90?: number;
}

export interface AutobatchingData {
  hub: string;
  pre_range: string;
  post_range: string;
  generated_at: string;
  days: RawDay[];
}

export function getAutobatchingData(): AutobatchingData {
  return rawData as AutobatchingData;
}

const ALL_HUBS = [
  { id: "PSN",  label: "PSN",  profile: "",            go_live: "2026-06-18" },
  { id: "JPNS", label: "JPNS", profile: "30 + 90",     go_live: "2026-07-30" },
  { id: "OUC",  label: "OUC",  profile: "30",          go_live: "2026-07-30" },
  { id: "KYN",  label: "KYN",  profile: "Mother Hub",  go_live: "2026-08-04" },
  { id: "TBM",  label: "TBM",  profile: "High OD",     go_live: "2026-08-04" },
] as const;

const TODAY = new Date().toISOString().slice(0, 10);
export const HUB_LIST = ALL_HUBS.filter(h => h.go_live <= TODAY);

export type HubId = typeof ALL_HUBS[number]["id"];

export interface DelayTypeBreakdown {
  total_breached: number;
  tags: Record<string, number>;
  killer: Record<string, number>;
}

export interface PredictedStatsByType {
  algo_predicted: number;
  true_positive: number;
  false_positive: number;
  hit_rate: number | null;
  error_p50: number | null;
  error_p90: number | null;
}

export interface PredictedStats {
  algo_predicted: number;
  true_positive: number;
  false_positive: number;
  unexpected: number;
  hit_rate: number | null;
  predicted_eob_p50: number | null;
  unexpected_eob_p50: number | null;
  error_p50: number | null;
  error_p90: number | null;
  by_type?: Record<string, PredictedStatsByType>;
}

export interface DelayDay {
  date: string;
  total_breached: number;
  tags: Record<string, number>;
  killer: Record<string, number>;
  by_type?: Record<string, DelayTypeBreakdown>;
  predicted_stats?: PredictedStats;
}

export interface DelayReasonsData {
  days: DelayDay[];
}

export function getDelayReasonsData(): DelayReasonsData {
  return rawDelayReasons as unknown as DelayReasonsData;
}

const ALL_RAW_DATA: Record<HubId, AutobatchingData> = {
  PSN:  rawPSN  as AutobatchingData,
  JPNS: rawJPNS as AutobatchingData,
  OUC:  rawOUC  as AutobatchingData,
  KYN:  rawKYN  as AutobatchingData,
  TBM:  rawTBM  as AutobatchingData,
};

const ALL_DELAY_DATA: Record<HubId, DelayReasonsData> = {
  PSN:  delayPSN  as unknown as DelayReasonsData,
  JPNS: delayJPNS as unknown as DelayReasonsData,
  OUC:  delayOUC  as unknown as DelayReasonsData,
  KYN:  delayKYN  as unknown as DelayReasonsData,
  TBM:  delayTBM  as unknown as DelayReasonsData,
};

export function getAutobatchingDataForHub(hub: HubId): AutobatchingData {
  return ALL_RAW_DATA[hub];
}

export function getDelayReasonsForHub(hub: HubId): DelayReasonsData {
  return ALL_DELAY_DATA[hub];
}

export function getAllGeneratedAt(): Record<HubId, string> {
  const result = {} as Record<HubId, string>;
  for (const h of HUB_LIST) {
    result[h.id] = ALL_RAW_DATA[h.id].generated_at;
  }
  return result;
}
