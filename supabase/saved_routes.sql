-- Run this once in the Supabase SQL Editor for the cheapflights project.
-- Creates the table behind the app's "Saved" tab, locked down so each
-- signed-in user can only ever see and modify their own rows.

create table if not exists public.saved_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  origin text not null,
  destination text not null,
  flight_date date not null,
  price numeric not null,
  currency text not null default 'USD',
  airline text,
  created_at timestamptz not null default now()
);

alter table public.saved_routes enable row level security;

create policy "select own saved routes"
  on public.saved_routes for select
  using (auth.uid() = user_id);

create policy "insert own saved routes"
  on public.saved_routes for insert
  with check (auth.uid() = user_id);

create policy "delete own saved routes"
  on public.saved_routes for delete
  using (auth.uid() = user_id);

create index if not exists saved_routes_user_created_idx
  on public.saved_routes (user_id, created_at desc);
