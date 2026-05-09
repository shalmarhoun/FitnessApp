import type { Achievement, AppData, ProgramDay, ProgramExercise, Weekday, WorkoutSession } from "./types";

export const storageKey = "feminineFitnessTracker.v1";
export const activeSessionKey = "feminineFitnessTracker.activeSession.v1";
export const weekdays: Weekday[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const id = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const exercise = (name: string, sets: number, reps: number | "failure", weight = 0, unit: "kg" | "lb" = "kg"): ProgramExercise => ({
  id: id(name),
  name,
  targetSets: sets,
  targetReps: reps,
  defaultWeight: weight,
  unit,
});

export const defaultProgramDays: ProgramDay[] = [
  {
    id: "day-inner-thighs-quads",
    title: "Inner Thighs / Quads",
    weekday: "Sunday",
    warmup: ["Lateral Step Down", "Jog 1KM", "Hip Opener"],
    exercises: [
      exercise("Sumo stance swing to squat to shoulder press (2KB 8kg)", 6, 10, 8),
      exercise("Side lunge super set sumo squat (sand bag)", 6, 10, 0),
      exercise("Front squat to shoulder press (plate 25)", 6, 10, 25, "lb"),
      exercise("Walking lunges narrow (sand bag)", 5, 15, 0),
    ],
  },
  {
    id: "day-upper-core",
    title: "Upper / Core",
    weekday: "Tuesday",
    warmup: ["Lateral Step Down", "Jog 1KM", "Upper Stretch"],
    exercises: [
      exercise("Single KB Bent Row (8kg)", 3, 15, 8),
      exercise("2KB Z Press (6kg)", 3, 15, 6),
      exercise("KB Triceps Extension (8kg)", 3, 15, 8),
      exercise("Pull Over DB (8kg)", 3, 15, 8),
      exercise("Devil Press (2DB 5kg)", 3, 15, 5),
      exercise("Around The World (2DB 2kg)", 3, 15, 2),
      exercise("GTOH (plate 25lb)", 3, 15, 25, "lb"),
      exercise("Beast Hold", 3, 15, 0),
      exercise("Flutter Kicks (1DB 5kg)", 3, 15, 5),
      exercise("S Triceps Kick Back (1DB 5kg)", 3, 15, 5),
      exercise("BBJ", 3, 15, 0),
      exercise("Plank Until Failure", 1, "failure", 0),
    ],
  },
  {
    id: "day-lower",
    title: "Lower",
    weekday: "Thursday",
    warmup: ["Hip Opener", "Lateral Step Down"],
    exercises: [
      exercise("Bulgarian Split Squat (sand bag)", 5, 10, 0),
      exercise("Romanian Deadlift Barbell", 5, 10, 0),
      exercise("Step Up (1DB 10kg)", 5, 10, 10),
      exercise("Hip Thrust", 4, 12, 0),
    ],
  },
];

export const achievementCatalog: Achievement[] = [
  { id: "first-ritual", title: "First Ritual", description: "Complete your first workout.", tier: "Pearl" },
  { id: "weekly-grace", title: "Weekly Grace", description: "Complete all three planned workouts in a week.", tier: "Lavender" },
  { id: "volume-pr", title: "Volume PR", description: "Lift more total volume than your last matching workout.", tier: "Gold" },
  { id: "progressive-overload", title: "Progressive Overload", description: "Improve three exercises in one session.", tier: "Gold" },
  { id: "saturday-ritual", title: "Saturday Ritual", description: "Save measurements on Saturday.", tier: "Pearl" },
  { id: "steady-builder", title: "Steady Builder", description: "Complete five workouts.", tier: "Lavender" },
];

export const createDefaultData = (): AppData => {
  const now = new Date().toISOString();
  return {
    meta: {
      appName: "FITNESS SM",
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
    },
    preferences: {
      weekStartsOn: "Sunday",
      trainingDays: ["Sunday", "Tuesday", "Thursday"],
      defaultRestSeconds: 90,
    },
    program: {
      title: "Personal Strength Ritual",
      days: defaultProgramDays,
    },
    sessions: [],
    measurements: [],
    achievements: achievementCatalog,
  };
};

export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return createDefaultData();
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.meta || parsed.meta.schemaVersion !== 1 || !Array.isArray(parsed.program?.days)) {
      return createDefaultData();
    }
    return {
      ...parsed,
      achievements: achievementCatalog.map((achievement) => ({
        ...achievement,
        earnedAt: parsed.achievements?.find((item) => item.id === achievement.id)?.earnedAt,
      })),
    };
  } catch {
    return createDefaultData();
  }
};

export const saveData = (data: AppData) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ ...data, meta: { ...data.meta, updatedAt: new Date().toISOString() } }));
  } catch (error) {
    console.error("Unable to save app data", error);
  }
};

export const dateKey = (date: Date) => date.toISOString().slice(0, 10);

export const weekdayName = (date = new Date()): Weekday => weekdays[date.getDay()];

export const startOfWeek = (date = new Date()) => {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  clone.setDate(clone.getDate() - clone.getDay());
  return clone;
};

export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}` : `${mins}:${String(secs).padStart(2, "0")}`;
};

export const sessionVolume = (session: Pick<WorkoutSession, "exercises">) =>
  session.exercises.reduce(
    (total, exerciseItem) =>
      total + exerciseItem.sets.reduce((setTotal, set) => setTotal + (set.completed ? set.weight * set.reps : 0), 0),
    0,
  );

export const sameWeekSessions = (sessions: WorkoutSession[], date = new Date()) => {
  const start = startOfWeek(date).getTime();
  const end = start + 7 * 24 * 60 * 60 * 1000;
  return sessions.filter((session) => {
    const time = new Date(session.completedAt).getTime();
    return time >= start && time < end;
  });
};

export const latestPreviousSession = (sessions: WorkoutSession[], programDayId: string) =>
  sessions
    .filter((session) => session.programDayId === programDayId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
