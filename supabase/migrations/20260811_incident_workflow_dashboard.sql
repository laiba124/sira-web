-- SIRA - Incident workflow stages + dashboard support
-- 2026-08-11
-- Safe to run more than once.

begin;

-- ---------------------------------------------------------------------------
-- 1) Remove the retired Franchise module backend object.
-- ---------------------------------------------------------------------------
drop table if exists public.sira_franchises cascade;

-- ---------------------------------------------------------------------------
-- 2) Add current workflow position to each Fiber Risk incident.
-- Existing incidents are initialized as Threat / Reported.
-- ---------------------------------------------------------------------------
alter table public.sira_incidents
  add column if not exists stage text,
  add column if not exists sub_stage text,
  add column if not exists action_plan text;

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
   or (
     stage = 'Threat'
     and sub_stage not in ('Reported', 'Assessment', 'Avoidance Validation')
   )
   or (
     stage = 'Action Plan'
     and sub_stage not in ('Formulation', 'Implementation')
   );

-- Threat-stage rows do not carry an Action Plan.
update public.sira_incidents
set action_plan = null
where stage = 'Threat';

-- If an older/custom value exists on an Action Plan row, reset it to NULL.
-- The app will require the user to choose one of the approved values before
-- saving Action Plan / Formulation or Implementation.
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
  drop constraint if exists sira_incidents_action_plan_allowed;

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
    );

create index if not exists idx_sira_incidents_stage_sub_stage
  on public.sira_incidents (stage, sub_stage, created_at desc);

-- ---------------------------------------------------------------------------
-- 3) Immutable workflow history.
-- Every Stage/Sub-stage/Action Plan change is written by a DB trigger so the
-- username and DB timestamp cannot be spoofed by the mobile client.
-- ---------------------------------------------------------------------------
create table if not exists public.sira_incident_stage_history (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.sira_incidents(id) on delete cascade,
  stage text not null,
  sub_stage text not null,
  action_plan text,
  changed_by_user_id uuid references auth.users(id) on delete set null,
  changed_by_username text not null,
  changed_at timestamptz not null default now(),
  constraint sira_stage_history_stage_allowed
    check (stage in ('Threat', 'Action Plan')),
  constraint sira_stage_history_stage_sub_stage_allowed
    check (
      (stage = 'Threat' and sub_stage in ('Reported', 'Assessment', 'Avoidance Validation'))
      or
      (stage = 'Action Plan' and sub_stage in ('Formulation', 'Implementation'))
    ),
  constraint sira_stage_history_action_plan_allowed
    check (
      action_plan is null
      or action_plan in (
        'Increase route patrolling frequency',
        'Deploy night patrolling teams',
        'Position static guards at vulnerable sites',
        'Execute temporary fiber cable re-routing',
        'Shift underground fiber cable to aerial'
      )
    )
);

create index if not exists idx_sira_stage_history_incident_changed
  on public.sira_incident_stage_history (incident_id, changed_at);

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

create or replace function public.log_sira_incident_stage_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid;
  v_actor_username text;
begin
  if tg_op = 'UPDATE'
     and new.stage is not distinct from old.stage
     and new.sub_stage is not distinct from old.sub_stage
     and new.action_plan is not distinct from old.action_plan then
    return new;
  end if;

  v_actor_id := auth.uid();

  if v_actor_id is not null
     and to_regclass('public.sira_user_profiles') is not null then
    execute $q$
      select coalesce(
        nullif(btrim(username), ''),
        nullif(btrim(full_name), '')
      )
      from public.sira_user_profiles
      where id = $1
      limit 1
    $q$
    into v_actor_username
    using v_actor_id;
  end if;

  v_actor_username := coalesce(
    nullif(btrim(v_actor_username), ''),
    nullif(btrim(new.reported_by_name), ''),
    'System'
  );

  insert into public.sira_incident_stage_history (
    incident_id,
    stage,
    sub_stage,
    action_plan,
    changed_by_user_id,
    changed_by_username,
    changed_at
  )
  values (
    new.id,
    new.stage,
    new.sub_stage,
    new.action_plan,
    v_actor_id,
    v_actor_username,
    case when tg_op = 'INSERT' then new.created_at else now() end
  );

  return new;
end;
$$;

revoke all on function public.log_sira_incident_stage_change() from public;

-- Rebuild trigger so rerunning this migration remains deterministic.
drop trigger if exists trg_sira_incident_stage_history
  on public.sira_incidents;

create trigger trg_sira_incident_stage_history
after insert or update of stage, sub_stage, action_plan
on public.sira_incidents
for each row
execute function public.log_sira_incident_stage_change();

-- Backfill one initial workflow event for pre-existing incidents only.
-- Prefer the stored application username when the profile table exists.
do $$
begin
  if to_regclass('public.sira_user_profiles') is not null then
    execute $q$
      insert into public.sira_incident_stage_history (
        incident_id,
        stage,
        sub_stage,
        action_plan,
        changed_by_user_id,
        changed_by_username,
        changed_at
      )
      select
        i.id,
        i.stage,
        i.sub_stage,
        i.action_plan,
        i.reporter_user_id,
        coalesce(
          nullif(btrim(p.username), ''),
          nullif(btrim(p.full_name), ''),
          nullif(btrim(i.reported_by_name), ''),
          'Existing incident'
        ),
        i.created_at
      from public.sira_incidents i
      left join public.sira_user_profiles p on p.id = i.reporter_user_id
      where not exists (
        select 1
        from public.sira_incident_stage_history h
        where h.incident_id = i.id
      )
    $q$;
  else
    insert into public.sira_incident_stage_history (
      incident_id,
      stage,
      sub_stage,
      action_plan,
      changed_by_user_id,
      changed_by_username,
      changed_at
    )
    select
      i.id,
      i.stage,
      i.sub_stage,
      i.action_plan,
      i.reporter_user_id,
      coalesce(nullif(btrim(i.reported_by_name), ''), 'Existing incident'),
      i.created_at
    from public.sira_incidents i
    where not exists (
      select 1
      from public.sira_incident_stage_history h
      where h.incident_id = i.id
    );
  end if;
end $$;

commit;
