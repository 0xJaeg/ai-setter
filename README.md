# AI Setter

Public showcase of Meta Graph API competence: webhook-driven Instagram DM and comment automation with an AI-generated reply loop, built for DACH-market / DSGVO-aware deployment.

**Live demo:** https://ai-setter-mauve.vercel.app

This is a portfolio demo for hiring evaluation, not a production service. Code is intentionally transparent and skimmable in five minutes. See [CLAUDE.md](./CLAUDE.md) for the binding rules and process discipline this repo holds itself to.

## What works

- Webhook signature verification (HMAC-SHA256) on every inbound POST; 401 on mismatch
- Inbound DM → opt-out check → DeepSeek reply → outbound DM via Graph API, persisted in Supabase
- Public comment on a connected post → AI-generated private-reply DM to the commenter
- Opt-out keywords (`STOP`, `STOPP`, `UNSUBSCRIBE`, `ABMELDEN`, `ABBESTELLEN`) flag the conversation; no further AI replies
- Stub mode (`META_APP_SECRET=stub`): full pipeline runs locally without real Meta credentials — Graph API calls are logged with a fake message ID instead of being sent
- Idempotent message storage (`messages.mid UNIQUE`) for Meta webhook retries
- GDPR-aware logging: only IDs and event types reach the log surface; never message text, handles, or names
- Public legal pages (`/privacy`, `/terms`, `/data-deletion`) required to publish the Meta app and to honour DSGVO data-subject requests

Stretch (v2, deliberately unbuilt): `/admin` portal for conversation review, lead-score badge, manual reply override.

## Architecture

```
Instagram → Meta → POST /api/webhooks/instagram (Vercel)
                       │
                       ├── verify HMAC signature (lib/meta/verify.ts)
                       ├── parse event, route by shape
                       │     ├── messaging[*] → handleInboundMessage
                       │     │     ├── upsert conversation (Supabase)
                       │     │     ├── persist inbound message
                       │     │     ├── opt-out keyword? → set flag, stop
                       │     │     ├── generateReply() (lib/llm/client.ts)
                       │     │     ├── sendDirectMessage() (lib/meta/client.ts)
                       │     │     └── persist outbound message
                       │     └── changes[*] field=='comments' → handleCommentChange
                       │           └── generateReply() → sendPrivateReplyToComment()
                       └── 200 OK
```

Files worth reading first:
- [`app/api/webhooks/instagram/route.ts`](./app/api/webhooks/instagram/route.ts) — the entry, signature gate, and event routing
- [`lib/meta/verify.ts`](./lib/meta/verify.ts) — timing-safe HMAC verifier; honours stub mode
- [`lib/meta/client.ts`](./lib/meta/client.ts) — Graph API send helpers (DM + comment private-reply)
- [`lib/llm/client.ts`](./lib/llm/client.ts) — provider-agnostic interface
- [`lib/db/schema.sql`](./lib/db/schema.sql) — three tables, RLS enabled, idempotent migration

## Swap the LLM provider

Hard-rule design constraint: replacing DeepSeek with another provider is a **one-line change** in `lib/llm/client.ts`. Reason: the DACH market cares about data residency; the architecture preempts it.

Concretely, to swap to Anthropic:

```diff
  // lib/llm/client.ts
- import { generateReplyDeepseek } from "./deepseek";
+ import { generateReplyAnthropic } from "./anthropic";

  export function generateReply(messages: Message[], system: string): Promise<string> {
-   return generateReplyDeepseek(messages, system);
+   return generateReplyAnthropic(messages, system);
  }
```

Provider-specific code (auth, request shape, retry policy, model name) stays in `lib/llm/<provider>.ts`. The route handler never imports a provider directly.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict
- Supabase (Postgres + RLS) for persistence; EU region for DSGVO residency
- DeepSeek (`deepseek-v4-flash`) for LLM replies, behind the swappable interface above
- Vercel for hosting; webhook callback is a single route handler
- pnpm, Tailwind v4, shadcn/ui (scaffolded for v2 admin)

## Local setup

```bash
pnpm install
cp .env.example .env.local
# fill in Meta + DeepSeek + Supabase credentials, or set META_APP_SECRET=stub
pnpm dev
```

Smoke test the webhook against your dev server:

```bash
# GET handshake
VTOK=$(grep '^META_WEBHOOK_VERIFY_TOKEN=' .env.local | cut -d= -f2)
curl -i "http://localhost:3000/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=${VTOK}&hub.challenge=42"
# expect: 200 with body "42"

# Signed POST (requires real META_APP_SECRET)
SECRET=$(grep '^META_APP_SECRET=' .env.local | cut -d= -f2)
BODY='{"object":"instagram","entry":[{"id":"X","time":1,"messaging":[{"sender":{"id":"S"},"recipient":{"id":"R"},"timestamp":1,"message":{"mid":"m_1","text":"hi"}}]}]}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$SECRET" -hex | awk '{print "sha256="$NF}')
curl -i -X POST http://localhost:3000/api/webhooks/instagram \
  -H "content-type: application/json" -H "x-hub-signature-256: $SIG" --data "$BODY"
# expect: 200 OK
```

Apply the schema in Supabase: paste [`lib/db/schema.sql`](./lib/db/schema.sql) into the SQL Editor → Run.

To expose the local webhook to Meta during dev, use a Vercel preview URL or an ngrok tunnel.

## Verification (v1)

All seven boxes from [CLAUDE.md](./CLAUDE.md) `## Verification` pass:

- Webhook GET returns Meta's `hub.challenge` when verify-token matches
- "Send Test Event" from the Meta App Dashboard accepted with valid signature
- Real DM from a Tester account → AI reply lands in the IG inbox in ~5 s
- Public comment on a Tester-visible post → tester receives an AI-generated DM
- Vercel logs show zero (real) signature verification failures
- Supabase shows persisted conversations and messages
- This README

## DACH / GDPR posture

- Sub-processors disclosed: DeepSeek (LLM), Supabase (DB, EU residency), Vercel (hosting). Privacy policy at [`/privacy`](https://ai-setter-mauve.vercel.app/privacy).
- RLS enabled on every table. Server uses the Supabase secret key (bypasses RLS by design); the publishable key has zero policies and therefore zero access — fail-closed.
- Logging: explicitly excludes message bodies, handles, names. Only IDs and event types are logged. Audited automatically before each commit (the audit chain is described in CLAUDE.md).
- Opt-out keywords match German equivalents (`ABMELDEN`, `ABBESTELLEN`) alongside English.
- Data deletion request flow: `/data-deletion` page describes immediate (STOP) and full (email) deletion paths with a 30-day commitment.

## Known limitation

Instagram messaging webhooks for inbound DMs only deliver after the Meta app is **Published** (Live mode in App Settings → Basic). This is separate from the App Review process — publishing only requires Privacy Policy / Terms / Data Deletion URLs and an app category. Without publishing, only dashboard-injected test events reach the webhook; real DMs are silently dropped by Meta. The official Meta doc says it once and quietly: *"Apps must be set to Live in the App Dashboard to receive webhook notifications."*

## Process discipline

[CLAUDE.md](./CLAUDE.md) is treated as a binding contract for this repo. Every code-touching task runs an audit chain (`simplify`, `security-review`) before it's declared done; every commit is conventional. The four principles that govern the work — Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution — are spelled out there.

## Contact

christianjheggfer@gmail.com
