-- FITNESS SM product intelligence upgrade.
-- Adds admin role, granular account status, InBody archive, AI/reporting memory, and protected storage.

alter type public.app_role add value if not exists 'admin';

alter table public.profiles
add column if not exists disabled_at timestamptz,
add column if not exists disabled_by uuid references public.profiles(id) on delete set null,
add column if not exists last_role_change_at timestamptz;

alter table public.user_permissions
drop constraint if exists no_owner_invite_role;

alter table public.user_permissions
add column if not exists disabled_at timestamptz,
add column if not exists revoked_at timestamptz,
add column if not exists revoked_by uuid references public.profiles(id) on delete set null,
add column if not exists can_manage_users boolean not null default false,
add column if not exists can_upload_inbody boolean not null default false,
add column if not exists can_manage_ai boolean not null default false,
add constraint user_permissions_non_owner_role check (role in ('admin', 'coach', 'viewer'));

create table if not exists public.inbody_reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  report_date date not null default current_date,
  file_name text not null,
  file_type text not null check (file_type in ('image', 'pdf')),
  storage_path text not null,
  weight numeric,
  skeletal_muscle_mass numeric,
  body_fat_percentage numeric,
  body_fat_mass numeric,
  bmi numeric,
  metabolic_rate numeric,
  segment_analysis jsonb,
  notes text,
  raw_metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  report_type text not null check (report_type in ('progress', 'strength', 'recovery', 'consistency', 'inbody', 'program_review')),
  title text not null,
  summary text not null,
  recommendations jsonb not null default '[]'::jsonb,
  visibility text not null default 'owner_private' check (visibility in ('owner_private', 'shared_analytics')),
  source_ids jsonb not null default '[]'::jsonb,
  approved_program_change boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.app_audit_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.inbody_reports enable row level security;
alter table public.ai_reports enable row level security;
alter table public.app_audit_events enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'inbody-reports',
  'inbody-reports',
  false,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "permissions_owner_manage" on public.user_permissions;
drop policy if exists "permissions_self_select" on public.user_permissions;
drop policy if exists "permissions_admin_read" on public.user_permissions;
drop policy if exists "permissions_owner_admin_manage" on public.user_permissions;

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

drop policy if exists "snapshots_owner_or_coach_write" on public.app_snapshots;
drop policy if exists "snapshots_owner_or_permitted_select" on public.app_snapshots;

create policy "snapshots_role_select"
on public.app_snapshots for select
to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.user_permissions p
    where p.owner_id = app_snapshots.owner_id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      and p.can_view_logs
      and p.disabled_at is null
      and p.revoked_at is null
  )
);

create policy "snapshots_owner_admin_coach_write"
on public.app_snapshots for all
to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.user_permissions p
    where p.owner_id = app_snapshots.owner_id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      and p.can_edit_program
      and p.disabled_at is null
      and p.revoked_at is null
  )
)
with check (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.user_permissions p
    where p.owner_id = app_snapshots.owner_id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      and p.can_edit_program
      and p.disabled_at is null
      and p.revoked_at is null
  )
);

drop policy if exists "inbody_role_select" on public.inbody_reports;
drop policy if exists "inbody_owner_admin_coach_write" on public.inbody_reports;

create policy "inbody_role_select"
on public.inbody_reports for select
to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.user_permissions p
    where p.owner_id = inbody_reports.owner_id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      and p.can_view_measurements
      and p.disabled_at is null
      and p.revoked_at is null
  )
);

create policy "inbody_owner_admin_coach_write"
on public.inbody_reports for all
to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.user_permissions p
    where p.owner_id = inbody_reports.owner_id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      and p.can_upload_inbody
      and p.disabled_at is null
      and p.revoked_at is null
  )
)
with check (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.user_permissions p
    where p.owner_id = inbody_reports.owner_id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      and p.can_upload_inbody
      and p.disabled_at is null
      and p.revoked_at is null
  )
);

drop policy if exists "ai_owner_private_select" on public.ai_reports;
drop policy if exists "ai_owner_manage" on public.ai_reports;

create policy "ai_owner_private_select"
on public.ai_reports for select
to authenticated
using (
  owner_id = (select auth.uid())
  or (
    visibility = 'shared_analytics'
    and exists (
      select 1 from public.user_permissions p
      where p.owner_id = ai_reports.owner_id
        and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
        and p.can_view_logs
        and p.disabled_at is null
        and p.revoked_at is null
    )
  )
);

create policy "ai_owner_admin_manage"
on public.ai_reports for all
to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.user_permissions p
    where p.owner_id = ai_reports.owner_id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      and p.role = 'admin'
      and p.can_manage_ai
      and p.disabled_at is null
      and p.revoked_at is null
  )
)
with check (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.user_permissions p
    where p.owner_id = ai_reports.owner_id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      and p.role = 'admin'
      and p.can_manage_ai
      and p.disabled_at is null
      and p.revoked_at is null
  )
);

drop policy if exists "audit_owner_admin_select" on public.app_audit_events;
create policy "audit_owner_admin_select"
on public.app_audit_events for select
to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.user_permissions p
    where p.owner_id = app_audit_events.owner_id
      and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      and p.role = 'admin'
      and p.disabled_at is null
      and p.revoked_at is null
  )
);

drop policy if exists "storage_inbody_owner_read" on storage.objects;
drop policy if exists "storage_inbody_owner_write" on storage.objects;
drop policy if exists "storage_inbody_role_read" on storage.objects;
drop policy if exists "storage_inbody_role_write" on storage.objects;

create policy "storage_inbody_role_read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'inbody-reports'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (
      select 1 from public.user_permissions p
      where p.owner_id::text = (storage.foldername(name))[1]
        and (p.user_id = (select auth.uid()) or lower(p.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
        and p.can_view_measurements
        and p.disabled_at is null
        and p.revoked_at is null
    )
  )
);

create policy "storage_inbody_role_write"
on storage.objects for insert
to authenticated
with check (
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
