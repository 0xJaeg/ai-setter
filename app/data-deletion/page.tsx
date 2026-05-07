import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Deletion — AI Setter",
  description: "How to request deletion of your data from AI Setter.",
};

export default function DataDeletionPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-sm leading-relaxed">
      <h1 className="mb-2 text-2xl font-semibold">Data Deletion Instructions</h1>
      <p className="mb-8 text-muted-foreground">Last updated: 2026-05-07</p>

      <section className="space-y-6">
        <p>
          AI Setter stores Instagram message records, sender IDs, and opt-out
          flags solely to operate the automated reply demo. You may request
          deletion of your data at any time.
        </p>

        <h2 className="text-lg font-semibold">Option 1 — Opt out (immediate)</h2>
        <p>
          Send any Direct Message to the connected Instagram account containing{" "}
          <code>STOP</code>, <code>STOPP</code>, <code>UNSUBSCRIBE</code>,{" "}
          <code>ABMELDEN</code>, or <code>ABBESTELLEN</code>. The conversation
          is flagged as opted-out immediately and no further automated replies
          will be sent.
        </p>

        <h2 className="text-lg font-semibold">Option 2 — Full deletion request</h2>
        <p>
          Email <strong>dev@kaizenisoconsulting.com</strong> with the subject
          line <em>Data deletion request</em> and include the Instagram
          username from which you contacted the connected account. We will
          delete all stored conversation, message, and lead records linked to
          that Instagram-scoped user ID within 30 days and confirm by reply.
        </p>

        <h2 className="text-lg font-semibold">What gets deleted</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Conversation and message records in the database</li>
          <li>Lead-score and metadata associated with the conversation</li>
          <li>Any cached webhook payloads in application logs</li>
        </ul>
        <p>
          Logs retained by sub-processors (DeepSeek, Vercel) are subject to
          their own retention policies and will age out independently.
        </p>

        <h2 className="text-lg font-semibold">Revoking app access</h2>
        <p>
          To revoke the App&apos;s authorisation on your Instagram account:
          Instagram → Settings and activity → Apps and websites → Active → AI
          Setter-IG → Remove.
        </p>
      </section>
    </main>
  );
}
