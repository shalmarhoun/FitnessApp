alter table public.inbody_reports
add column if not exists inbody_score numeric,
add column if not exists waist_hip_ratio numeric,
add column if not exists visceral_fat_level numeric;
