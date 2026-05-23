import type { Session, User } from "@supabase/supabase-js";
import type { AppData, WorkoutSession } from "../types";
import { isSupabaseConfigured, ownerEmail, supabase } from "./supabaseClient";

export { ownerEmail } from "./supabaseClient";

export type CloudRole = "owner" | "coach" | "viewer";

export type CloudProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: CloudRole;
  assigned_owner_id?: string | null;
};

export type PermissionInvite = {
  id: string;
  owner_id: string;
  email: string;
  role: Exclude<CloudRole, "owner">;
  can_view_logs: boolean;
  can_edit_program: boolean;
  can_view_measurements: boolean;
  can_add_notes: boolean;
  created_at: string;
};

export type CloudState = {
  configured: boolean;
  session: Session | null;
  user: User | null;
  profile: CloudProfile | null;
  ownerId: string | null;
  permissions: PermissionInvite[];
  status: "offline" | "ready" | "syncing" | "synced" | "error";
  message?: string;
};

export const emptyCloudState: CloudState = {
  configured: isSupabaseConfigured,
  session: null,
  user: null,
  profile: null,
  ownerId: null,
  permissions: [],
  status: isSupabaseConfigured ? "ready" : "offline",
};

export const isOwnerProfile = (profile: CloudProfile | null, user: User | null) =>
  profile?.role === "owner" || user?.email?.toLowerCase() === ownerEmail;

export const canEditProgram = (profile: CloudProfile | null, user: User | null) =>
  isOwnerProfile(profile, user) || profile?.role === "coach";

export const getCloudOwnerId = (profile: CloudProfile | null, user: User | null) =>
  isOwnerProfile(profile, user) ? user?.id ?? null : profile?.assigned_owner_id ?? null;

export const getCurrentSession = async () => {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

export const subscribeToAuth = (callback: (session: Session | null) => void) => {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
};

export const signInWithPassword = async (email: string, password: string) => {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });
  if (error) throw error;
};

export const resetCloudPassword = async (email: string) => {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
    redirectTo: window.location.origin,
  });
  if (error) throw error;
};

export const signOutCloud = async () => {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const upsertProfile = async (user: User) => {
  if (!supabase) return null;
  const email = user.email?.toLowerCase() ?? null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,display_name,role,assigned_owner_id")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as CloudProfile;

  if (email === ownerEmail) {
    const ownerProfile: CloudProfile = { id: user.id, email, display_name: null, role: "owner", assigned_owner_id: null };
    return ownerProfile;
  }

  throw new Error("This account is not invited yet. Ask the owner to create it from Settings.");
};

export const loadCloudSnapshot = async (userId: string) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("app_snapshots")
    .select("app_data, updated_at")
    .eq("owner_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as { app_data: AppData; updated_at: string } | null;
};

export const saveCloudSnapshot = async (userId: string, appData: AppData) => {
  if (!supabase) return;
  const { error } = await supabase.from("app_snapshots").upsert(
    {
      owner_id: userId,
      app_data: appData,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "owner_id" },
  );
  if (error) throw error;
};

export const saveWorkoutSessionRows = async (ownerId: string, session: WorkoutSession) => {
  if (!supabase) return;
  const { error: sessionError } = await supabase.from("workout_sessions").upsert({
    id: session.id,
    owner_id: ownerId,
    program_day_id: session.programDayId,
    title: session.title,
    scheduled_weekday: session.scheduledWeekday,
    started_at: session.startedAt,
    completed_at: session.completedAt,
    duration_seconds: session.durationSeconds,
    total_volume: session.totalVolume,
    estimated_calories: session.estimatedCalories,
    mood: session.mood ?? null,
    energy: session.energy ?? null,
    notes: session.notes ?? null,
    raw_session: session,
    updated_at: new Date().toISOString(),
  });
  if (sessionError) throw sessionError;

  const exercises = session.exercises.map((exercise, index) => ({
    id: exercise.id,
    session_id: session.id,
    owner_id: ownerId,
    source_exercise_id: exercise.sourceExerciseId,
    name: exercise.name,
    target_reps: String(exercise.targetReps),
    exercise_order: index,
  }));
  if (exercises.length) {
    const { error } = await supabase.from("logged_exercises").upsert(exercises);
    if (error) throw error;
  }

  const sets = session.exercises.flatMap((exercise) =>
    exercise.sets.map((set) => ({
      id: set.id,
      exercise_id: exercise.id,
      session_id: session.id,
      owner_id: ownerId,
      set_number: set.setNumber,
      reps: set.reps,
      weight: set.weight,
      unit: set.unit,
      completed: set.completed,
      completed_at: set.completedAt ?? null,
    })),
  );
  if (sets.length) {
    const { error } = await supabase.from("logged_sets").upsert(sets);
    if (error) throw error;
  }
};

export const listPermissionInvites = async (ownerId: string) => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("user_permissions")
    .select("id,owner_id,email,role,can_view_logs,can_edit_program,can_view_measurements,can_add_notes,created_at")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PermissionInvite[];
};

export const createPermissionInvite = async (ownerId: string, email: string, role: Exclude<CloudRole, "owner">) => {
  if (!supabase) throw new Error("Supabase is not configured.");
  const normalizedEmail = email.toLowerCase().trim();
  const { data, error } = await supabase
    .from("user_permissions")
    .upsert(
      {
        owner_id: ownerId,
        email: normalizedEmail,
        role,
        can_view_logs: true,
        can_edit_program: role === "coach",
        can_view_measurements: role === "coach",
        can_add_notes: role === "coach",
      },
      { onConflict: "owner_id,email" },
    )
    .select("id,owner_id,email,role,can_view_logs,can_edit_program,can_view_measurements,can_add_notes,created_at")
    .single();
  if (error) throw error;
  return data as PermissionInvite;
};

export const createPasswordUser = async (email: string, password: string, role: Exclude<CloudRole, "owner">) => {
  const session = await getCurrentSession();
  const token = session?.access_token;
  if (!token) throw new Error("Owner sign-in is required before adding users.");

  const response = await fetch("/api/admin-users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email: email.toLowerCase().trim(), password, role }),
  });

  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) {
    throw new Error(payload?.message ?? "Unable to create account.");
  }
};
