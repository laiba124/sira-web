-- SIRA authentication and administrator controls.
-- Safe to run repeatedly.

begin;

create table if not exists public.sira_admins (
  email text primary key,
  created_at timestamptz not null default now(),
  constraint sira_admins_email_lowercase
    check (email = lower(btrim(email)))
);

insert into public.sira_admins (email)
values
  ('soudkhan82@gmail.com'),
  ('admin@gmail.com')
on conflict (email) do nothing;

create table if not exists public.sira_app_settings (
  id smallint primary key default 1,
  signup_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users(id) on delete set null,
  constraint sira_app_settings_singleton check (id = 1)
);

insert into public.sira_app_settings (id, signup_enabled)
values (1, true)
on conflict (id) do nothing;

alter table public.sira_admins enable row level security;
alter table public.sira_app_settings enable row level security;

revoke all on table public.sira_admins from anon, authenticated;
revoke all on table public.sira_app_settings from anon, authenticated;
grant all on table public.sira_admins to service_role;
grant all on table public.sira_app_settings to service_role;

-- No direct client policies are intentionally created.
-- The Edge Function accesses these tables through the service role.

create index if not exists idx_sira_user_profiles_username_lower
  on public.sira_user_profiles (lower(username))
  where username is not null and btrim(username) <> '';

commit;
