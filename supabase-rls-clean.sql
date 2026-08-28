-- Kengo — czysty reset RLS (usuwa wszystkie stare policies i tworzy proste)

-- 1. Usun wszystkie stare policies
DROP POLICY IF EXISTS "Users manage own projects" ON public.projects;
DROP POLICY IF EXISTS "projects_owner_all" ON public.projects;
DROP POLICY IF EXISTS "projects_member_select" ON public.projects;
DROP POLICY IF EXISTS "Owner full access to projects" ON public.projects;
DROP POLICY IF EXISTS "Member can select project" ON public.projects;
DROP POLICY IF EXISTS "Editor can update project" ON public.projects;

DROP POLICY IF EXISTS "Users manage own documents" ON public.documents;
DROP POLICY IF EXISTS "documents_owner_all" ON public.documents;
DROP POLICY IF EXISTS "documents_member_select" ON public.documents;
DROP POLICY IF EXISTS "Author full access to documents" ON public.documents;
DROP POLICY IF EXISTS "Project owner can select documents" ON public.documents;
DROP POLICY IF EXISTS "Member can select project documents" ON public.documents;
DROP POLICY IF EXISTS "Editor can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Editor can update project documents" ON public.documents;
DROP POLICY IF EXISTS "Editor can delete project documents" ON public.documents;

DROP POLICY IF EXISTS "Users manage own notes" ON public.notes;
DROP POLICY IF EXISTS "notes_owner_all" ON public.notes;
DROP POLICY IF EXISTS "notes_member_select" ON public.notes;
DROP POLICY IF EXISTS "Author full access to notes" ON public.notes;
DROP POLICY IF EXISTS "Project owner can select notes" ON public.notes;
DROP POLICY IF EXISTS "Member can select project notes" ON public.notes;
DROP POLICY IF EXISTS "Editor can insert project notes" ON public.notes;
DROP POLICY IF EXISTS "Editor can update project notes" ON public.notes;
DROP POLICY IF EXISTS "Editor can delete project notes" ON public.notes;

DROP POLICY IF EXISTS "Users manage own project members" ON public.project_members;
DROP POLICY IF EXISTS "project_members_owner_all" ON public.project_members;
DROP POLICY IF EXISTS "project_members_own_select" ON public.project_members;
DROP POLICY IF EXISTS "Creator full access to project members" ON public.project_members;
DROP POLICY IF EXISTS "Project owner can select members" ON public.project_members;
DROP POLICY IF EXISTS "Invited user can see own membership" ON public.project_members;

-- 2. Usun funkcje pomocnicze ktore powoduja petle
DROP FUNCTION IF EXISTS public.is_project_owner(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_project_member(uuid, uuid);

-- 3. Proste policies — kazdy widzi tylko swoje dane (bez cross-table lookups)
CREATE POLICY "projects_own" ON public.projects
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_own" ON public.documents
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_own" ON public.notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "project_members_own" ON public.project_members
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
