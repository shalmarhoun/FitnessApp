# FITNESS SM

A premium feminine fitness tracking web application for personal use.

## Stack

- React
- Vite
- TypeScript
- TailwindCSS
- Framer Motion
- Recharts
- LocalStorage only

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

All application data is stored in LocalStorage under:

```txt
feminineFitnessTracker.v1
```

Use Settings -> Export JSON Backup before resetting local data or moving devices.
