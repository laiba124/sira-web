-- Optional compatibility patch for the comments feature referenced by the supplied Android app.
-- Safe to run if sira_incident_comments does not already exist.

create table if not exists public.sira_incident_comments (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.sira_incidents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  comment_text text not null check (char_length(comment_text) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists idx_sira_incident_comments_incident_created
  on public.sira_incident_comments (incident_id, created_at);

alter table public.sira_incident_comments enable row level security;

drop policy if exists "sira_comments_select_authenticated" on public.sira_incident_comments;
drop policy if exists "sira_comments_insert_authenticated" on public.sira_incident_comments;
drop policy if exists "sira_comments_delete_owner" on public.sira_incident_comments;

create policy "sira_comments_select_authenticated"
on public.sira_incident_comments for select to authenticated
using (true);

create policy "sira_comments_insert_authenticated"
on public.sira_incident_comments for insert to authenticated
with check (user_id = auth.uid());

create policy "sira_comments_delete_owner"
on public.sira_incident_comments for delete to authenticated
using (user_id = auth.uid());

grant select, insert, delete on public.sira_incident_comments to authenticated;
revoke all on public.sira_incident_comments from anon;
