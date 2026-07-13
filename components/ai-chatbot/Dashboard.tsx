"use client";

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { COLOR_CTRL, COLOR_TEST } from "@/lib/theme";
import { useChartTheme } from "@/lib/useChartTheme";
import { DashboardLayout } from "@/components/ui/DashboardLayout";

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
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-400 dark:text-zinc-500 uppercase mb-3">{label}</p>
      <p className="text-4xl font-bold text-gray-900 dark:text-zinc-100 mb-2">{value}</p>
      {delta !== undefined && (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          isGood
            ? "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400"
            : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
        }`}>
          {isGood ? "↑" : "↓"} {Math.abs(delta)}pp vs Control
        </span>
      )}
      {sub && !delta && <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, caption, children }: { title: string; caption?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 shadow-sm">
      <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-0.5">{title}</p>
      {caption && <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">{caption}</p>}
      {children}
    </div>
  );
}

const CTRL = COLOR_CTRL;
const TEST = COLOR_TEST;

export default function Dashboard({ kpi, trendData, retentionData, returnData }: Props) {
  const { gridStroke, tickFill, tooltipStyle, legendProps } = useChartTheme();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-zinc-100" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          AI Chatbot A/B Test
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
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
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis tickFormatter={(v) => `${Math.round(v)}%`} tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)}%`]} />
              <Legend {...legendProps} />
              <Line dataKey="ctrlEsc" name="Control" stroke={CTRL} strokeWidth={2} dot={{ r: 4, fill: CTRL }} connectNulls />
              <Line dataKey="testEsc" name="Test (AI Chatbot)" stroke={TEST} strokeWidth={2} dot={{ r: 4, fill: TEST }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ticket Creation Rate (O2C)" caption="Tickets per support interaction · Other Issues bucket">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis tickFormatter={(v) => `${Math.round(v)}%`} tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)}%`]} />
              <Legend {...legendProps} />
              <Line dataKey="ctrlO2c" name="Control" stroke={CTRL} strokeWidth={2} dot={{ r: 4, fill: CTRL }} connectNulls />
              <Line dataKey="testO2c" name="Test (AI Chatbot)" stroke={TEST} strokeWidth={2} dot={{ r: 4, fill: TEST }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mb-2">
        <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">
          Retention · Control: Jan–Mar 2026 baseline &nbsp;·&nbsp; Test: Apr–Jun 2026
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Retention Rate" caption="Returned to use support">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={retentionData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="window" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)}%`]} />
              <Legend {...legendProps} />
              <Bar dataKey="control" name="Control" fill={CTRL} radius={[4, 4, 0, 0]} barSize={28} />
              <Bar dataKey="test"    name="Test"    fill={TEST} radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Return Rate" caption="Placed another order">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={returnData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="window" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)}%`]} />
              <Legend {...legendProps} />
              <Bar dataKey="control" name="Control" fill={CTRL} radius={[4, 4, 0, 0]} barSize={28} />
              <Bar dataKey="test"    name="Test"    fill={TEST} radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
