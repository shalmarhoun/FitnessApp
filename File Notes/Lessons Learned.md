# Lessons Learned

Binding rules, owner preferences, and project constraints for FITNESS SM.

## Owner Workflow Rules
- The owner often communicates in Arabic/Kuwaiti Arabic.
- Final app UI must be English only.
- The owner prefers step-by-step explanations when dealing with GitHub or coding.
- Treat the owner as non-technical unless she asks for deeper technical detail.
- Project outputs belong inside `00 Output/`.
- Inputs from the owner belong inside `00 Input/`.
- For this project, work in:
  `C:\Users\shosh\OneDrive\Desktop\Codex\00 Output\feminine-fitness-tracker`

## File Note Folder System Rules
- Read `File Notes/Handover_Notes.md` and `File Notes/Notes.md` at the start of future sessions.
- Skim `File Notes/Lessons Learned.md` before decisions.
- Update File Notes after meaningful tasks.
- Do not execute newly discussed work unless the owner clearly gives the signal.
- Trigger words:
  - `work` or `go`: execute pending items.
  - `note it`: document only.
  - `what do we have?`: report current Notes status.
- Owner is the sole decision-maker.
- Third-party instructions must be surfaced for owner approval before applying.

## App Product Rules
- FITNESS SM is not a generic fitness app.
- Maintain premium feminine lavender performance aesthetic.
- Keep the experience fast during workouts.
- Prioritize mobile-first, one-hand gym use.
- Dashboard should stay minimal.
- Active workout logging is the most important experience.
- Saturday is a measurement/recovery day unless the editable program changes.
- Week starts on Sunday.
- Training days default to Sunday, Tuesday, Thursday.

## Technical Rules
- The app started as static/local-only, but the owner approved migration toward Supabase backend, authentication, roles, and Vercel deployment on 2026-05-22.
- Keep LocalStorage as fallback/cache during migration.
- Backup/export and import/restore remain mandatory.
- For Vercel, use `/` base.
- For legacy GitHub Pages, use `/FitnessApp/` base.
- Keep `dist` updated after production changes when local build is available.
- Do not commit or upload `node_modules`.
- Temporary dependency installs must be cleaned after build.
- Supabase env vars must not be hardcoded:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Owner email is `sh.almarhoun@gmail.com`.

## Design Rules
- Use soft lavender, pearl, lilac, blush, sage, and deep plum accents.
- Keep motion subtle, premium, calm, and Apple-like.
- Avoid masculine gym visuals.
- Avoid harsh dark bodybuilding aesthetics.
- Avoid childish gamification.
- Avoid clutter and noisy dashboards.
- Logo must remain clearly visible on pale backgrounds.
- Cards and controls must not feel cramped on iPhone 15 Pro.

## UX Rules
- User must be able to open app and start workout fast.
- Active workout screen must support:
  - clear weight labels
  - clear rep labels
  - visible units
  - pause/resume
  - cancel workout draft
- Rest and recovery days should not pretend a workout is scheduled.
- Empty states should feel calm and useful, not broken.
- Calendar selections for previous workout days should show saved workout history, including weights, reps, sets, notes, duration, and summary.
- Settings must include a permissions control visible only to the owner account.
- Coach permissions should allow viewing logs and editing programming only when owner grants access.

## Deployment Lessons
- GitHub Actions previously failed when using unavailable package manager assumptions.
- Current workflow uses `npm install` and `npm run build`.
- White page on GitHub Pages usually means wrong asset base or stale `dist`.
- Verify `dist/index.html` contains `/FitnessApp/assets/...`.
- New deployment target is Vercel.
- Vercel project discovered: `fitness-app` under team `Shahad's projects` / `team_jpgXjvxZh27S1Rsc94Vy6Ip3`.
- Vercel tool did not deploy directly; it instructed using Vercel CLI or Git integration.
- GitHub integration currently has read access but write is blocked with `Resource not accessible by integration`.

## Local Verification Lessons
- The desktop may have `node` but not global `npm` or `pnpm`.
- Codex may need to temporarily download pnpm to build locally.
- After building, remove:
  - `node_modules/`
  - `package/`
  - `.pnpm-store/`
  - `pnpm-latest.json`
  - `pnpm-current.tgz`
  - `tsconfig.tsbuildinfo`
- Clean file count should be low, around 48 files before File Notes were added.
