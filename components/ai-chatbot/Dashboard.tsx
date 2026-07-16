"use client";

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { COLOR_CTRL, COLOR_TEST } from "@/lib/theme";
import { useChartTheme } from "@/lib/useChartTheme";
import { DashboardLayout } from "@/components/ui/DashboardLayout";
import { DashboardHeader } from "@/components/ui/DashboardHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { KpiCard } from "@/components/ui/KpiCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { GlossarySection } from "@/components/ui/GlossarySection";

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

const CTRL = COLOR_CTRL;
const TEST = COLOR_TEST;

const GLOSSARY = [
  { term: "Control", def: "Guided Help variant — users see the standard post-order support flow." },
  { term: "Test", def: "AI Chatbot variant — users are offered the AI chatbot after selecting their issue." },
  { term: "GH (Guided Help)", def: "Post-order customer support flow. One session = one conversation." },
  { term: "Opt-in Rate", def: "% of all test conversations (Apr–May) where the user opened the AI chatbot." },
  { term: "Escalation Rate", def: "% of conversations escalated to a human agent. Comparable bucket: Other Issues (Control) and My Issue Not Listed (Test)." },
  { term: "O2C (Order-to-Contact)", def: "GH tickets raised per shipment in the comparable bucket. Lower is better." },
  { term: "Test Group Size", def: "Total shipments in the Test variant (Apr–Jun), all buckets combined." },
  { term: "Retention Rate", def: "% of users who returned to use Guided Help within the time window (7/14/28 days)." },
  { term: "Return Rate", def: "% of users who placed another order within the time window (7/14/28 days)." },
];

export default function Dashboard({ kpi, trendData, retentionData, returnData }: Props) {
  const { gridStroke, tickFill, tooltipStyle, legendProps } = useChartTheme();

  function downloadCsv() {
    const rows: (string | number | null)[][] = [
      ["Section", "Period/Window", "Metric", "Control", "Test"],
      ["Summary", "Apr–May", "Opt-in Rate %", "", kpi.optinPct],
      ["Summary", "Apr–May", "Escalation Rate %", kpi.ctrlEsc, kpi.testEsc],
      ["Summary", "Apr–May", "O2C %", kpi.ctrlO2c, kpi.testO2c],
      ["Summary", "Apr–Jun", "Test Group Size (shipments)", "", kpi.testSize],
      ...trendData.map(r => ["Trend", r.month, "Escalation Rate %", r.ctrlEsc ?? "", r.testEsc ?? ""]),
      ...trendData.map(r => ["Trend", r.month, "O2C %", r.ctrlO2c ?? "", r.testO2c ?? ""]),
      ...retentionData.map(r => ["Retention", r.window, "Retention Rate %", r.control, r.test]),
      ...returnData.map(r => ["Return", r.window, "Return Rate %", r.control, r.test]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ai-chatbot-ab.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <DashboardLayout>
      <DashboardHeader
        title="AI Chatbot A/B Test"
        subtitle="Guided Help (Control) vs AI Chatbot (Test) · April – June 2026 · User-level assignment"
        onDownload={downloadCsv}
      />

      <SectionLabel>Summary · Apr–May 2026</SectionLabel>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Opt-in Rate"           value={`${kpi.optinPct}%`}            sub="Apr–May avg" />
        <KpiCard label="Escalation Rate"       value={`${kpi.testEsc}%`}             delta={kpi.testEsc - kpi.ctrlEsc} downIsGood />
        <KpiCard label="Ticket Creation (O2C)" value={`${kpi.testO2c}%`}             delta={kpi.testO2c - kpi.ctrlO2c} downIsGood />
        <KpiCard label="Test Group Size"       value={kpi.testSize.toLocaleString()} sub="Shipments (Apr–Jun)" />
      </div>

      <SectionLabel>Monthly Trends</SectionLabel>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
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

      <SectionLabel>Retention &amp; Return</SectionLabel>
      <p className="text-xs text-gray-500 dark:text-zinc-400 -mt-2 mb-4">
        Control: Jan–Mar 2026 baseline &nbsp;·&nbsp; Test: Apr–Jun 2026
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Retention Rate" caption="Returned to use Guided Help within window">
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

        <ChartCard title="Return Rate" caption="Placed another order within window">
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

      <GlossarySection items={GLOSSARY} />
    </DashboardLayout>
  );
}
