import { NextRequest, NextResponse } from "next/server";
import { verifyMetaSignature } from "@/lib/meta/verify";
import type { InstagramWebhookEvent } from "@/lib/meta/types";

export const runtime = "nodejs";

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
