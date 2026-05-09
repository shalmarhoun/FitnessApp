# LocalStorage Schema and Backup Architecture

## Storage Strategy

Storage key:

```txt
feminineFitnessTracker.v1
```

All persisted app data lives under one root object.

Benefits:
- Simple export.
- Simple import.
- Easier migrations.
- Easier backup integrity checks.

## Root Schema

```ts
type AppData = {
  meta: {
    appName: "Premium Feminine Fitness Tracker";
    schemaVersion: 1;
    createdAt: string;
    updatedAt: string;
  };
  preferences: AppPreferences;
  program: WorkoutProgram;
  sessions: WorkoutSession[];
  measurements: MeasurementEntry[];
  achievements: AchievementState[];
  streaks: StreakState;
};
```

## Preferences

```ts
type AppPreferences = {
  weekStartsOn: "sunday";
  trainingDays: Weekday[];
  units: {
    weight: "kg";
    bodyMeasurements: "cm";
  };
  defaultRestSeconds: number;
  theme: "soft-lavender";
};
```

## Program Schema

```ts
type WorkoutProgram = {
  id: string;
  title: string;
  days: ProgramDay[];
};

type ProgramDay = {
  id: string;
  weekday: Weekday;
  title: string;
  warmup: string[];
  exercises: ProgramExercise[];
  order: number;
};

type ProgramExercise = {
  id: string;
  name: string;
  equipmentNote?: string;
  targetSets: number;
  targetReps: number | "failure";
  defaultWeight?: number;
  weightUnit?: "kg" | "lb";
  order: number;
};
```

## Workout Session Schema

```ts
type WorkoutSession = {
  id: string;
  programDayId: string;
  title: string;
  scheduledWeekday: Weekday;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  exercises: LoggedExercise[];
  totalVolume: number;
  estimatedCalories: number;
  mood?: "calm" | "strong" | "tired" | "energized" | "focused";
  energy?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  achievementsEarned: string[];
};

type LoggedExercise = {
  id: string;
  sourceExerciseId: string;
  name: string;
  sets: LoggedSet[];
};

type LoggedSet = {
  id: string;
  setNumber: number;
  targetReps: number | "failure";
  reps: number;
  weight: number;
  weightUnit: "kg" | "lb";
  completed: boolean;
  completedAt?: string;
};
```

## Measurements Schema

```ts
type MeasurementEntry = {
  id: string;
  date: string;
  bodyWeight?: number;
  waist?: number;
  hips?: number;
  thighs?: number;
  arms?: number;
  custom: {
    id: string;
    label: string;
    value: number;
    unit: string;
  }[];
  notes?: string;
};
```

## Streak Schema

```ts
type StreakState = {
  currentWeeklyStreak: number;
  bestWeeklyStreak: number;
  lastCompletedWorkoutDate?: string;
  completedWeeks: string[];
};
```

## Achievement Schema

```ts
type AchievementState = {
  id: string;
  title: string;
  description: string;
  earnedAt?: string;
  tier: "pearl" | "lavender" | "gold";
};
```

## Default Program Data

Day 1 - Inner Thighs / Quads:
- Warmup: Lateral Step Down, Jog 1KM, Hip Opener.
- Sumo stance swing to squat to shoulder press (2KB 8kg): 6 x 10.
- Side lunge super set sumo squat (sand bag): 6 x 10.
- Front squat to shoulder press (plate 25): 6 x 10.
- Walking lunges narrow (sand bag): 5 x 15.

Day 2 - Upper / Core:
- Warmup: Lateral Step Down, Jog 1KM, Upper Stretch.
- Single KB Bent Row (8kg): 3 x 15.
- 2KB Z Press (6kg): 3 x 15.
- KB Triceps Extension (8kg): 3 x 15.
- Pull Over DB (8kg): 3 x 15.
- Devil Press (2DB 5kg): 3 x 15.
- Around The World (2DB 2kg): 3 x 15.
- GTOH (plate 25lb): 3 x 15.
- Beast Hold: 3 x 15.
- Flutter Kicks (1DB 5kg): 3 x 15.
- S Triceps Kick Back (1DB 5kg): 3 x 15.
- BBJ: 3 x 15.
- Plank Until Failure: 1 set to failure.

Day 3 - Lower:
- Warmup: Hip Opener, Lateral Step Down.
- Bulgarian Split Squat (sand bag): 5 x 10.
- Romanian Deadlift Barbell: 5 x 10.
- Step Up (1DB 10kg): 5 x 10.
- Hip Thrust: 4 x 12.

## Analytics Logic

Total volume:

```txt
sum(weight * reps) for completed weighted sets
```

For bodyweight or unknown weight exercises:
- Count completion and reps.
- Exclude from lifted volume unless a weight is entered.

Estimated calories:
- Simple personal estimate based on duration and intensity.
- Use conservative default: durationMinutes * 6.
- Make it clear as estimated.

Previous performance:
- Find most recent completed session with the same source exercise id.
- Compare weight, reps, set volume, and total exercise volume.

Progressive overload insight:
- Positive if total exercise volume or top set weight increased.
- Neutral if matched.
- Gentle prompt if decreased.

## Export Backup Architecture

Backup file shape:

```ts
type BackupFile = {
  backupMeta: {
    appName: "Premium Feminine Fitness Tracker";
    schemaVersion: 1;
    exportedAt: string;
  };
  data: AppData;
};
```

Filename:

```txt
feminine-fitness-backup-YYYY-MM-DD.json
```

Export steps:
1. Pull current app state.
2. Validate serializable data.
3. Create backup envelope.
4. Convert to pretty JSON.
5. Create Blob.
6. Trigger download.

## Import Backup Architecture

Import steps:
1. User selects `.json` file.
2. Read file as text.
3. Parse JSON safely.
4. Validate `backupMeta` and `data`.
5. Check schema version.
6. Run migrations if necessary.
7. Ask for confirmation before replacing data.
8. Save to LocalStorage.
9. Refresh in-memory state.

Validation rules:
- Must include `data.meta.schemaVersion`.
- Must include `program.days`.
- `sessions` must be an array.
- `measurements` must be an array.
- Invalid files are rejected with a clear message.

## Migration Strategy

Use versioned migrations:

```ts
const migrations = {
  1: (data: unknown) => data as AppData
};
```

Future versions can transform older backup data into the latest shape.

