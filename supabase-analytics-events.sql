-- Custom eventy produktowe (poza pageviews z GA4/Vercel Analytics)
-- Uruchom w Supabase SQL Editor.

create table public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  event_name text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.analytics_events enable row level security;

create policy "Users insert own events"
  on public.analytics_events for insert
  with check (auth.uid() = user_id);

create policy "Users read own events"
  on public.analytics_events for select
  using (auth.uid() = user_id);

-- Przydatne zapytanie do wyciagania liczb na pitch:
-- select event_name, count(*) from public.analytics_events group by event_name order by count(*) desc;
