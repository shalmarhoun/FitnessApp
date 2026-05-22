# Notes

Live task control for the FITNESS SM project.

## Operating Gate
- Do not execute new project work from discussion alone.
- Owner trigger words:
  - `work` or `go`: execute pending items in this file.
  - `note it`: document only; do not execute.
  - `what do we have?`: report this file's current status.
- Exception: direct owner requests in the active session can be executed when clearly phrased as an action, as happened when this system was requested.

## Pending

### 2026-05-22 - Plan backend, auth, roles, history, GitHub, and Vercel migration
Status: IN PROGRESS - local implementation started

Owner wants to evolve FITNESS SM from a local-only static app into a backend-backed product:
- Calendar past-day history: selecting a previous workout day should show that day's logged workout history, including weights, reps, sets, notes, duration, and summary.
- Supabase backend: workout logs, program edits, measurements, achievements, and preferences should save to Supabase instead of only LocalStorage.
- Authentication: owner account and invited users.
- Owner email: `sh.almarhoun@gmail.com`.
- Owner role: full control.
- Settings permissions area: visible only to owner.
- Owner can add invited users such as a coach.
- Coach can view owner's logs and edit exercises/programming, based on permissions granted by owner.
- GitHub integration: future code changes should be pushed to GitHub when owner approves.
- Vercel deployment: migrate deployment from GitHub Pages to Vercel.

Implementation started after owner said: "يالله بلش".

Completed locally:
- Added calendar previous-day workout history UI.
- Added Supabase client foundation.
- Added cloud snapshot sync foundation.
- Added completed workout row sync foundation.
- Added owner-only Settings permissions control.
- Added permission invite UI for coach/viewer roles.
- Added Supabase SQL migration with profiles, permissions, snapshots, workout sessions, logged exercises, logged sets, and RLS policies.
- Added Vercel config.
- Added `.env.example`.
- Updated README for Supabase/Vercel setup.

Blocked:
- Local build verification is blocked because `node.exe` returns `Access is denied` in this Codex environment.
- GitHub push is blocked because the GitHub integration returned `Resource not accessible by integration` when trying to create branch `codex/supabase-vercel-auth`.
- Supabase migration has not been applied because no Supabase `project_id` is available in this workspace.
- Vercel deployment is not completed because the Vercel tool instructed to use CLI/git integration and did not deploy directly.

## Done

### 2026-05-22 - Apply File Note Folder System
Status: DONE

Created the `File Notes/` project memory system:
- `Notes.md`
- `Handover_Notes.md`
- `Conversation_Log.md`
- `Lessons Learned.md`
- `Assets_Index.md`

Purpose: make future AI sessions start from project memory instead of re-learning the app from scratch.

### 2026-05-10 - Workout mobile polish
Status: DONE

Improved the active workout screen for iPhone 15 Pro style mobile use:
- Wider, clearer set logging layout.
- Clear weight and reps fields.
- Added `Pause` / `Resume`.
- Added `Cancel` for accidental or demo workouts.
- Rebuilt `dist`.
- Cleaned temporary dependency files after build.

### 2026-05-10 - Logo visibility fix
Status: DONE

Made the FITNESS SM logo more visible:
- Added a glass logo shell.
- Restored visible wordmark and tagline in the dashboard header.
- Rebuilt `dist`.
- Cleaned temporary dependency files after build.

### 2026-05-09 - Product polish pass
Status: DONE

Implemented high-level polish:
- Animated premium splash screen.
- Functional calendar with Sunday week start.
- Correct rest / measurement day dashboard logic.
- Saturday measurement state.
- Clear weight / reps / unit labels.
- Updated production build for GitHub Pages.

### 2026-05-09 - GitHub Pages readiness
Status: DONE

Prepared deployment for repository `FitnessApp`:
- `vite.config.ts` uses `base: "/FitnessApp/"`.
- GitHub Actions workflow builds and deploys from `dist`.
- Verified local preview at `/FitnessApp/`.
- Kept project clean by removing temporary `node_modules`.
