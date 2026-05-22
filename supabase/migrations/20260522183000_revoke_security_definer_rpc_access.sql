-- Keep SECURITY DEFINER helpers internal to RLS/trigger usage.
-- They should not be callable through Supabase RPC by anon/authenticated clients.

revoke execute on function public.is_owner(uuid) from public, anon, authenticated;
revoke execute on function public.has_owner_permission(uuid, text) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

