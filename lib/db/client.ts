import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type MessageDirection = "inbound" | "outbound";

export type ConversationRow = {
  id: number;
  ig_sender_id: string;
  ig_recipient_id: string;
  opted_out: boolean;
  created_at: string;
  updated_at: string;
};

export type MessageRow = {
  id: number;
  conversation_id: number;
  direction: MessageDirection;
  mid: string;
  text: string;
  created_at: string;
};

type ConversationInsert = {
  ig_sender_id: string;
  ig_recipient_id: string;
  opted_out?: boolean;
};

type ConversationUpdate = {
  opted_out?: boolean;
};

type MessageInsert = {
  conversation_id: number;
  direction: MessageDirection;
  mid: string;
  text: string;
};

type Database = {
  public: {
    Tables: {
      conversations: {
        Row: ConversationRow;
        Insert: ConversationInsert;
        Update: ConversationUpdate;
        Relationships: [];
      };
      messages: {
        Row: MessageRow;
        Insert: MessageInsert;
        Update: Partial<MessageInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

let cached: SupabaseClient<Database> | null = null;

export function getDbClient(): SupabaseClient<Database> {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase env not set");

  cached = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
