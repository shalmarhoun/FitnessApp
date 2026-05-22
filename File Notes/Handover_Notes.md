# Handover Notes

One-file project briefing for any future AI agent working on FITNESS SM.

## Project
FITNESS SM is a premium feminine fitness tracking Progressive Web App for personal use.

It is designed as a mobile-first performance system for:
- Workout tracking.
- Progressive overload.
- Strength progression.
- Weekly consistency.
- Body measurements.
- Premium motivation and achievements.

The app language is English only. The owner may discuss work in Arabic/Kuwaiti Arabic, but visible app UI must remain English.

## Current Location
Project root:
`C:\Users\shosh\OneDrive\Desktop\Codex\00 Output\feminine-fitness-tracker`

The broader workflow uses:
- `00 Input/` for files the owner gives.
- `00 Output/` for files the AI returns or creates.

## Stack
- React
- Vite
- TypeScript
- TailwindCSS
- Framer Motion
- Recharts
- LocalStorage fallback
- Supabase-ready cloud sync
- Supabase Auth foundation
- Vercel-ready deployment

Original app was local-only. Current work is migrating it toward Supabase backend, authentication, owner permissions, and Vercel deployment.

## Deployment
GitHub repository name:
`FitnessApp`

GitHub Pages URL:
`https://shalmarhoun.github.io/FitnessApp/`

Vite base:
- Vercel: `/`
- non-Vercel legacy/GitHub Pages: `/FitnessApp/`

Important deployment files:
- `vite.config.ts`
- `vercel.json`
- `.env.example`
- `.github/workflows/deploy.yml`

For old GitHub Pages builds, `dist/index.html` must reference assets under `/FitnessApp/assets/...`. For Vercel, base should be `/`.

## Important Commands
The local machine has `node`, but `npm` and `pnpm` may not be globally available.

Typical GitHub workflow uses:
```bash
npm install
npm run build
```

Local build during Codex sessions has required temporary pnpm download. After building, remove temporary files:
- `node_modules/`
- `package/`
- `.pnpm-store/`
- `pnpm-latest.json`
- `pnpm-current.tgz`
- `tsconfig.tsbuildinfo`

The project should stay lightweight. Current clean state should be around 48 files, not thousands.

## Key Files
- `src/App.tsx`: Main app UI and most app logic.
- `src/data.ts`: Default program, achievements, LocalStorage helpers, date helpers.
- `src/types.ts`: Core TypeScript data types.
- `src/styles/index.css`: Global Tailwind/CSS, splash, brand, visual polish.
- `public/manifest.webmanifest`: PWA manifest.
- `public/icons/`: PWA icons.
- `dist/`: Production build used for GitHub Pages.
- `.github/workflows/deploy.yml`: GitHub Pages workflow.
- `assets/`: Strategy, design, architecture, and generated visual assets.
- `assets/brand/`: Brand board, icon assets, mini brand system.

## Current Feature State
- Mobile-first dashboard.
- Animated premium lavender splash screen.
- Saturday measurement / recovery dashboard state.
- Functional calendar with previous/next month navigation.
- Sunday-start week.
- Sunday, Tuesday, Thursday default workout schedule.
- Editable workout program.
- Active workout timer.
- Rest timer.
- Pause / resume during active workout.
- Cancel workout draft.
- Fast set logging with Weight / Reps labels and visible units.
- Previous performance comparison.
- Post-workout summary.
- Mood, energy, and notes.
- Strength, volume, duration, consistency, and measurement charts.
- Achievements.
- JSON export backup.
- JSON import restore.
- Previous-day workout history from calendar selections.
- Supabase Auth and cloud sync foundation.
- Owner-only permissions control foundation.

## Design Direction
Maintain:
- Premium feminine fitness aesthetic.
- Soft lavender palette.
- Elegant white / lilac / pearl surfaces.
- Glass accents.
- Smooth Apple-style motion.
- Calm, luxurious, motivating tone.

Avoid:
- Masculine gym aesthetics.
- Harsh dark bodybuilding styling.
- Generic template feel.
- Childish gamification.
- Cluttered dashboards.

## Current Brand
Product name:
`FITNESS SM`

Tagline:
`Strength in rhythm`

Primary brand reference:
`assets/brand/fitness-sm-brand-board.png`

Brand integration:
- App icons in `public/icons`.
- Dashboard header logo.
- Splash screen logo and wordmark.
- Premium lavender UI accents.

## Data Storage
LocalStorage keys:
- Main data: `feminineFitnessTracker.v1`
- Active workout draft: `feminineFitnessTracker.activeSession.v1`

Backup/import remains available as a safety net even after Supabase sync.

Supabase migration files added locally:
- `src/lib/supabaseClient.ts`
- `src/lib/cloudStore.ts`
- `supabase/migrations/20260522180000_initial_fitness_sm_backend.sql`
- `supabase/migrations/20260522200000_password_invite_accounts.sql`
- `supabase/migrations/20260522203000_role_based_app_access.sql`
- `supabase/migrations/20260522210000_fix_profiles_policy_recursion.sql`
- `api/admin-users.js`
- `.env.example`

Owner email:
`sh.almarhoun@gmail.com`

Current backend state:
- App works as LocalStorage fallback when Supabase env vars are missing.
- When Supabase is configured and user signs in, app snapshots can sync to Supabase.
- Completed workout sessions also sync to normalized workout tables.
- Owner-only Permissions UI appears only for the owner account.
- Authentication uses invitation-only email/password accounts; public sign-up is intentionally not shown.
- Owner-created coach/viewer accounts are created through the Vercel serverless API using `SUPABASE_SERVICE_ROLE_KEY`.
- The app is gated: splash screen first, then login screen; app screens render only after a valid Supabase session/profile.
- Coach accounts load the owner's cloud snapshot and can edit the program; viewer accounts are read-only in Settings.
- Login email fields intentionally start empty; owner email is not prefilled.
- Fixed profiles RLS recursion that caused `Unable to connect to Supabase` after a successful password sign-in.

## Current Quality Notes
- Before saying done, build or verify when dependencies are available.
- If dependencies are installed temporarily, clean them afterward.
- For visual changes, use the in-app browser and test mobile dimensions when relevant.
- For GitHub Pages, always confirm `/FitnessApp/` asset base.
- For Vercel, confirm `VERCEL` build uses `/` base.
- Supabase project: `ezvwkqnyhlczlkrnhuhv`.
- Supabase project URL: `https://ezvwkqnyhlczlkrnhuhv.supabase.co`.
- Applied migrations: `initial_fitness_sm_backend`, `revoke_security_definer_rpc_access`, `password_invite_accounts`, `role_based_app_access`, `fix_profiles_policy_recursion`.
- Supabase security advisors were checked after migrations and returned no lints.
- Current blockers from 2026-05-22: local `node.exe` returns `Access is denied`; GitHub write access is blocked by integration permissions; Vercel env var `SUPABASE_SERVICE_ROLE_KEY` still needs to be added before owner-created accounts work in deployment.

## File Notes Rule
At the start of future sessions:
1. Read this file.
2. Read `Notes.md`.
3. Skim `Lessons Learned.md`.
4. Check `Assets_Index.md` before touching assets or brand.
