-- Fix: odhaczanie zadan w Harmonogramie nigdy nie dzialalo, bo kod probowal
-- zapisywac status "zrobione" w kolumnie "title", ktora nie istnieje w tabeli notes.
-- Wklej do: Supabase -> SQL Editor -> New query -> Run

alter table public.notes
  add column if not exists done boolean not null default false;
