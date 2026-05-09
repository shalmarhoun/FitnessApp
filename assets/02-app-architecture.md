# App Architecture

## Tech Stack

Mandatory stack:
- React.
- Vite.
- TypeScript.
- TailwindCSS.
- Framer Motion.
- Recharts.

Architecture type:
- Pure static web app.
- No backend.
- No database.
- No authentication.
- Data persisted in LocalStorage only.

## Application Layers

### Presentation Layer

Responsible for:
- Screens.
- Responsive layouts.
- Premium UI components.
- Motion transitions.
- Chart rendering.

Primary folders:
- `src/app`
- `src/pages`
- `src/components`
- `src/components/ui`
- `src/components/charts`

### Feature Layer

Responsible for domain-specific behavior:
- Workout program editing.
- Session tracking.
- Measurements.
- Achievements.
- Progress analytics.
- Backup import/export.

Primary folders:
- `src/features/workouts`
- `src/features/progress`
- `src/features/measurements`
- `src/features/achievements`
- `src/features/backup`

### Data Layer

Responsible for:
- LocalStorage access.
- Schema versioning.
- Migrations.
- Backup serialization.
- Restore validation.

Primary folders:
- `src/lib/storage`
- `src/lib/data`
- `src/lib/analytics`

### State Layer

Recommended approach:
- React context plus reducer for global app state.
- Feature-specific hooks for derived data.
- Keep state simple and inspectable.

Why:
- The app is personal and static.
- No server state exists.
- Avoid unnecessary state libraries.

## Proposed Folder Structure

```txt
feminine-fitness-tracker/
  package.json
  index.html
  vite.config.ts
  tsconfig.json
  tailwind.config.ts
  postcss.config.js
  src/
    main.tsx
    App.tsx
    app/
      AppProvider.tsx
      routes.ts
      defaultData.ts
    components/
      layout/
        AppShell.tsx
        BottomNav.tsx
        PageHeader.tsx
      ui/
        Button.tsx
        Card.tsx
        Input.tsx
        Modal.tsx
        SegmentedControl.tsx
        StatPill.tsx
        TimerRing.tsx
        Toast.tsx
      charts/
        LavenderLineChart.tsx
        VolumeBarChart.tsx
        ConsistencyCalendar.tsx
    features/
      workouts/
        WorkoutDashboardCard.tsx
        WorkoutSession.tsx
        ExerciseLogger.tsx
        SetRow.tsx
        RestTimer.tsx
        WorkoutSummary.tsx
        ProgramEditor.tsx
        workoutUtils.ts
      progress/
        ProgressOverview.tsx
        StrengthProgress.tsx
        VolumeAnalytics.tsx
        DurationTrends.tsx
        progressUtils.ts
      measurements/
        MeasurementsScreen.tsx
        MeasurementForm.tsx
        MeasurementChart.tsx
        measurementUtils.ts
      achievements/
        AchievementShelf.tsx
        achievementRules.ts
      backup/
        BackupPanel.tsx
        backupUtils.ts
    lib/
      storage/
        localStorageClient.ts
        migrations.ts
        schema.ts
      analytics/
        workoutAnalytics.ts
        progression.ts
      dates/
        week.ts
      format/
        numbers.ts
        time.ts
    pages/
      Dashboard.tsx
      Workout.tsx
      Progress.tsx
      Measurements.tsx
      Settings.tsx
    styles/
      index.css
    types/
      fitness.ts
```

## Routing Strategy

No heavy router is required, but React Router can be used if desired. For a compact static app, a simple internal route state is enough.

Primary tabs:
- Dashboard.
- Workout.
- Progress.
- Measurements.
- Settings.

Bottom navigation should be persistent on mobile.

## Performance Strategy

Targets:
- Instant first render.
- Lightweight state updates during workout logging.
- Avoid expensive recalculation on each keystroke.
- Memoize derived analytics.
- Persist LocalStorage in debounced writes where needed.

Recommendations:
- Keep active workout session state in memory while logging.
- Save session drafts frequently but not on every animation frame.
- Use `useMemo` for chart datasets.
- Use small component boundaries around set rows.
- Prefer CSS transitions and Framer Motion only where the motion matters.

## Editable Program Architecture

Default program is seeded on first app load.

The app stores program templates separately from completed workout sessions:
- Program templates define future workouts.
- Workout sessions store historical performance.

This makes editing safe:
- Editing today's program does not rewrite history.
- Completed logs remain stable.

## LocalStorage Data Flow

1. App boots.
2. Read root storage key.
3. Validate schema version.
4. If empty, seed default app data.
5. If old version, run migrations.
6. Load into app context.
7. User interacts.
8. Reducer updates state.
9. Persistence effect writes to LocalStorage.

## Backup Data Flow

Export:
1. Read current app state.
2. Add metadata: app name, schema version, exportedAt.
3. Create JSON blob.
4. Trigger file download.

Import:
1. User selects JSON file.
2. Parse JSON.
3. Validate required fields.
4. Confirm restore.
5. Run migration if needed.
6. Replace LocalStorage.
7. Reload state.

