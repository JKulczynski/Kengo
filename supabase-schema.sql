-- Kengo — schemat bazy danych
-- Wklej do: Supabase → SQL Editor → New query → Run

-- Tabela profili (uzupełnia dane z auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-tworzenie profilu przy rejestracji
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Projekty
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text,
  current_phase text,
  status text default 'planning' check (status in ('planning','in_progress','completed','on_hold')),
  description text,
  budget numeric,
  progress_percentage integer default 0,
  start_date date,
  target_completion date,
  created_by text,
  updated_date timestamptz default now(),
  created_at timestamptz default now()
);
alter table public.projects enable row level security;
create policy "Users manage own projects"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Dokumenty
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  vendor text,
  amount numeric,
  date date,
  file_url text,
  type text default 'other' check (type in ('invoice','receipt','photo','blueprint','contract','other')),
  warranty_end_date date,
  created_at timestamptz default now()
);
alter table public.documents enable row level security;
create policy "Users manage own documents"
  on public.documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Członkowie projektu
create table public.project_members (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_email text not null,
  role text default 'viewer' check (role in ('owner','editor','viewer')),
  invited_by text,
  created_at timestamptz default now()
);
alter table public.project_members enable row level security;
create policy "Users manage own project members"
  on public.project_members for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Notatki
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  content text,
  created_date timestamptz default now(),
  created_at timestamptz default now()
);
alter table public.notes enable row level security;
create policy "Users manage own notes"
  on public.notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage bucket na dokumenty
insert into storage.buckets (id, name, public) values ('documents', 'documents', true)
  on conflict do nothing;
create policy "Users upload own files"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Public read documents"
  on storage.objects for select
  using (bucket_id = 'documents');
create policy "Users delete own files"
  on storage.objects for delete
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
