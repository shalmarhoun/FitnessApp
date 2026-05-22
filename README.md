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
- Supabase-ready cloud sync
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
- Optional Supabase authentication and cloud sync.
- Owner-only permissions foundation for coach/viewer access.
- Calendar day history for previous workout logs.
- No backend, database, authentication, or login.

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
```

Set these environment variables in Vercel:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

The owner email is:

```txt
sh.almarhoun@gmail.com
```

## Vercel Deployment

This project includes `vercel.json`. Vite uses `/` as the base path on Vercel and keeps `/FitnessApp/` for the older GitHub Pages build path when not running on Vercel.
