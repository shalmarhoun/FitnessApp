drop policy if exists "ai_inbody_uploader_insert" on public.ai_reports;

create policy "ai_inbody_uploader_insert"
on public.ai_reports for insert
to authenticated
with check (
  report_type = 'inbody'
  and visibility = 'shared_analytics'
  and (
    owner_id = (select auth.uid())
    or exists (
      select 1 from public.user_permissions p
      where p.owner_id = ai_reports.owner_id
        and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
        and p.can_upload_inbody
        and p.disabled_at is null
        and p.revoked_at is null
    )
  )
);
