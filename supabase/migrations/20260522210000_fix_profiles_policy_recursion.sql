drop policy if exists "profiles_select_own_or_permitted" on public.profiles;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));
