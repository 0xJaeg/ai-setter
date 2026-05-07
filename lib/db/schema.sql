-- AI Setter — v1 schema
-- Apply once via Supabase SQL Editor. Idempotent: safe to re-run.

create table if not exists public.conversations (
  id              bigint generated always as identity primary key,
  ig_sender_id    text not null,
  ig_recipient_id text not null,
  opted_out       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (ig_sender_id, ig_recipient_id)
);

do $$ begin
  create type public.message_direction as enum ('inbound', 'outbound');
exception when duplicate_object then null;
end $$;

create table if not exists public.messages (
  id              bigint generated always as identity primary key,
  conversation_id bigint not null references public.conversations(id) on delete cascade,
  direction       public.message_direction not null,
  mid             text not null unique,
  text            text not null,
  created_at      timestamptz not null default now()
);
create index if not exists messages_conversation_id_idx on public.messages (conversation_id);

create table if not exists public.leads (
  conversation_id bigint primary key references public.conversations(id) on delete cascade,
  score           integer not null default 0,
  notes           text,
  updated_at      timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

alter table public.conversations enable row level security;
alter table public.messages       enable row level security;
alter table public.leads          enable row level security;
