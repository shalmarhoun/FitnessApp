create unique index if not exists user_permissions_owner_email_plain_idx
on public.user_permissions (owner_id, email);
