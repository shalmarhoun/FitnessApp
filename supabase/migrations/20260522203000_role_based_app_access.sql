alter table public.profiles
add column if not exists assigned_owner_id uuid references public.profiles(id) on delete set null;

drop policy if exists "snapshots_owner_write" on public.app_snapshots;
create policy "snapshots_owner_or_coach_write"
on public.app_snapshots for all
to authenticated
using (
  public.is_owner(owner_id)
  or public.has_owner_permission(owner_id, 'edit_program')
)
with check (
  public.is_owner(owner_id)
  or public.has_owner_permission(owner_id, 'edit_program')
);

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
  or assigned_owner_id = profiles.id
);
