-- Simple baseline migration for app tables
create extension if not exists pgcrypto;

create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  year integer not null,
  mileage integer not null,
  notes text,
  photo_path text
);

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  title text,
  owner_key text,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  image_data_urls jsonb,
  created_at timestamptz not null default now()
);

create index if not exists chat_conversations_owner_key_idx
  on public.chat_conversations(owner_key);

create index if not exists idx_chat_messages_conversation_created_at
  on public.chat_messages(conversation_id, created_at);

alter table public.cars enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

-- Basic open policies for development (adjust for production)
drop policy if exists "cars_select" on public.cars;
drop policy if exists "cars_insert" on public.cars;
drop policy if exists "cars_update" on public.cars;
drop policy if exists "cars_delete" on public.cars;

create policy "cars_select" on public.cars
for select to anon, authenticated using (true);

create policy "cars_insert" on public.cars
for insert to anon, authenticated with check (true);

create policy "cars_update" on public.cars
for update to anon, authenticated using (true) with check (true);

create policy "cars_delete" on public.cars
for delete to anon, authenticated using (true);

-- Conversations/messages scoped by owner_key sent by app
drop policy if exists "chat_conversations_select" on public.chat_conversations;
drop policy if exists "chat_conversations_insert" on public.chat_conversations;
drop policy if exists "chat_conversations_update" on public.chat_conversations;
drop policy if exists "chat_conversations_delete" on public.chat_conversations;

create policy "chat_conversations_select" on public.chat_conversations
for select to anon, authenticated using (true);

create policy "chat_conversations_insert" on public.chat_conversations
for insert to anon, authenticated with check (true);

create policy "chat_conversations_update" on public.chat_conversations
for update to anon, authenticated using (true) with check (true);

create policy "chat_conversations_delete" on public.chat_conversations
for delete to anon, authenticated using (true);

drop policy if exists "chat_messages_select" on public.chat_messages;
drop policy if exists "chat_messages_insert" on public.chat_messages;
drop policy if exists "chat_messages_update" on public.chat_messages;
drop policy if exists "chat_messages_delete" on public.chat_messages;

create policy "chat_messages_select" on public.chat_messages
for select to anon, authenticated using (true);

create policy "chat_messages_insert" on public.chat_messages
for insert to anon, authenticated with check (true);

create policy "chat_messages_update" on public.chat_messages
for update to anon, authenticated using (true) with check (true);

create policy "chat_messages_delete" on public.chat_messages
for delete to anon, authenticated using (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.cars to anon, authenticated;
grant select, insert, update, delete on public.chat_conversations to anon, authenticated;
grant select, insert, update, delete on public.chat_messages to anon, authenticated;
