# AI Setter

Public showcase project demonstrating Meta Graph API competence: webhook-driven Instagram DM, comment, and story-reply automation with an AI-generated reply loop.

## Audience
This is a portfolio demo for hiring evaluation, not a production system. Code should be transparent, well-named, and skimmable in 5 minutes by a senior engineer. Bias toward clarity over cleverness.

## Stack
- Next.js 16 App Router (React 19, Turbopack dev)
- Supabase (Postgres + RLS) for conversation/message persistence
- DeepSeek (OpenAI-compatible) for LLM replies, behind a swappable interface
- Vercel for hosting
- TypeScript, pnpm, shadcn/ui + Tailwind v4 already scaffolded

## Hard rules
1. **Webhook signature verification is mandatory on every POST** to `/api/webhooks/instagram`. HMAC-SHA256 with `META_APP_SECRET`. Reject with 401 on mismatch. No exceptions.
2. **LLM provider lives behind `lib/llm/client.ts`.** Swapping DeepSeek for Anthropic, OpenAI, or any provider must be a one-file change. Reason: the team's market is DACH and DSGVO/GDPR matters; data residency is a real concern that this design preempts.
3. **GDPR-aware logging.** No PII (handles, message bodies, names) in logs. Log IDs and event types only.
4. **Opt-out handling.** Inbound message containing `STOP`, `STOPP`, `UNSUBSCRIBE`, or German equivalents flags the conversation as opted-out. No further AI replies on opted-out conversations.
5. **Respect Meta rate limits.** Exponential backoff on 429 / 4xx. Don't retry on 4xx errors that aren't rate-limited.
6. **Inbound only.** No scraping, no proactive outreach. The system reacts to webhook events.
7. **Test mode.** With `META_APP_SECRET=stub`, the app runs without making real Meta calls (logs the would-be request and returns a fake message ID). This makes the repo runnable without Meta credentials.

## Scope (deletable once v1 ships)

### v1 — target ship 2026-05-14
- `app/api/webhooks/instagram/route.ts` — GET (verify-token challenge) + POST (signed events)
- Inbound DM event → persist in Supabase → DeepSeek reply → send via Graph API
- Comment-on-post trigger → DM the commenter
- Story-reply handler

### v2 — stretch
- `app/admin/*` portal: list conversations, view threaded messages, manual reply override, lead-score badge per conversation
- Basic auth on `/admin` (env-based password is fine for the demo)

## File layout (target)
- `app/api/webhooks/instagram/route.ts` — webhook entry
- `lib/meta/client.ts` — Graph API send helpers (DM, comment-private-reply)
- `lib/meta/verify.ts` — HMAC signature verification
- `lib/meta/types.ts` — Meta event shape types
- `lib/llm/client.ts` — swappable LLM interface (`generateReply(messages, system) -> Promise<string>`)
- `lib/llm/deepseek.ts` — DeepSeek implementation
- `lib/db/client.ts` — Supabase client
- `lib/db/schema.sql` — `conversations`, `messages`, `leads` tables + RLS policies
- `app/admin/*` — v2 portal

## Env vars
See `.env.example`. Required to run:
- `META_APP_SECRET`, `META_PAGE_ACCESS_TOKEN`, `META_IG_USER_ID`, `META_WEBHOOK_VERIFY_TOKEN`
- `DEEPSEEK_API_KEY`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

Set `META_APP_SECRET=stub` to run in test mode without real Meta credentials.

## Verification (v1 done = all of these pass)
- [ ] Webhook GET returns Meta's `hub.challenge` when `hub.mode=subscribe` and verify-token matches
- [ ] "Send Test Event" from Meta App Dashboard accepted (200, signature verified)
- [ ] DM from a Tester account → AI reply lands in IG inbox within ~5s
- [ ] Comment on a Tester-visible post → tester receives a DM
- [ ] Vercel logs show zero signature verification failures
- [ ] Supabase shows persisted conversations + messages
- [ ] README has a public demo URL and a "swap LLM provider" section
