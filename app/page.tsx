import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Setter — Meta Graph API webhook automation showcase",
  description:
    "Public Instagram DM and comment automation demo. Webhook → AI reply → Graph API send. Built for DACH / DSGVO contexts.",
};

const REPO = "https://github.com/0xJaeg/ai-setter";

export default function Home() {
  return (
    <main className="min-h-svh bg-background font-mono text-foreground antialiased">
      <div className="border-b border-border/40 bg-background/60 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3 text-xs">
          <span className="tracking-tight">ai-setter</span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            v1 shipped · 7/7 verification
          </span>
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <h1 className="text-3xl font-medium tracking-tight sm:text-5xl">AI Setter</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Public showcase of Meta Graph API competence: webhook-driven Instagram DM
          and comment automation with an AI-generated reply loop. Built for DACH /
          DSGVO-aware deployment.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3 text-xs">
          <Link
            href={REPO}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 transition-colors hover:bg-muted"
          >
            github.com/0xJaeg/ai-setter →
          </Link>
          <Link
            href={`${REPO}#readme`}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 transition-colors hover:bg-muted"
          >
            architecture &amp; how to verify →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
          Architecture
        </h2>
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-4 text-[11px] leading-relaxed sm:text-xs">
{`inbound DM      ─►  HMAC verify  ─►  upsert conversation  ─►  generateReply()       ─►  sendDirectMessage()
public comment  ─►  HMAC verify  ─►  generateReply()      ─►  sendPrivateReplyToComment()
                                          ▲
                                  swappable LLM provider
                                  (one-line change in lib/llm/client.ts)`}
        </pre>
        <p className="mt-3 text-xs text-muted-foreground">
          Signature-verified webhook → opt-out check → DeepSeek reply → Graph API send →
          persist in Supabase (EU region, RLS). Stub mode (META_APP_SECRET=stub) bypasses
          real Meta calls for local dev.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
          Live log sample · Vercel production
        </h2>
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-4 text-[11px] leading-relaxed sm:text-xs">
{`2026-05-07 13:22:24.852  webhook.event   { type: 'message', entry: '17841...', mid: 'aWdf...', postback: false }
2026-05-07 13:22:30.653  webhook.replied { inbound_mid: 'aWdf...', outbound_mid: 'aWdf...', sender: '146...' }
2026-05-07 13:26:14.909  webhook.event   { type: 'message', entry: '17841...', mid: 'aWdf...', postback: false }
2026-05-07 13:26:16.758  webhook.optout  { mid: 'aWdf...', sender: '146...' }`}
        </pre>
        <p className="mt-3 text-xs text-muted-foreground">
          Inbound DM → AI reply in ~6 s. Opt-out keyword (STOP / STOPP / UNSUBSCRIBE /
          ABMELDEN / ABBESTELLEN) suppresses reply per hard rule #4. Logs contain only IDs
          and event types — never message bodies, handles, or names.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
          Verify the webhook yourself
        </h2>
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-4 text-[11px] leading-relaxed sm:text-xs">
{`# GET handshake — verify-token gate
$ curl -i "https://ai-setter-mauve.vercel.app/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=42"
HTTP/2 403
Forbidden

# POST without signature — HMAC gate
$ curl -i -X POST https://ai-setter-mauve.vercel.app/api/webhooks/instagram \\
    -H "content-type: application/json" \\
    -H "x-hub-signature-256: sha256=deadbeef" \\
    --data '{"object":"instagram","entry":[]}'
HTTP/2 401
Unauthorized`}
        </pre>
        <p className="mt-3 text-xs text-muted-foreground">
          Both gates correctly reject unauthorised requests without exposing secrets. The
          README has the full smoke-test sequence including a properly signed POST.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">A note on direct DM testing</p>
          <p>
            The connected Instagram account runs in Meta Dev Mode with Standard Access — only
            Tester accounts on the app can trigger inbound webhooks. Advanced Access (open
            to anyone) requires Meta App Review, which is multi-week and out of v1 scope. The
            curl gates above and the live log sample are the universal proofs of the
            pipeline; they don&apos;t require tester credentials.
          </p>
        </div>
      </section>

      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>christianjheggfer@gmail.com</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              terms
            </Link>
            <Link href="/data-deletion" className="hover:text-foreground">
              data deletion
            </Link>
            <Link href={REPO} className="hover:text-foreground">
              github
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
