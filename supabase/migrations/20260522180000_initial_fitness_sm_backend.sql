-- FITNESS SM initial backend schema.
-- Apply this migration to the Supabase project before enabling cloud sync in production.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.app_role as enum ('owner', 'coach', 'viewer');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  role public.app_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_snapshots (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  app_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_permissions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  email text not null,
  role public.app_role not null default 'viewer',
  can_view_logs boolean not null default true,
  can_edit_program boolean not null default false,
  can_view_measurements boolean not null default false,
  can_add_notes boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint no_owner_invite_role check (role in ('coach', 'viewer'))
);

create unique index if not exists user_permissions_owner_email_idx
on public.user_permissions (owner_id, lower(email));

create table if not exists public.workout_sessions (
  id uuid primary key,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  program_day_id text not null,
  title text not null,
  scheduled_weekday text not null,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  duration_seconds integer not null default 0,
  total_volume numeric not null default 0,
  estimated_calories integer not null default 0,
  mood text,
  energy integer,
  notes text,
  raw_session jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.logged_exercises (
  id uuid primary key,
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  source_exercise_id text not null,
  name text not null,
  target_reps text,
  exercise_order integer not null default 0
);

create table if not exists public.logged_sets (
  id uuid primary key,
  exercise_id uuid not null references public.logged_exercises(id) on delete cascade,
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  set_number integer not null,
  reps numeric not null default 0,
  weight numeric not null default 0,
  unit text not null default 'kg',
  completed boolean not null default false,
  completed_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.app_snapshots enable row level security;
alter table public.user_permissions enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.logged_exercises enable row level security;
alter table public.logged_sets enable row level security;

create or replace function public.is_owner(target_owner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and id = target_owner_id
      and role = 'owner'
  );
$$;

create or replace function public.has_owner_permission(target_owner_id uuid, permission_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_owner(target_owner_id)
    or exists (
      select 1
      from public.user_permissions p
      join public.profiles me on me.id = (select auth.uid())
      where p.owner_id = target_owner_id
        and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce(me.email, '')))
        and (
          permission_name = 'view_logs' and p.can_view_logs
          or permission_name = 'edit_program' and p.can_edit_program
          or permission_name = 'view_measurements' and p.can_view_measurements
          or permission_name = 'add_notes' and p.can_add_notes
        )
    );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    lower(new.email),
    case when lower(new.email) = 'sh.almarhoun@gmail.com' then 'owner'::public.app_role else 'viewer'::public.app_role end
  )
  on conflict (id) do update
    set email = excluded.email,
        role = case when lower(excluded.email) = 'sh.almarhoun@gmail.com' then 'owner'::public.app_role else public.profiles.role end,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email on auth.users
for each row execute function public.handle_new_user();

drop policy if exists "profiles_select_own_or_permitted" on public.profiles;
create policy "profiles_select_own_or_permitted"
on public.profiles for select
to authenticated
using (
  id = (select auth.uid())
  or exists (
    select 1 from public.user_permissions p
    where p.owner_id = profiles.id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower((select email from public.profiles where id = (select auth.uid()))))
  )
);

drop policy if exists "profiles_upsert_self" on public.profiles;
create policy "profiles_upsert_self"
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "snapshots_owner_or_permitted_select" on public.app_snapshots;
create policy "snapshots_owner_or_permitted_select"
on public.app_snapshots for select
to authenticated
using (public.has_owner_permission(owner_id, 'view_logs'));

drop policy if exists "snapshots_owner_write" on public.app_snapshots;
create policy "snapshots_owner_write"
on public.app_snapshots for all
to authenticated
using (public.is_owner(owner_id))
with check (public.is_owner(owner_id));

drop policy if exists "permissions_owner_manage" on public.user_permissions;
create policy "permissions_owner_manage"
on public.user_permissions for all
to authenticated
using (public.is_owner(owner_id))
with check (public.is_owner(owner_id));

drop policy if exists "sessions_owner_or_coach_select" on public.workout_sessions;
create policy "sessions_owner_or_coach_select"
on public.workout_sessions for select
to authenticated
using (public.has_owner_permission(owner_id, 'view_logs'));

drop policy if exists "sessions_owner_write" on public.workout_sessions;
create policy "sessions_owner_write"
on public.workout_sessions for all
to authenticated
using (public.is_owner(owner_id))
with check (public.is_owner(owner_id));

drop policy if exists "exercises_owner_or_coach_select" on public.logged_exercises;
create policy "exercises_owner_or_coach_select"
on public.logged_exercises for select
to authenticated
using (public.has_owner_permission(owner_id, 'view_logs'));

drop policy if exists "exercises_owner_write" on public.logged_exercises;
create policy "exercises_owner_write"
on public.logged_exercises for all
to authenticated
using (public.is_owner(owner_id))
with check (public.is_owner(owner_id));

drop policy if exists "sets_owner_or_coach_select" on public.logged_sets;
create policy "sets_owner_or_coach_select"
on public.logged_sets for select
to authenticated
using (public.has_owner_permission(owner_id, 'view_logs'));

drop policy if exists "sets_owner_write" on public.logged_sets;
create policy "sets_owner_write"
on public.logged_sets for all
to authenticated
using (public.is_owner(owner_id))
with check (public.is_owner(owner_id));

