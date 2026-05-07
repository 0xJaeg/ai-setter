import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — AI Setter",
  description: "Privacy policy for the AI Setter Instagram messaging demo.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-sm leading-relaxed">
      <h1 className="mb-2 text-2xl font-semibold">Privacy Policy</h1>
      <p className="mb-8 text-muted-foreground">Last updated: 2026-05-07</p>

      <section className="space-y-6">
        <p>
          AI Setter (the &quot;App&quot;) is a portfolio demonstration of the Meta
          Graph API for Instagram. This policy describes what data the App
          processes when an Instagram Business or Creator account authorises it
          and when other users send Instagram Direct Messages, comments, or
          story replies to that account.
        </p>

        <h2 className="text-lg font-semibold">Data we process</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Instagram-scoped user IDs of senders and the connected account</li>
          <li>Message text, comment text, story-reply text, and timestamps</li>
          <li>Webhook event metadata (event type, message IDs)</li>
          <li>Opt-out flags derived from keywords (e.g. STOP, ABMELDEN)</li>
        </ul>
        <p>
          We do not process names, profile pictures, follower lists, or any
          data outside the active conversation thread.
        </p>

        <h2 className="text-lg font-semibold">Why we process it</h2>
        <p>
          Solely to generate and send an automated reply via the Instagram
          Graph API. No advertising, profiling, or resale.
        </p>

        <h2 className="text-lg font-semibold">Sub-processors</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>DeepSeek (LLM provider, processes message text to generate the reply)</li>
          <li>Supabase (database, stores conversation and message records in the EU)</li>
          <li>Vercel (hosting, processes webhook traffic)</li>
        </ul>

        <h2 className="text-lg font-semibold">Storage and residency</h2>
        <p>
          Conversation and message records are stored in a Supabase project in
          the European Union. Logs contain only IDs and event types, never
          message bodies or user handles.
        </p>

        <h2 className="text-lg font-semibold">Your rights (DSGVO / GDPR)</h2>
        <p>
          You may request access, rectification, erasure, restriction, or
          portability of your personal data, and withdraw consent at any time.
          Send any inbound message containing <code>STOP</code>,{" "}
          <code>STOPP</code>, <code>UNSUBSCRIBE</code>, <code>ABMELDEN</code>,
          or <code>ABBESTELLEN</code> to opt out of further automated replies.
          For other requests, see the data deletion page.
        </p>

        <h2 className="text-lg font-semibold">Retention</h2>
        <p>
          Records are retained for up to 30 days for demonstration and debugging
          purposes, then deleted. Opt-out flags are retained indefinitely to
          honour withdrawal of consent.
        </p>

        <h2 className="text-lg font-semibold">Contact</h2>
        <p>
          dev@kaizenisoconsulting.com
        </p>
      </section>
    </main>
  );
}
