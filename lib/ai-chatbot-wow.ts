import fs from "fs";
import path from "path";

export interface WowRow {
  week: string;
  weekShort: string;
  variant: "control" | "test";
  bucket: "rest" | "otherIssues" | "minl";
  totalConvos: number;
  aiOptin: number;
  ghShipments: number;
  shipmentsPlaced: number;
  ghTickets: number;
  totalTickets: number;
  escalations: number;
  csatConvos: number;
  positiveCsat: number;
  negativeCsat: number;
  optinRate: number | null;
  controlSanity: number | null;
  escalationRate: number | null;
  ghO2c: number | null;
  totalO2c: number | null;
  csatResponseRate: number | null;
  csatPositiveRate: number | null;
  csat: number | null;
}

interface RawJson {
  generatedAt: string;
  rows: WowRow[];
}

export function getAiChatbotWowData(): { generatedAt: string; rows: WowRow[] } {
  const filePath = path.join(process.cwd(), "data", "ai-chatbot-wow", "raw.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw) as RawJson;
  return { generatedAt: parsed.generatedAt, rows: parsed.rows };
}
