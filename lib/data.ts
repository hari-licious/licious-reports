import fs from "fs";
import path from "path";
import Papa from "papaparse";

const DATA = path.join(process.cwd(), "data", "ai_chatbot");

function readCsv<T>(filename: string): T[] {
  const raw = fs.readFileSync(path.join(DATA, filename), "utf-8");
  const result = Papa.parse<T>(raw, { header: true, skipEmptyLines: true, dynamicTyping: true });
  return result.data;
}

interface MetricsRow {
  Month: string;
  Variant: string;
  "Variant Split": string;
  "Total Convos": number;
  "AI Optin": number;
  "Optin Rate %": number;
}

interface GhRow {
  Month: string;
  Variant: string;
  "GH Outcome": string;
  "GH Bucket": string;
  "Shipment (Variant Level)": number;
  "Suggested to Agent %": number;
  "O2C": number;
}

interface RetentionRow {
  Period: string;
  Variant: string;
  Group: string;
  "Retention 7D %": string;
  "Retention 14D %": string;
  "Retention 28D %": string;
  "Return Rate 7D %": string;
  "Return Rate 14D %": string;
  "Return Rate 28D %": string;
}

const CORE_MONTHS = ["2026-04", "2026-05"];
const ALL_MONTHS  = ["2026-04", "2026-05", "2026-06"];
const MONTH_LABEL: Record<string, string> = {
  "2026-04": "Apr",
  "2026-05": "May",
  "2026-06": "Jun",
};

function parsePct(val: string | number): number {
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace("%", "").trim());
}

export function getAiChatbotData() {
  const metrics = readCsv<MetricsRow>("chatbot_metrics.csv");
  const gh = readCsv<GhRow>("gh_analysis.csv");
  const retention = readCsv<RetentionRow>("retention.csv");

  // Opt-in rate — test All rows, Apr+May
  const testCore = metrics.filter(
    (r) => r.Variant === "test" && r["Variant Split"] === "All" && CORE_MONTHS.includes(r.Month)
  );
  const totalConvos = testCore.reduce((s, r) => s + r["Total Convos"], 0);
  const optinPct = totalConvos > 0
    ? testCore.reduce((s, r) => s + r["Optin Rate %"] * r["Total Convos"], 0) / totalConvos * 100
    : 0;

  // Escalation + O2C from gh_analysis — comparable bucket, Apr+May
  const ctrlBucket = gh.filter(
    (r) => r.Variant === "control" && r["GH Bucket"] === "Clicked - Other Issues" && CORE_MONTHS.includes(r.Month)
  );
  const testBucket = gh.filter(
    (r) => r.Variant === "test" && r["GH Bucket"] === "Clicked - My Issue Is Not Listed" && CORE_MONTHS.includes(r.Month)
  );

  const avg = (rows: GhRow[], col: keyof GhRow) =>
    rows.length ? rows.reduce((s, r) => s + (r[col] as number), 0) / rows.length : 0;

  const ctrlEsc  = avg(ctrlBucket, "Suggested to Agent %") * 100;
  const testEsc  = avg(testBucket, "Suggested to Agent %") * 100;
  const ctrlO2c  = avg(ctrlBucket, "O2C") * 100;
  const testO2c  = avg(testBucket, "O2C") * 100;

  // Test group size
  const testSize = gh
    .filter((r) => r.Variant === "test" && r["GH Bucket"] === "All" && r["GH Outcome"] === "Total")
    .reduce((s, r) => s + (r["Shipment (Variant Level)"] ?? 0), 0);

  // Monthly trend
  const ctrlByMonth = Object.fromEntries(
    gh
      .filter((r) => r.Variant === "control" && r["GH Bucket"] === "Clicked - Other Issues" && ALL_MONTHS.includes(r.Month))
      .map((r) => [r.Month, r])
  );
  const testByMonth = Object.fromEntries(
    gh
      .filter((r) => r.Variant === "test" && r["GH Bucket"] === "Clicked - My Issue Is Not Listed" && ALL_MONTHS.includes(r.Month))
      .map((r) => [r.Month, r])
  );

  const trendData = ALL_MONTHS.map((m) => ({
    month: MONTH_LABEL[m],
    ctrlEsc:  ctrlByMonth[m] ? ctrlByMonth[m]["Suggested to Agent %"] * 100 : null,
    testEsc:  testByMonth[m] ? testByMonth[m]["Suggested to Agent %"] * 100 : null,
    ctrlO2c:  ctrlByMonth[m] ? ctrlByMonth[m]["O2C"] * 100 : null,
    testO2c:  testByMonth[m] ? testByMonth[m]["O2C"] * 100 : null,
  }));

  // Retention
  const retCtrl = retention.find((r) => r.Variant === "control" && r.Group === "All");
  const retTest = retention.find((r) => r.Variant === "test"    && r.Group === "All");

  const retentionData = ["7D", "14D", "28D"].map((w) => ({
    window: w,
    control: retCtrl ? parsePct(retCtrl[`Retention ${w} %` as keyof RetentionRow]) : 0,
    test:    retTest ? parsePct(retTest[`Retention ${w} %`  as keyof RetentionRow]) : 0,
  }));

  const returnData = ["7D", "14D", "28D"].map((w) => ({
    window: w,
    control: retCtrl ? parsePct(retCtrl[`Return Rate ${w} %` as keyof RetentionRow]) : 0,
    test:    retTest ? parsePct(retTest[`Return Rate ${w} %`  as keyof RetentionRow]) : 0,
  }));

  return {
    kpi: {
      optinPct: Math.round(optinPct),
      ctrlEsc:  Math.round(ctrlEsc),
      testEsc:  Math.round(testEsc),
      ctrlO2c:  Math.round(ctrlO2c),
      testO2c:  Math.round(testO2c),
      testSize: Math.round(testSize),
    },
    trendData,
    retentionData,
    returnData,
  };
}
