import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.SLACK_FEEDBACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const { name, type, message } = await req.json();
  if (!type || !message?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const submitter = name?.trim() || "Anonymous";
  const text = [
    `*📬 Dashboard Feedback — ${type}*`,
    `*From:* ${submitter}`,
    `*Message:*\n${message.trim()}`,
  ].join("\n");

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to send" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
