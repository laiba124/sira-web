-- SIRA - Clean Stage/Sub-stage CRUD implementation
-- 2026-08-11
-- Safe to run after the earlier SIRA Stage migrations. It is also designed
-- to repair/complete partially-applied Stage migrations.
--
-- Workflow:
--   Threat      -> Reported | Assessment | Avoidance Validation
--   Action Plan -> Formulation | Implementation
--
-- Formulation Action Plan values:
--   Increase route patrolling frequency
--   Deploy night patrolling teams
--   Position static guards at vulnerable sites
--   Execute temporary fiber cable re-routing
--   Shift underground fiber cable to aerial
--
-- Stage-level text fields:
--   threat_details
--   action_plan_details
--
-- Every INSERT and every workflow/text-field change is audited with the
-- authenticated username and PostgreSQL server timestamp.

begin;

-- ---------------------------------------------------------------------------
-- 1) Current workflow fields on incidents
-- ---------------------------------------------------------------------------
alter table public.sira_incidents
  add column if not exists stage text,
  add column if not exists sub_stage text,
  add column if not exists action_plan text,
  add column if not exists threat_details text,
  add column if not exists action_plan_details text;

update public.sira_incidents
set stage = 'Threat'
where stage is null
   or stage not in ('Threat', 'Action Plan');

update public.sira_incidents
set sub_stage = case
  when stage = 'Action Plan' then 'Formulation'
  else 'Reported'
end
where sub_stage is null
   or (stage = 'Threat' and sub_stage not in ('Reported', 'Assessment', 'Avoidance Validation'))
   or (stage = 'Action Plan' and sub_stage not in ('Formulation', 'Implementation'));

-- Threat incidents never carry the Formulation dropdown value.
update public.sira_incidents
set action_plan = null
where stage = 'Threat';

-- Remove invalid legacy dropdown values. Action Plan rows with NULL are kept
-- as legacy data; the validation trigger below requires a valid choice on the
-- next workflow change.
update public.sira_incidents
set action_plan = null
where action_plan is not null
  and action_plan not in (
    'Increase route patrolling frequency',
    'Deploy night patrolling teams',
    'Position static guards at vulnerable sites',
    'Execute temporary fiber cable re-routing',
    'Shift underground fiber cable to aerial'
  );

alter table public.sira_incidents
  alter column stage set default 'Threat',
  alter column stage set not null,
  alter column sub_stage set default 'Reported',
  alter column sub_stage set not null;

alter table public.sira_incidents
  drop constraint if exists sira_incidents_stage_allowed,
  drop constraint if exists sira_incidents_stage_sub_stage_allowed,
  drop constraint if exists sira_incidents_action_plan_allowed,
  drop constraint if exists sira_incidents_threat_details_length,
  drop constraint if exists sira_incidents_action_plan_details_length;

alter table public.sira_incidents
  add constraint sira_incidents_stage_allowed
    check (stage in ('Threat', 'Action Plan')),
  add constraint sira_incidents_stage_sub_stage_allowed
    check (
      (stage = 'Threat' and sub_stage in ('Reported', 'Assessment', 'Avoidance Validation'))
      or
      (stage = 'Action Plan' and sub_stage in ('Formulation', 'Implementation'))
    ),
  add constraint sira_incidents_action_plan_allowed
    check (
      action_plan is null
      or action_plan in (
        'Increase route patrolling frequency',
        'Deploy night patrolling teams',
        'Position static guards at vulnerable sites',
        'Execute temporary fiber cable re-routing',
        'Shift underground fiber cable to aerial'
      )
    ),
  add constraint sira_incidents_threat_details_length
    check (threat_details is null or char_length(threat_details) <= 2000),
  add constraint sira_incidents_action_plan_details_length
    check (action_plan_details is null or char_length(action_plan_details) <= 2000);

create index if not exists idx_sira_incidents_stage_sub_stage
  on public.sira_incidents (stage, sub_stage, created_at desc);

-- ---------------------------------------------------------------------------
-- 2) Backend workflow validation for CREATE and UPDATE
-- ---------------------------------------------------------------------------
create or replace function public.validate_sira_incident_workflow_write()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Do not block an unrelated edit on a legacy record whose workflow has not
  -- been touched. Validation applies to CREATE and workflow field changes.
  if tg_op = 'UPDATE'
     and new.stage is not distinct from old.stage
     and new.sub_stage is not distinct from old.sub_stage
     and new.action_plan is not distinct from old.action_plan then
    return new;
  end if;

  if new.stage not in ('Threat', 'Action Plan') then
    raise exception 'Invalid Stage: %', new.stage using errcode = '22023';
  end if;

  if new.stage = 'Threat' then
    if new.sub_stage not in ('Reported', 'Assessment', 'Avoidance Validation') then
      raise exception 'Invalid Sub-stage for Threat: %', new.sub_stage using errcode = '22023';
    end if;

    if new.action_plan is not null then
      raise exception 'Action Plan dropdown must be empty while Stage is Threat.' using errcode = '22023';
    end if;
  end if;

  if new.stage = 'Action Plan' then
    if new.sub_stage not in ('Formulation', 'Implementation') then
      raise exception 'Invalid Sub-stage for Action Plan: %', new.sub_stage using errcode = '22023';
    end if;

    if nullif(btrim(coalesce(new.action_plan, '')), '') is null then
      raise exception 'Select an Action Plan before saving %.', new.sub_stage using errcode = '22023';
    end if;

    if new.action_plan not in (
      'Increase route patrolling frequency',
      'Deploy night patrolling teams',
      'Position static guards at vulnerable sites',
      'Execute temporary fiber cable re-routing',
      'Shift underground fiber cable to aerial'
    ) then
      raise exception 'Invalid Action Plan value.' using errcode = '22023';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.validate_sira_incident_workflow_write() from public;

drop trigger if exists trg_validate_sira_incident_workflow
  on public.sira_incidents;

create trigger trg_validate_sira_incident_workflow
before insert or update of stage, sub_stage, action_plan
on public.sira_incidents
for each row
execute function public.validate_sira_incident_workflow_write();

-- ---------------------------------------------------------------------------
-- 3) Immutable Stage/Sub-stage history
-- ---------------------------------------------------------------------------
create table if not exists public.sira_incident_stage_history (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.sira_incidents(id) on delete cascade,
  stage text not null,
  sub_stage text not null,
  action_plan text,
  threat_details text,
  action_plan_details text,
  changed_by_user_id uuid references auth.users(id) on delete set null,
  changed_by_username text not null,
  changed_at timestamptz not null default now()
);

alter table public.sira_incident_stage_history
  add column if not exists threat_details text,
  add column if not exists action_plan_details text;

alter table public.sira_incident_stage_history
  drop constraint if exists sira_stage_history_stage_allowed,
  drop constraint if exists sira_stage_history_stage_sub_stage_allowed,
  drop constraint if exists sira_stage_history_action_plan_allowed,
  drop constraint if exists sira_stage_history_threat_details_length,
  drop constraint if exists sira_stage_history_action_plan_details_length;

alter table public.sira_incident_stage_history
  add constraint sira_stage_history_stage_allowed
    check (stage in ('Threat', 'Action Plan')),
  add constraint sira_stage_history_stage_sub_stage_allowed
    check (
      (stage = 'Threat' and sub_stage in ('Reported', 'Assessment', 'Avoidance Validation'))
      or
      (stage = 'Action Plan' and sub_stage in ('Formulation', 'Implementation'))
    ),
  add constraint sira_stage_history_action_plan_allowed
    check (
      action_plan is null
      or action_plan in (
        'Increase route patrolling frequency',
        'Deploy night patrolling teams',
        'Position static guards at vulnerable sites',
        'Execute temporary fiber cable re-routing',
        'Shift underground fiber cable to aerial'
      )
    ),
  add constraint sira_stage_history_threat_details_length
    check (threat_details is null or char_length(threat_details) <= 2000),
  add constraint sira_stage_history_action_plan_details_length
    check (action_plan_details is null or char_length(action_plan_details) <= 2000);

create index if not exists idx_sira_stage_history_incident_changed
  on public.sira_incident_stage_history (incident_id, changed_at desc);

alter table public.sira_incident_stage_history enable row level security;

drop policy if exists "sira_stage_history_select_authenticated"
  on public.sira_incident_stage_history;

create policy "sira_stage_history_select_authenticated"
on public.sira_incident_stage_history
for select
to authenticated
using (true);

revoke all on table public.sira_incident_stage_history from anon;
grant select on table public.sira_incident_stage_history to authenticated;

-- ---------------------------------------------------------------------------
-- 4) Audit trigger: authenticated username + database timestamp
-- ---------------------------------------------------------------------------
create or replace function public.log_sira_incident_stage_change()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor_id uuid;
  v_actor_username text;
begin
  if tg_op = 'UPDATE'
     and new.stage is not distinct from old.stage
     and new.sub_stage is not distinct from old.sub_stage
     and new.action_plan is not distinct from old.action_plan
     and new.threat_details is not distinct from old.threat_details
     and new.action_plan_details is not distinct from old.action_plan_details then
    return new;
  end if;

  v_actor_id := auth.uid();

  if v_actor_id is not null then
    select coalesce(
      nullif(btrim(p.username), ''),
      nullif(btrim(p.full_name), ''),
      nullif(split_part(u.email, '@', 1), '')
    )
    into v_actor_username
    from auth.users u
    left join public.sira_user_profiles p on p.id = u.id
    where u.id = v_actor_id
    limit 1;
  end if;

  v_actor_username := coalesce(
    nullif(btrim(v_actor_username), ''),
    case
      when v_actor_id is not null then 'User ' || left(v_actor_id::text, 8)
      else 'System'
    end
  );

  insert into public.sira_incident_stage_history (
    incident_id,
    stage,
    sub_stage,
    action_plan,
    threat_details,
    action_plan_details,
    changed_by_user_id,
    changed_by_username,
    changed_at
  )
  values (
    new.id,
    new.stage,
    new.sub_stage,
    new.action_plan,
    nullif(btrim(coalesce(new.threat_details, '')), ''),
    nullif(btrim(coalesce(new.action_plan_details, '')), ''),
    v_actor_id,
    v_actor_username,
    case when tg_op = 'INSERT' then coalesce(new.created_at, now()) else now() end
  );

  return new;
end;
$$;

revoke all on function public.log_sira_incident_stage_change() from public;

drop trigger if exists trg_sira_incident_stage_history
  on public.sira_incidents;

create trigger trg_sira_incident_stage_history
after insert or update of stage, sub_stage, action_plan, threat_details, action_plan_details
on public.sira_incidents
for each row
execute function public.log_sira_incident_stage_change();

-- ---------------------------------------------------------------------------
-- 5) Restricted workflow RPC used from Incident Details.
-- Any authenticated SIRA user can update ONLY workflow fields here; full
-- incident edit/delete policies remain unchanged.
-- ---------------------------------------------------------------------------
drop function if exists public.update_sira_incident_workflow(uuid, text, text, text);
drop function if exists public.update_sira_incident_workflow(uuid, text, text, text, text, text);

create function public.update_sira_incident_workflow(
  p_incident_id uuid,
  p_stage text,
  p_sub_stage text,
  p_action_plan text default null,
  p_threat_details text default null,
  p_action_plan_details text default null
)
returns public.sira_incidents
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor_id uuid;
  v_action_plan text;
  v_threat_details text;
  v_action_plan_details text;
  v_row public.sira_incidents%rowtype;
begin
  v_actor_id := auth.uid();

  if v_actor_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if p_stage not in ('Threat', 'Action Plan') then
    raise exception 'Invalid Stage: %', p_stage using errcode = '22023';
  end if;

  if p_stage = 'Threat'
     and p_sub_stage not in ('Reported', 'Assessment', 'Avoidance Validation') then
    raise exception 'Invalid Sub-stage for Threat: %', p_sub_stage using errcode = '22023';
  end if;

  if p_stage = 'Action Plan'
     and p_sub_stage not in ('Formulation', 'Implementation') then
    raise exception 'Invalid Sub-stage for Action Plan: %', p_sub_stage using errcode = '22023';
  end if;

  v_action_plan := nullif(btrim(coalesce(p_action_plan, '')), '');
  v_threat_details := nullif(btrim(coalesce(p_threat_details, '')), '');
  v_action_plan_details := nullif(btrim(coalesce(p_action_plan_details, '')), '');

  if char_length(coalesce(v_threat_details, '')) > 2000 then
    raise exception 'Threat Details cannot exceed 2000 characters.' using errcode = '22023';
  end if;

  if char_length(coalesce(v_action_plan_details, '')) > 2000 then
    raise exception 'Action Plan Details cannot exceed 2000 characters.' using errcode = '22023';
  end if;

  if p_stage = 'Threat' then
    v_action_plan := null;
  else
    if v_action_plan is null then
      raise exception 'Select an Action Plan before saving %.', p_sub_stage using errcode = '22023';
    end if;

    if v_action_plan not in (
      'Increase route patrolling frequency',
      'Deploy night patrolling teams',
      'Position static guards at vulnerable sites',
      'Execute temporary fiber cable re-routing',
      'Shift underground fiber cable to aerial'
    ) then
      raise exception 'Invalid Action Plan value.' using errcode = '22023';
    end if;
  end if;

  update public.sira_incidents
  set stage = p_stage,
      sub_stage = p_sub_stage,
      action_plan = v_action_plan,
      threat_details = v_threat_details,
      action_plan_details = v_action_plan_details
  where id = p_incident_id
    and incident_type = 'fiber_network_risk'
  returning * into v_row;

  if not found then
    raise exception 'Incident not found.' using errcode = 'P0002';
  end if;

  return v_row;
end;
$$;

revoke all on function public.update_sira_incident_workflow(uuid, text, text, text, text, text) from public;
revoke all on function public.update_sira_incident_workflow(uuid, text, text, text, text, text) from anon;
grant execute on function public.update_sira_incident_workflow(uuid, text, text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 6) Backfill one audit row for incidents that have no workflow history yet.
-- ---------------------------------------------------------------------------
insert into public.sira_incident_stage_history (
  incident_id,
  stage,
  sub_stage,
  action_plan,
  threat_details,
  action_plan_details,
  changed_by_user_id,
  changed_by_username,
  changed_at
)
select
  i.id,
  i.stage,
  i.sub_stage,
  i.action_plan,
  nullif(btrim(coalesce(i.threat_details, '')), ''),
  nullif(btrim(coalesce(i.action_plan_details, '')), ''),
  i.reporter_user_id,
  coalesce(
    nullif(btrim(p.username), ''),
    nullif(btrim(p.full_name), ''),
    nullif(split_part(u.email, '@', 1), ''),
    'Existing incident'
  ),
  i.created_at
from public.sira_incidents i
left join auth.users u on u.id = i.reporter_user_id
left join public.sira_user_profiles p on p.id = i.reporter_user_id
where not exists (
  select 1
  from public.sira_incident_stage_history h
  where h.incident_id = i.id
);

commit;

-- Verification queries:
-- select id, title, stage, sub_stage, action_plan, threat_details, action_plan_details
-- from public.sira_incidents
-- order by created_at desc
-- limit 20;
--
-- select incident_id, stage, sub_stage, action_plan,
--        changed_by_username, changed_at
-- from public.sira_incident_stage_history
-- order by changed_at desc
-- limit 50;
