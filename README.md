# FITNESS SM

A premium feminine fitness tracking web application for personal use.

## Stack

- React
- Vite
- TypeScript
- TailwindCSS
- Framer Motion
- Recharts
- LocalStorage fallback
- Supabase authentication and cloud sync
- Vercel serverless owner account management
- Vercel-ready deployment

## Features

- Minimal dashboard with today's workout and weekly goal progress.
- Sunday-based training week.
- Default Sunday, Tuesday, Thursday workout program.
- Editable workout days, titles, exercises, sets, reps, and weights.
- Fast active workout logging with live timer, rest timer, reps, weights, and completed sets.
- Previous workout comparison.
- Rewarding post-workout summary with volume, duration, estimated calories, insights, mood, energy, notes, and achievements.
- Strength, volume, duration, consistency, body weight, and measurement charts.
- Saturday-focused measurements.
- Premium achievement system.
- JSON export backup.
- JSON import restore.
- Supabase email/password authentication with invitation-only access.
- Owner-only permissions for coach/viewer accounts.
- Calendar day history for previous workout logs.
- Vercel serverless API for secure owner-created accounts.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Data Storage

The app still works locally through LocalStorage under:

```txt
feminineFitnessTracker.v1
```

When Supabase environment variables are configured, app snapshots and completed workout rows sync to Supabase.

Use Settings -> Export JSON Backup before resetting local data or moving devices.

## Supabase Setup

Create a Supabase project, then apply:

```txt
supabase/migrations/20260522180000_initial_fitness_sm_backend.sql
supabase/migrations/20260522183000_revoke_security_definer_rpc_access.sql
supabase/migrations/20260522200000_password_invite_accounts.sql
supabase/migrations/20260522203000_role_based_app_access.sql
supabase/migrations/20260522210000_fix_profiles_policy_recursion.sql
supabase/migrations/20260523093000_fix_profiles_write_policy_recursion.sql
```

Set these environment variables in Vercel:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Add it in Vercel Environment Variables and never expose it in frontend code.

The owner email is:

```txt
sh.almarhoun@gmail.com
```

## Vercel Deployment

This project includes `vercel.json`. Vite uses `/` as the base path on Vercel and keeps `/FitnessApp/` for the older GitHub Pages build path when not running on Vercel.

Deployment trigger: Vercel should build every new push to `main`.

Auth gate cache marker: 2026-05-23.

Profile sync mode: read-only client profile lookup.
