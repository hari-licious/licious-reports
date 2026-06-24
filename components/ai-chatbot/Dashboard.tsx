"use client";

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface Props {
  kpi: {
    optinPct: number;
    ctrlEsc: number;
    testEsc: number;
    ctrlO2c: number;
    testO2c: number;
    testSize: number;
  };
  trendData: { month: string; ctrlEsc: number | null; testEsc: number | null; ctrlO2c: number | null; testO2c: number | null }[];
  retentionData: { window: string; control: number; test: number }[];
  returnData:    { window: string; control: number; test: number }[];
}

function KpiCard({ label, value, sub, delta, downIsGood }: {
  label: string; value: string; sub?: string; delta?: number; downIsGood?: boolean;
}) {
  const isGood = delta !== undefined ? (downIsGood ? delta < 0 : delta > 0) : null;
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-400 uppercase mb-3">{label}</p>
      <p className="text-4xl font-bold text-gray-900 mb-2">{value}</p>
      {delta !== undefined && (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          isGood ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        }`}>
          {isGood ? "↑" : "↓"} {Math.abs(delta)}pp vs Control
        </span>
      )}
      {sub && !delta && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
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

export default function Dashboard({ kpi, trendData, retentionData, returnData }: Props) {
  return (
    <div className="min-h-screen bg-zinc-100 p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          AI Chatbot A/B Test
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Guided Help (Control) vs AI Chatbot (Test) · April – June 2026 · User-level assignment
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Opt-in Rate"           value={`${kpi.optinPct}%`}          sub="Apr–May avg" />
        <KpiCard label="Escalation Rate"       value={`${kpi.testEsc}%`}           delta={kpi.testEsc - kpi.ctrlEsc} downIsGood />
        <KpiCard label="Ticket Creation (O2C)" value={`${kpi.testO2c}%`}           delta={kpi.testO2c - kpi.ctrlO2c} downIsGood />
        <KpiCard label="Test Group Size"       value={kpi.testSize.toLocaleString()} sub="Shipments (Apr–Jun)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Escalation Rate" caption="% of users escalated to a human agent · Other Issues bucket">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${Math.round(v)}%`} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)}%`]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12, color: "#6B7280" }} />
              <Line dataKey="ctrlEsc" name="Control" stroke={CTRL} strokeWidth={2} dot={{ r: 4, fill: CTRL }} connectNulls />
              <Line dataKey="testEsc" name="Test (AI Chatbot)" stroke={TEST} strokeWidth={2} dot={{ r: 4, fill: TEST }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ticket Creation Rate (O2C)" caption="Tickets per support interaction · Other Issues bucket">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${Math.round(v)}%`} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)}%`]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12, color: "#6B7280" }} />
              <Line dataKey="ctrlO2c" name="Control" stroke={CTRL} strokeWidth={2} dot={{ r: 4, fill: CTRL }} connectNulls />
              <Line dataKey="testO2c" name="Test (AI Chatbot)" stroke={TEST} strokeWidth={2} dot={{ r: 4, fill: TEST }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mb-2">
        <p className="text-xs text-gray-500 mb-4">
          Retention · Control: Jan–Mar 2026 baseline &nbsp;·&nbsp; Test: Apr–Jun 2026
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Retention Rate" caption="Returned to use support">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={retentionData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="window" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)}%`]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12, color: "#6B7280" }} />
              <Bar dataKey="control" name="Control" fill={CTRL} radius={[4, 4, 0, 0]} barSize={28} />
              <Bar dataKey="test"    name="Test"    fill={TEST} radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Return Rate" caption="Placed another order">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={returnData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="window" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)}%`]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12, color: "#6B7280" }} />
              <Bar dataKey="control" name="Control" fill={CTRL} radius={[4, 4, 0, 0]} barSize={28} />
              <Bar dataKey="test"    name="Test"    fill={TEST} radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
