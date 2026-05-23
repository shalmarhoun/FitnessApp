drop policy if exists "snapshots_owner_or_coach_write" on public.app_snapshots;
drop policy if exists "snapshots_owner_or_permitted_select" on public.app_snapshots;
drop policy if exists "snapshots_owner_write" on public.app_snapshots;

drop policy if exists "permissions_owner_manage" on public.user_permissions;

drop policy if exists "sessions_owner_or_coach_select" on public.workout_sessions;
drop policy if exists "sessions_owner_write" on public.workout_sessions;

drop policy if exists "exercises_owner_or_coach_select" on public.logged_exercises;
drop policy if exists "exercises_owner_write" on public.logged_exercises;

drop policy if exists "sets_owner_or_coach_select" on public.logged_sets;
drop policy if exists "sets_owner_write" on public.logged_sets;

create policy "permissions_owner_manage"
on public.user_permissions for all
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "permissions_self_select"
on public.user_permissions for select
to authenticated
using (
  user_id = (select auth.uid())
  or lower(email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
);

create policy "snapshots_owner_or_permitted_select"
on public.app_snapshots for select
to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1
    from public.user_permissions p
    where p.owner_id = app_snapshots.owner_id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      and p.can_view_logs
  )
);

create policy "snapshots_owner_or_coach_write"
on public.app_snapshots for all
to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1
    from public.user_permissions p
    where p.owner_id = app_snapshots.owner_id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      and p.can_edit_program
  )
)
with check (
  owner_id = (select auth.uid())
  or exists (
    select 1
    from public.user_permissions p
    where p.owner_id = app_snapshots.owner_id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      and p.can_edit_program
  )
);

create policy "sessions_owner_or_coach_select"
on public.workout_sessions for select
to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1
    from public.user_permissions p
    where p.owner_id = workout_sessions.owner_id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      and p.can_view_logs
  )
);

create policy "sessions_owner_write"
on public.workout_sessions for all
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "exercises_owner_or_coach_select"
on public.logged_exercises for select
to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1
    from public.user_permissions p
    where p.owner_id = logged_exercises.owner_id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      and p.can_view_logs
  )
);

create policy "exercises_owner_write"
on public.logged_exercises for all
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "sets_owner_or_coach_select"
on public.logged_sets for select
to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1
    from public.user_permissions p
    where p.owner_id = logged_sets.owner_id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      and p.can_view_logs
  )
);

create policy "sets_owner_write"
on public.logged_sets for all
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));
