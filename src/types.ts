export type Weekday = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

export type ProgramExercise = {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number | "failure";
  defaultWeight: number;
  unit: "kg" | "lb";
  restSeconds?: number;
  notes?: string;
};

export type ProgramDay = {
  id: string;
  title: string;
  weekday: Weekday;
  warmup: string[];
  exercises: ProgramExercise[];
};

export type LoggedSet = {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  unit: "kg" | "lb";
  completed: boolean;
  completedAt?: string;
};

export type LoggedExercise = {
  id: string;
  sourceExerciseId: string;
  name: string;
  targetReps: number | "failure";
  sets: LoggedSet[];
};

export type WorkoutSession = {
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
  mood?: string;
  energy?: number;
  notes?: string;
  achievementsEarned: string[];
};

export type MeasurementEntry = {
  id: string;
  date: string;
  bodyWeight?: number;
  waist?: number;
  hips?: number;
  thighs?: number;
  arms?: number;
  custom: { id: string; label: string; value: number; unit: string }[];
  notes?: string;
};

export type InBodyReport = {
  id: string;
  ownerId?: string;
  uploadedAt: string;
  reportDate: string;
  fileName: string;
  fileType: "image" | "pdf";
  storagePath?: string;
  publicUrl?: string;
  weight?: number;
  skeletalMuscleMass?: number;
  bodyFatPercentage?: number;
  bodyFatMass?: number;
  bmi?: number;
  metabolicRate?: number;
  segmentAnalysis?: string;
  notes?: string;
};

export type AIReportVisibility = "owner_private" | "shared_analytics";

export type AIInsightReport = {
  id: string;
  createdAt: string;
  reportType: "progress" | "strength" | "recovery" | "consistency" | "inbody" | "program_review";
  title: string;
  summary: string;
  recommendations: string[];
  visibility: AIReportVisibility;
  sourceIds: string[];
  approvedProgramChange?: boolean;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  tier: "Pearl" | "Lavender" | "Gold";
  earnedAt?: string;
};

export type AppData = {
  meta: {
    appName: string;
    schemaVersion: number;
    createdAt: string;
    updatedAt: string;
  };
  preferences: {
    weekStartsOn: "Sunday";
    trainingDays: Weekday[];
    defaultRestSeconds: number;
  };
  program: {
    title: string;
    days: ProgramDay[];
  };
  sessions: WorkoutSession[];
  measurements: MeasurementEntry[];
  inbodyReports: InBodyReport[];
  aiReports: AIInsightReport[];
  achievements: Achievement[];
};

export type ActiveSession = {
  id: string;
  programDayId: string;
  title: string;
  scheduledWeekday: Weekday;
  startedAt: string;
  exercises: LoggedExercise[];
};
