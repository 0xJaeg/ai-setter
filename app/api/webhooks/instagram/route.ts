import { NextRequest, NextResponse } from "next/server";
import { verifyMetaSignature } from "@/lib/meta/verify";
import { sendDirectMessage } from "@/lib/meta/client";
import { generateReply } from "@/lib/llm/client";
import type { InstagramMessaging, InstagramWebhookEvent } from "@/lib/meta/types";

export const runtime = "nodejs";

const SYSTEM_PROMPT =
  "You are a friendly Instagram DM assistant for a small business. Keep replies under two sentences. Match the language of the incoming message.";

const OPT_OUT_REGEX = /\b(STOP|STOPP|UNSUBSCRIBE|ABMELDEN|ABBESTELLEN)\b/i;

function isOptOut(text: string): boolean {
  return OPT_OUT_REGEX.test(text);
}

async function handleInboundMessage(m: InstagramMessaging): Promise<void> {
  const message = m.message;
  if (!message || message.is_echo || !message.text) return;

  if (isOptOut(message.text)) {
    console.info("webhook.optout", { mid: message.mid, sender: m.sender.id });
    return;
  }

  const reply = await generateReply(
    [{ role: "user", content: message.text }],
    SYSTEM_PROMPT,
  );
  const sent = await sendDirectMessage(m.sender.id, reply);
  console.info("webhook.replied", {
    inbound_mid: message.mid,
    outbound_mid: sent.message_id,
    sender: m.sender.id,
  });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  const expected = process.env.META_WEBHOOK_VERIFY_TOKEN;
  if (mode !== "subscribe" || !expected || token !== expected) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  return new NextResponse(challenge ?? "", { status: 200 });
}

export async function POST(request: NextRequest) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    console.error("webhook.config.missing_app_secret");
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyMetaSignature(rawBody, signature, appSecret)) {
    console.warn("webhook.signature.invalid");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let payload: InstagramWebhookEvent;
  try {
    payload = JSON.parse(rawBody) as InstagramWebhookEvent;
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }

  for (const entry of payload.entry ?? []) {
    for (const m of entry.messaging ?? []) {
      console.info("webhook.event", {
        type: "message",
        entry: entry.id,
        mid: m.message?.mid ?? null,
        postback: m.postback ? true : false,
      });
      try {
        await handleInboundMessage(m);
      } catch (err) {
        console.error("webhook.handle.failed", {
          entry: entry.id,
          mid: m.message?.mid ?? null,
          code: err instanceof Error ? err.message.slice(0, 100) : "unknown",
        });
      }
    }
    for (const c of entry.changes ?? []) {
      console.info("webhook.event", {
        type: "change",
        entry: entry.id,
        field: c.field,
      });
    }
  }

  return new NextResponse("OK", { status: 200 });
}
