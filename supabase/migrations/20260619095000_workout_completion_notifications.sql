drop policy if exists "audit_workout_finish_insert" on public.app_audit_events;
drop policy if exists "audit_owner_admin_coach_select" on public.app_audit_events;

create policy "audit_workout_finish_insert"
on public.app_audit_events for insert
to authenticated
with check (
  event_type = 'workout_finished'
  and entity_type = 'workout_session'
  and owner_id = (select auth.uid())
);

create policy "audit_owner_admin_coach_select"
on public.app_audit_events for select
to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.user_permissions p
    where p.owner_id = app_audit_events.owner_id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      and p.role in ('admin', 'coach')
      and p.can_view_logs
      and p.disabled_at is null
      and p.revoked_at is null
  )
);
