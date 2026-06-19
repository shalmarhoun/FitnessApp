drop policy if exists "audit_workout_finish_update" on public.app_audit_events;

create policy "audit_workout_finish_update"
on public.app_audit_events for update
to authenticated
using (
  event_type = 'workout_finished'
  and entity_type = 'workout_session'
  and owner_id = (select auth.uid())
)
with check (
  event_type = 'workout_finished'
  and entity_type = 'workout_session'
  and owner_id = (select auth.uid())
);
