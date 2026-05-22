# Assets Index

Catalog and usage notes for FITNESS SM project assets.

## Purpose
Track brand, design, PWA, and documentation assets so future agents use the correct files and do not regenerate approved/final assets accidentally.

## Brand Assets

### `assets/brand/fitness-sm-brand-board.png`
Status: Approved reference

Purpose:
- Primary visual reference for FITNESS SM brand direction.
- Shows app icon, wordmark, splash screen direction, palette, typography, UI accents, achievement style, and texture direction.

How AI should use:
- Use as inspiration for premium lavender luxury feel.
- Do not replace unless owner explicitly asks.

### `assets/brand/fitness-sm-brand-system.md`
Status: Reference

Purpose:
- Describes mini brand identity direction and integration notes.

How AI should use:
- Read before changing branding, splash, icons, or visual identity.

### `assets/brand/fitness-sm-icon-main.png`
Status: Brand asset

Purpose:
- Main premium app icon artwork.

How AI should use:
- Treat as source brand icon unless owner asks for a new icon.

### `assets/brand/fitness-sm-icon-main-v1.png`
Status: Brand asset variant

Purpose:
- Alternate or earlier icon output.

How AI should use:
- Do not prefer over current main icon unless visually requested.

### `assets/brand/fitness-sm-icon-alt.png`
Status: Alternate brand asset

Purpose:
- Alternate icon variation.

How AI should use:
- Use only for comparison, optional variants, or owner-requested icon changes.

## PWA Icons

### `public/icons/icon-192.png`
Status: Active PWA icon

Purpose:
- Used by app UI logo and PWA manifest.

Important:
- This icon must remain visible against pale lavender backgrounds.

### `public/icons/icon-512.png`
Status: Active PWA icon

Purpose:
- High-resolution PWA icon.

### `public/icons/apple-touch-icon.png`
Status: Active iOS install icon

Purpose:
- iPhone home screen icon.

## Product / Design Documentation

### `assets/01-product-strategy.md`
Status: Reference

Purpose:
- Product strategy and positioning.

### `assets/02-app-architecture.md`
Status: Reference

Purpose:
- Architecture direction for the static React app.

### `assets/03-design-system.md`
Status: Reference

Purpose:
- Color, typography, component, and visual system notes.

### `assets/04-ux-flows-and-wireframes.md`
Status: Reference

Purpose:
- UX flow and screen wireframe planning.

### `assets/05-data-localstorage-backup.md`
Status: Reference

Purpose:
- LocalStorage schema and backup/import architecture.

### `assets/06-achievements-and-build-plan.md`
Status: Reference

Purpose:
- Achievement system and build plan.

## Visual Concept Assets

### `assets/visual-direction-board.png`
Status: Reference

Purpose:
- Early visual mood direction.

### `assets/dashboard-screen-concept.png`
Status: Reference

Purpose:
- Dashboard visual concept.

### `assets/workout-logging-screen-concept.png`
Status: Reference

Purpose:
- Workout logging visual concept.

### `assets/progress-measurements-screen-concept.png`
Status: Reference

Purpose:
- Progress and measurement screen concept.

### `assets/achievement-badge-system.png`
Status: Reference

Purpose:
- Achievement badge direction.

## Source Code Assets

### `src/App.tsx`
Status: Active source

Purpose:
- Main app implementation.

How AI should use:
- Edit carefully; currently monolithic.
- Prefer small, targeted improvements unless owner asks for refactor.

### `src/styles/index.css`
Status: Active source

Purpose:
- Global styles, brand shell, splash animations, utility CSS.

How AI should use:
- Keep motion subtle and premium.

### `src/data.ts`
Status: Active source

Purpose:
- Default program, achievements, LocalStorage helpers, week/date logic.

How AI should use:
- Be careful with week start, training days, and backup schema.

## Output Assets

### `dist/`
Status: Generated production output

Purpose:
- Built site for GitHub Pages.

Protection rule:
- Regenerate only after source changes or owner request.
- After regeneration, confirm GitHub Pages asset paths use `/FitnessApp/assets/...`.

## Known Errors / Risks
- White GitHub Pages screen can happen if `dist` is stale or Vite base is wrong.
- `node_modules` can inflate project to thousands of files. Do not keep it in final folder.
- Logo can appear missing if too pale against lavender/white background.
- Active workout rows can feel cramped on iPhone-width screens if set controls share one row.

## Pre-flight Checklist
Before reporting final changes:
- Confirm visible app language is English.
- Confirm no `node_modules` remains if dependencies were installed temporarily.
- Confirm `dist` is rebuilt when source changes affect production.
- Confirm `dist/index.html` references `/FitnessApp/assets/...`.
- Confirm mobile workout screen remains usable at iPhone 15 Pro width when workout UI changes.
- Confirm backup/import remains present after settings changes.

