drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_own_or_permitted" on public.profiles;
drop policy if exists "profiles_upsert_self" on public.profiles;
drop policy if exists "profiles_update_self" on public.profiles;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy "profiles_insert_self"
on public.profiles for insert
to authenticated
with check (
  id = (select auth.uid())
  and lower(coalesce(email, '')) = lower(coalesce((auth.jwt() ->> 'email'), ''))
  and role = case
    when lower(coalesce((auth.jwt() ->> 'email'), '')) = 'sh.almarhoun@gmail.com' then 'owner'::public.app_role
    else 'viewer'::public.app_role
  end
);

create policy "profiles_update_self"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (
  id = (select auth.uid())
  and lower(coalesce(email, '')) = lower(coalesce((auth.jwt() ->> 'email'), ''))
  and role = case
    when lower(coalesce((auth.jwt() ->> 'email'), '')) = 'sh.almarhoun@gmail.com' then 'owner'::public.app_role
    else role
  end
);
