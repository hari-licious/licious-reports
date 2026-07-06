"use client";

import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { WowRow } from "@/lib/ai-chatbot-wow";

interface Props {
  generatedAt: string;
  rows: WowRow[];
}

const CTRL = "#94A3B8";
const TEST = "#16A34A";

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: "12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  fontSize: 12,
  color: "#111827",
};

function pct(v: number | null, decimals = 1): string {
  if (v === null || v === undefined) return "—";
  return `${(v * 100).toFixed(decimals)}%`;
}

function num(v: number): string {
  return v.toLocaleString();
}

function KpiCard({ label, ctrlValue, testValue, ctrlSub, testSub, downIsGood }: {
  label: string;
  ctrlValue: string;
  testValue: string;
  ctrlSub?: string;
  testSub?: string;
  downIsGood?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-400 uppercase mb-3">{label}</p>
      <div className="flex gap-6">
        <div>
          <p className="text-xs text-gray-400 mb-1">Control</p>
          <p className="text-2xl font-bold text-gray-900">{ctrlValue}</p>
          {ctrlSub && <p className="text-xs text-gray-500 mt-1">{ctrlSub}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Test</p>
          <p className="text-2xl font-bold text-gray-900">{testValue}</p>
          {testSub && <p className="text-xs text-gray-500 mt-1">{testSub}</p>}
        </div>
      </div>
    </div>
  );
}

function SingleKpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-400 uppercase mb-3">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-2">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, caption, children }: { title: string; caption?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-400 uppercase mb-1">{title}</p>
      {caption && <p className="text-xs text-gray-500 mb-4">{caption}</p>}
      {children}
    </div>
  );
}

export default function Dashboard({ generatedAt, rows }: Props) {
  // Derive week order from data (JSON rows are already sorted by week)
  const WEEKS = [...new Set(rows.map((r) => r.week))];

  const byWeekVariantBucket = (week: string, variant: string, bucket: string) =>
    rows.find((r) => r.week === week && r.variant === variant && r.bucket === bucket);

  // Build trend data per week
  const trendData = WEEKS.map((w) => {
    const cRest = byWeekVariantBucket(w, "control", "rest");
    const cOi   = byWeekVariantBucket(w, "control", "otherIssues");
    const tRest  = byWeekVariantBucket(w, "test", "rest");
    const tMinl  = byWeekVariantBucket(w, "test", "minl");
    const label  = w.replace(" ", "\n").split(" ")[0]; // "W1"
    const testOptinRate = (tRest != null && tMinl != null)
      ? (tRest.aiOptin + tMinl.aiOptin) / (tRest.totalConvos + tMinl.totalConvos)
      : null;
    return {
      week: label,
      optinRate:   testOptinRate != null ? testOptinRate * 100 : null,
      ctrlEsc:     cRest?.escalationRate != null ? cRest.escalationRate * 100 : null,
      testEsc:     tRest?.escalationRate != null ? tRest.escalationRate * 100 : null,
      ctrlGhO2c:   cOi?.ghO2c           != null ? cOi.ghO2c * 100           : null,
      testGhO2c:   tMinl?.ghO2c         != null ? tMinl.ghO2c * 100         : null,
      ctrlCsat:    cOi?.csat             != null ? cOi.csat * 100            : null,
      testCsat:    tMinl?.csat           != null ? tMinl.csat * 100          : null,
    };
  });

  // Latest week KPIs
  const lastWeek = WEEKS[WEEKS.length - 1];
  const w4cRest = byWeekVariantBucket(lastWeek, "control", "rest");
  const w4cOi   = byWeekVariantBucket(lastWeek, "control", "otherIssues");
  const w4tRest  = byWeekVariantBucket(lastWeek, "test", "rest");
  const w4tMinl  = byWeekVariantBucket(lastWeek, "test", "minl");
  const w4TestOptinRate = (w4tRest != null && w4tMinl != null)
    ? (w4tRest.aiOptin + w4tMinl.aiOptin) / (w4tRest.totalConvos + w4tMinl.totalConvos)
    : null;

  const BUCKET_LABEL: Record<string, string> = {
    rest:        "Rest of Options",
    otherIssues: "Other Issues",
    minl:        "My Issue Not Listed",
  };
  const BUCKET_ORDER = [
    { variant: "control", bucket: "rest" },
    { variant: "control", bucket: "otherIssues" },
    { variant: "test",    bucket: "rest" },
    { variant: "test",    bucket: "minl" },
  ];

  const WEEKS_DESC = [...WEEKS].reverse();

  const isPending = generatedAt === "pending";

  function downloadCsv() {
    const headers = [
      "Week","Variant","Bucket","Total Convos","AI Optin","GH Shipments",
      "GH Tickets","Escalations","CSAT Convos","Positive CSAT","Negative CSAT",
      "Optin Rate","Control Sanity","Escalation Rate","GH O2C","CSAT Response Rate",
      "CSAT Positive Rate","CSAT",
    ];
    const csvRows = rows.map((r) =>
      [
        r.week, r.variant, BUCKET_LABEL[r.bucket] ?? r.bucket,
        r.totalConvos, r.aiOptin, r.ghShipments, r.ghTickets, r.escalations,
        r.csatConvos, r.positiveCsat, r.negativeCsat,
        r.optinRate ?? "", r.controlSanity ?? "", r.escalationRate ?? "",
        r.ghO2c ?? "", r.csatResponseRate ?? "", r.csatPositiveRate ?? "", r.csat ?? "",
      ].join(",")
    );
    const blob = new Blob([[headers.join(","), ...csvRows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-chatbot-wow-${generatedAt.split(" ")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-zinc-100 p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1
            className="text-4xl font-bold tracking-tight text-gray-900"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            AI Chatbot — Week on Week
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Guided Help (Control) vs AI Chatbot (Test) · Jun 3–28, 2026 · Ticket attributed to latest conversation before ticket timestamp
          </p>
          <span className={`inline-block mt-3 text-xs font-medium px-3 py-1 rounded-full ${isPending ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"}`}>
            {isPending ? "⏳ Data pending — run generate_wow_json.py after Trino completes" : `Last updated: ${generatedAt}`}
          </span>
        </div>
        <button
          onClick={downloadCsv}
          className="mt-1 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ↓ Download CSV
        </button>
      </div>

      {/* KPI Cards — latest week snapshot */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Latest week ({lastWeek})</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SingleKpiCard
          label="Optin Rate"
          value={pct(w4TestOptinRate)}
          sub="AI chat opens / all test convos"
        />
        <KpiCard
          label="Escalation %"
          ctrlValue={pct(w4cRest?.escalationRate ?? null)}
          testValue={pct(w4tRest?.escalationRate ?? null)}
          ctrlSub="Rest bucket"
          testSub="Rest bucket"
          downIsGood
        />
        <KpiCard
          label="GH O2C %"
          ctrlValue={pct(w4cOi?.ghO2c ?? null)}
          testValue={pct(w4tMinl?.ghO2c ?? null)}
          ctrlSub="Other Issues"
          testSub="MINL bucket"
          downIsGood
        />
        <KpiCard
          label="CSAT"
          ctrlValue={pct(w4cOi?.csat ?? null)}
          testValue={pct(w4tMinl?.csat ?? null)}
          ctrlSub="Other Issues"
          testSub="MINL bucket"
        />
      </div>

      {/* WoW Trend Charts */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Week-on-week trends</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <ChartCard title="Optin Rate %" caption="All test convos (ROTO + MINL) — % that opened the AI chatbot">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)}%`]} />
              <Line dataKey="optinRate" name="Optin Rate" stroke={TEST} strokeWidth={2} dot={{ r: 4, fill: TEST }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Escalation Rate %" caption="Control: pid26/27 clicked · Test: ESCALATION_INTENT · Rest bucket">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)}%`]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12, color: "#6B7280" }} />
              <Line dataKey="ctrlEsc" name="Control" stroke={CTRL} strokeWidth={2} dot={{ r: 4, fill: CTRL }} connectNulls />
              <Line dataKey="testEsc" name="Test"    stroke={TEST} strokeWidth={2} dot={{ r: 4, fill: TEST }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="GH O2C %" caption="Tickets / shipments · Control: Other Issues · Test: MINL bucket">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)}%`]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12, color: "#6B7280" }} />
              <Line dataKey="ctrlGhO2c" name="Control (Other Issues)" stroke={CTRL} strokeWidth={2} dot={{ r: 4, fill: CTRL }} connectNulls />
              <Line dataKey="testGhO2c" name="Test (MINL)"            stroke={TEST} strokeWidth={2} dot={{ r: 4, fill: TEST }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="CSAT" caption="Positive CSAT / CSAT responses · Control: Other Issues · Test: MINL">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)}%`]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12, color: "#6B7280" }} />
              <Line dataKey="ctrlCsat" name="Control" stroke={CTRL} strokeWidth={2} dot={{ r: 4, fill: CTRL }} connectNulls />
              <Line dataKey="testCsat" name="Test"    stroke={TEST} strokeWidth={2} dot={{ r: 4, fill: TEST }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Weekly Summary Table */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Full weekly breakdown</p>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Week</th>
              <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Variant</th>
              <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Bucket</th>
              <th className="text-right p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Convos</th>
              <th className="text-right p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Optin %</th>
              <th className="text-right p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Esc %</th>
              <th className="text-right p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">GH O2C</th>
              <th className="text-right p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">CSAT</th>
            </tr>
          </thead>
          <tbody>
            {WEEKS_DESC.map((w, wi) =>
              BUCKET_ORDER.map(({ variant, bucket }, bi) => {
                const row       = byWeekVariantBucket(w, variant, bucket);
                const isFirst   = bi === 0;
                const isLast    = bi === BUCKET_ORDER.length - 1;
                const weekLabel = w.split(" ")[0];
                const weekDates = w.split(" ").slice(1).join(" ");
                return (
                  <tr
                    key={`${w}-${variant}-${bucket}`}
                    className={`${isLast && wi < WEEKS_DESC.length - 1 ? "border-b-2 border-gray-200" : "border-b border-gray-50"} ${variant === "test" ? "bg-green-50/30" : "bg-white"}`}
                  >
                    {isFirst && (
                      <td rowSpan={4} className="p-4 align-top border-r border-gray-100 font-bold text-gray-900 whitespace-nowrap">
                        {weekLabel}
                        <span className="block text-xs font-normal text-gray-400 mt-0.5">{weekDates}</span>
                      </td>
                    )}
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${variant === "control" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}>
                        {variant === "control" ? "Control" : "Test"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs">{BUCKET_LABEL[bucket]}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{row ? num(row.totalConvos) : "—"}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{pct(row?.optinRate ?? null)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{pct(row?.escalationRate ?? null)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{pct(row?.ghO2c ?? null)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{pct(row?.csat ?? null)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Glossary */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 mt-8">Glossary</p>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
          {[
            { term: "Control",        def: "Guided Help variant — users see the standard post-order support flow." },
            { term: "Test",           def: "AI Chatbot variant — users are offered the AI chatbot after clicking their issue." },
            { term: "GH",             def: "Guided Help — the post-order support flow. A 'conversation' = one GH session." },
            { term: "ROTO",           def: "Rest of the Options — users who clicked any issue except the primary bucket (pid6 / pid112)." },
            { term: "OI",             def: "Other Issues (pid6) — the control bucket. Clicking this leads to agent escalation." },
            { term: "MINL",           def: "My Issue Is Not Listed (pid112) — the test bucket. Clicking this opens the AI chatbot." },
            { term: "Optin Rate",     def: "% of all test conversations (ROTO + MINL) that opened the AI chatbot." },
            { term: "Escalation %",   def: "% of conversations where the user was suggested to speak to a human agent." },
            { term: "GH O2C",         def: "Tickets raised per shipment via Guided Help (can exceed 100%)." },
            { term: "CSAT",           def: "% of CSAT responses that were positive. Control: OI bucket. Test: MINL bucket." },
            { term: "Control Sanity", def: "% of control ROTO users who accidentally entered the AI chatbot — expected ~0." },
            { term: "WoW",            def: "Week on Week — weekly windows running Tuesday to Monday." },
          ].map(({ term, def }) => (
            <div key={term}>
              <dt className="text-xs font-semibold text-gray-700">{term}</dt>
              <dd className="text-xs text-gray-500 mt-0.5">{def}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
