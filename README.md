# AI Setter

Public demo of an Instagram AI Setter: webhook-driven auto-reply for DMs, comment triggers, and story replies, with a Next.js admin portal.

**Live demo:** _link goes here once deployed_

## What this shows
- Meta Graph API webhook integration (verify-token challenge, HMAC-SHA256 signature verification, event routing)
- Inbound IG DM → AI-generated reply → outbound DM via Graph API
- Comment-on-post trigger that sends a private DM to the commenter
- Story-reply handling
- Admin portal to view conversations and override replies (v2)

## Stack
Next.js 16 App Router, Supabase (Postgres + RLS), DeepSeek for LLM replies (behind a swappable interface), Vercel, TypeScript.

## Swap the LLM provider
The LLM client lives behind `lib/llm/client.ts`. Replacing DeepSeek with Anthropic, OpenAI, or any provider is a one-file change. This is a deliberate design choice for DACH / GDPR-sensitive deployments where data residency matters.

## Local setup
1. `pnpm install`
2. Copy `.env.example` to `.env.local` and fill in Meta + DeepSeek + Supabase credentials
3. `pnpm dev`
4. Use ngrok or a Vercel preview URL to expose `/api/webhooks/instagram` to Meta

Set `META_APP_SECRET=stub` to run without real Meta credentials (test mode logs would-be Graph API calls instead of sending them).

## Status
v1 in progress. See [CLAUDE.md](./CLAUDE.md) for hard rules, architecture, and the v1 verification checklist.
