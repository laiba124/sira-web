-- SIRA - Remove email login verification (2FA)
-- 2026-11-04
-- Safe to run repeatedly, and safe whether or not
-- APPLY_20261028_ENFORCE_LOGIN_2FA.sql was ever applied.
--
-- Run this BEFORE (or together with) deploying the apps without 2FA. If the
-- enforcement policies are left in place, signed-in users can no longer read
-- or change incidents, profiles, comments or photos.

begin;

-- 1) Enforcement policies and trigger
do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'sira_incidents',
    'sira_incident_stage_history',
    'sira_user_profiles',
    'sira_incident_comments'
  ]
  loop
    if to_regclass('public.' || v_table) is null then
      continue;
    end if;

    execute format(
      'drop policy if exists "sira_require_login_2fa" on public.%I',
      v_table
    );
  end loop;

  if to_regclass('public.sira_incidents') is not null then
    drop trigger if exists trg_sira_require_login_2fa on public.sira_incidents;
  end if;
end;
$$;

drop policy if exists "incident_photos_require_login_2fa" on storage.objects;

drop function if exists public.sira_require_login_2fa_write();

-- 2) Supporting objects
drop function if exists public.sira_login_2fa_verified();
drop table if exists public.sira_login_2fa_challenges;
drop table if exists public.sira_login_2fa_sessions;

commit;
