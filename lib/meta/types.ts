export type InstagramWebhookEvent = {
  object: "instagram";
  entry: InstagramEntry[];
};

export type InstagramEntry = {
  id: string;
  time: number;
  messaging?: InstagramMessaging[];
  changes?: InstagramChange[];
};

export type InstagramMessaging = {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    is_echo?: boolean;
  };
  postback?: { mid: string; title: string; payload: string };
};

export type InstagramChange = {
  field: string;
  value: Record<string, unknown>;
};
