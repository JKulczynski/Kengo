-- RLS Fix — brak rekurencji projektow i czlonkow
-- Wklej do: Supabase -> SQL Editor -> New query -> Run

-- 1. Funkcje pomocnicze z SECURITY DEFINER (omijaja RLS, brak petli)
create or replace function public.is_project_owner(project_uuid uuid, user_uuid uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.projects
    where id = project_uuid and user_id = user_uuid
  );
$$;

create or replace function public.is_project_member(project_uuid uuid, user_uuid uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.project_members
    where project_id = project_uuid and user_id = user_uuid
  );
$$;

-- 2. Stare polityki do usuniecia
drop policy if exists "Users manage own projects" on public.projects;
drop policy if exists "Users manage own documents" on public.documents;
drop policy if exists "Users manage own project members" on public.project_members;
drop policy if exists "Users manage own notes" on public.notes;

-- 3. Projekty: wlasciciel pelna kontrola, czlonek moze czytac
create policy "projects_owner_all"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "projects_member_select"
  on public.projects for select
  using (public.is_project_member(id, auth.uid()));

-- 4. Dokumenty: wlasciciel pelna kontrola, czlonek moze czytac
create policy "documents_owner_all"
  on public.documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "documents_member_select"
  on public.documents for select
  using (
    project_id is not null
    and public.is_project_member(project_id, auth.uid())
  );

-- 5. Czlonkowie: wlasciciel projektu widzi liste, czlonek widzi swoj rekord
create policy "project_members_owner_all"
  on public.project_members for all
  using (public.is_project_owner(project_id, auth.uid()))
  with check (public.is_project_owner(project_id, auth.uid()));

create policy "project_members_own_select"
  on public.project_members for select
  using (auth.uid() = user_id);

-- 6. Notatki: wlasciciel pelna kontrola, czlonek moze czytac
create policy "notes_owner_all"
  on public.notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notes_member_select"
  on public.notes for select
  using (
    project_id is not null
    and public.is_project_member(project_id, auth.uid())
  );
