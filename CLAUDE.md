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

## Process discipline
Adapted from [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills). Binding for every task in this repo.

### 1. Think before coding
- Before touching `lib/meta/client.ts` or `lib/llm/client.ts`, state in chat: **interface shape**, **failure modes covered**, **what is NOT covered and why**. Reach alignment, then code.
- When uncertain about a Meta field, status code, rate limit, or Supabase/Next API shape: **stop and invoke `context7`**. Do not fabricate identifiers from training data.
- Surface confusion explicitly. "I'm not sure if `messaging_postbacks` requires X" beats silently guessing.

### 2. Simplicity first
*(extends the existing rule about not adding features beyond what the task requires)*
- One consumer = no abstraction. Wait for the second.
- No retry/backoff scaffolding until a failure mode is actually observed (hard rule #5 still applies once it is).
- One Supabase client export; no repository pattern unless v2 demands it.
- Reuse `lib/utils.ts` and existing shadcn primitives before authoring new ones.

### 3. Surgical changes
- Touch only what the task names. Don't reformat, rename, or "improve" adjacent code.
- If you spot dead code, **report it in chat**; do not delete it.
- No dependency bumps unless the task requires them.

### 4. Goal-driven execution
- Every non-trivial task starts by restating the success criterion as a single bullet — derived from the v1 `## Verification` checklist when applicable.
- End each task by mapping what was done back to which checklist item it advanced (or by adding a missing item).

## Mandatory skill invocations
Each row is a binding **MUST**. If a skill genuinely doesn't apply to an edge case, state why in chat and proceed — never silently skip. When a trigger isn't on the table, run `find-skills` before assuming none exists.

| When you are about to … | MUST invoke |
| --- | --- |
| Edit `app/api/webhooks/instagram/route.ts`, `lib/meta/*`, or any code that reads `META_APP_SECRET` | `context7` (before, for Meta API shape), `security-review` (after the change) |
| Edit `lib/db/schema.sql`, write/optimize SQL, or touch RLS policies | `supabase-postgres-best-practices` |
| Edit any file under `app/` (routes, layouts, pages, server components) | `next-best-practices` |
| Author or edit a React component (`.tsx` in `app/admin/`, `components/`) | `vercel-react-best-practices`, `coding-standards` |
| Add or modify shadcn UI | `shadcn` |
| UI/UX work or visual review on the v2 admin portal | `frontend-design`, `web-design-guidelines` |
| End-to-end test a UI flow locally | `webapp-testing` |
| Build/refactor anything that calls the Anthropic SDK directly | `claude-api` (triggers if the LLM client is swapped to Anthropic) |
| Any question about a third-party library/API/CLI (Meta, Supabase, Next, DeepSeek, Vercel) | `context7` first, before answering |
| Before declaring a task "done" or opening a PR | `simplify`, `code-review`, `security-review` (in that order) |
| Create a git commit | `git-commit` |

## Production-grade quality gates
Before declaring any code-touching task "done":

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] No `any` introduced
- [ ] No PII in logs (handles, message bodies, names) — IDs and event types only
- [ ] If the webhook was touched: stub-mode (`META_APP_SECRET=stub`) still runs end-to-end locally without Meta credentials
- [ ] Any new env key used is also added to `.env.example` with a one-line comment
- [ ] No new file created when an edit would have sufficed
- [ ] Every "MUST invoke" skill from the table above was actually invoked **and its output addressed** — not run-and-ignored
- [ ] Conventional commit message via `git-commit` skill

These gates are intentionally narrow. Test-coverage thresholds, accessibility audits on the webhook server, and CI pipeline mandates are out of scope for v1 — adding them would violate Simplicity First.
