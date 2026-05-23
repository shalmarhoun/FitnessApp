drop policy if exists "storage_inbody_role_delete" on storage.objects;

create policy "storage_inbody_role_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'inbody-reports'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (
      select 1 from public.user_permissions p
      where p.owner_id::text = (storage.foldername(name))[1]
        and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
        and p.can_upload_inbody
        and p.disabled_at is null
        and p.revoked_at is null
    )
  )
);
