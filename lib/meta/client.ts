const HOST = "https://graph.instagram.com";
const API_VERSION = "v25.0";

export type SendResult = {
  message_id: string;
  recipient_id: string;
};

type Recipient = { id: string } | { comment_id: string };

type SendResponse = {
  recipient_id?: string;
  message_id?: string;
};

async function postMessage(recipient: Recipient, text: string): Promise<SendResult> {
  const appSecret = process.env.META_APP_SECRET;
  if (appSecret === "stub") {
    const stubMid = `stub_${Date.now()}`;
    console.info("meta.send.stub", { recipient, mid: stubMid });
    return { message_id: stubMid, recipient_id: "stub_recipient" };
  }

  const accessToken = process.env.META_PAGE_ACCESS_TOKEN;
  const igUserId = process.env.META_IG_USER_ID;
  if (!accessToken || !igUserId) {
    throw new Error("META_PAGE_ACCESS_TOKEN or META_IG_USER_ID not set");
  }

  const res = await fetch(`${HOST}/${API_VERSION}/${igUserId}/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ recipient, message: { text } }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`meta.send ${res.status}: ${body.slice(0, 500)}`);
  }

  const data = (await res.json()) as SendResponse;
  if (!data.message_id || !data.recipient_id) {
    throw new Error("meta.send: missing message_id or recipient_id");
  }
  return { message_id: data.message_id, recipient_id: data.recipient_id };
}

export function sendDirectMessage(recipientId: string, text: string): Promise<SendResult> {
  return postMessage({ id: recipientId }, text);
}

export function sendPrivateReplyToComment(commentId: string, text: string): Promise<SendResult> {
  return postMessage({ comment_id: commentId }, text);
}
