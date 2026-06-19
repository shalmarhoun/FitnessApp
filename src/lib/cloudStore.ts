import type { Session, User } from "@supabase/supabase-js";
import type { AIInsightReport, AppData, InBodyReport, WorkoutSession } from "../types";
import { isSupabaseConfigured, ownerEmail, supabase } from "./supabaseClient";

export { ownerEmail } from "./supabaseClient";

export type CloudRole = "owner" | "admin" | "coach" | "viewer";

export type CloudProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: CloudRole;
  assigned_owner_id?: string | null;
  disabled_at?: string | null;
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
  can_manage_users: boolean;
  can_upload_inbody: boolean;
  can_manage_ai: boolean;
  disabled_at?: string | null;
  revoked_at?: string | null;
  created_at: string;
};

export type AppNotification = {
  id: string;
  owner_id: string;
  actor_id?: string | null;
  event_type: string;
  entity_type: string;
  entity_id?: string | null;
  metadata: {
    title?: string;
    message?: string;
    workoutTitle?: string;
    completedAt?: string;
    durationSeconds?: number;
    totalVolume?: number;
    notes?: string;
  };
  created_at: string;
};

export type CloudState = {
  configured: boolean;
  session: Session | null;
  user: User | null;
  profile: CloudProfile | null;
  ownerId: string | null;
  permissions: PermissionInvite[];
  notifications: AppNotification[];
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
  notifications: [],
  status: isSupabaseConfigured ? "ready" : "offline",
};

export const isOwnerProfile = (profile: CloudProfile | null, user: User | null) =>
  profile?.role === "owner" || user?.email?.toLowerCase() === ownerEmail;

export const isAdminProfile = (profile: CloudProfile | null) => profile?.role === "admin";

export const canEditProgram = (profile: CloudProfile | null, user: User | null) =>
  isOwnerProfile(profile, user) || profile?.role === "admin" || profile?.role === "coach";

export const canManageUsers = (profile: CloudProfile | null, user: User | null) => isOwnerProfile(profile, user);

export const canUploadInBody = (profile: CloudProfile | null, user: User | null) =>
  isOwnerProfile(profile, user) || profile?.role === "admin" || profile?.role === "coach";

export const canManageAI = (profile: CloudProfile | null, user: User | null) =>
  isOwnerProfile(profile, user) || profile?.role === "admin";

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
    .select("id,email,display_name,role,assigned_owner_id,disabled_at")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as CloudProfile;

  if (email === ownerEmail) {
    const ownerProfile: CloudProfile = { id: user.id, email, display_name: null, role: "owner", assigned_owner_id: null, disabled_at: null };
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

export const sendWorkoutFinishedNotification = async (ownerId: string, session: WorkoutSession) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("app_audit_events")
    .insert({
      owner_id: ownerId,
      actor_id: (await getCurrentSession())?.user.id,
      event_type: "workout_finished",
      entity_type: "workout_session",
      entity_id: session.id,
      metadata: {
        title: "Workout completed",
        message: `${session.title} was finished.`,
        workoutTitle: session.title,
        completedAt: session.completedAt,
        durationSeconds: session.durationSeconds,
        totalVolume: session.totalVolume,
        notes: session.notes ?? null,
      },
    })
    .select("id,owner_id,actor_id,event_type,entity_type,entity_id,metadata,created_at")
    .single();
  if (error) throw error;
  return data as AppNotification;
};

export const listAppNotifications = async (ownerId: string) => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("app_audit_events")
    .select("id,owner_id,actor_id,event_type,entity_type,entity_id,metadata,created_at")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw error;
  return (data ?? []) as AppNotification[];
};

export const updateWorkoutFinishedNotificationNotes = async (ownerId: string, session: WorkoutSession) => {
  if (!supabase) return;
  await supabase
    .from("app_audit_events")
    .update({
      metadata: {
        title: "Workout completed",
        message: `${session.title} was finished.`,
        workoutTitle: session.title,
        completedAt: session.completedAt,
        durationSeconds: session.durationSeconds,
        totalVolume: session.totalVolume,
        notes: session.notes ?? null,
      },
    })
    .eq("owner_id", ownerId)
    .eq("entity_id", session.id)
    .eq("event_type", "workout_finished");
};

const base64UrlToUint8Array = (value: string) => {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let index = 0; index < rawData.length; index += 1) output[index] = rawData.charCodeAt(index);
  return output;
};

export const getPushSupportStatus = () => {
  if (typeof window === "undefined") return { supported: false, message: "Phone notifications are not available here." };
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return { supported: false, message: "This browser does not support phone notifications." };
  }
  if (!import.meta.env.VITE_VAPID_PUBLIC_KEY) {
    return { supported: false, message: "Phone notification public key is missing." };
  }
  return { supported: true, message: Notification.permission };
};

export const subscribeToWorkoutPushNotifications = async () => {
  const support = getPushSupportStatus();
  if (!support.supported) throw new Error(support.message);

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Phone notification permission was not granted.");

  const session = await getCurrentSession();
  const token = session?.access_token;
  if (!token) throw new Error("Sign in before enabling phone notifications.");

  const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
  const existingSubscription = await registration.pushManager.getSubscription();
  const subscription =
    existingSubscription ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
    }));

  const response = await fetch("/api/push-subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });

  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) throw new Error(payload?.message ?? "Unable to enable phone notifications.");
  return payload?.message ?? "Phone notifications are enabled.";
};

export const sendWorkoutPushNotification = async (sessionToSend: WorkoutSession) => {
  const session = await getCurrentSession();
  const token = session?.access_token;
  if (!token) return null;

  const response = await fetch("/api/push-workout-finished", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ session: sessionToSend }),
  });

  const payload = (await response.json().catch(() => null)) as { message?: string; sent?: number; failed?: number } | null;
  if (!response.ok) throw new Error(payload?.message ?? "Unable to send workout phone notification.");
  return payload;
};

export const deleteWorkoutSessionRows = async (ownerId: string, sessionId: string) => {
  if (!supabase) return;
  const { error } = await supabase.from("workout_sessions").delete().eq("owner_id", ownerId).eq("id", sessionId);
  if (error) throw error;
};

export const listPermissionInvites = async (ownerId: string) => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("user_permissions")
    .select("id,owner_id,email,role,can_view_logs,can_edit_program,can_view_measurements,can_add_notes,can_manage_users,can_upload_inbody,can_manage_ai,disabled_at,revoked_at,created_at")
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
        can_edit_program: role === "admin" || role === "coach",
        can_view_measurements: role === "admin" || role === "coach" || role === "viewer",
        can_add_notes: role === "admin" || role === "coach",
        can_manage_users: role === "admin",
        can_upload_inbody: role === "admin" || role === "coach",
        can_manage_ai: role === "admin",
      },
      { onConflict: "owner_id,email" },
    )
    .select("id,owner_id,email,role,can_view_logs,can_edit_program,can_view_measurements,can_add_notes,can_manage_users,can_upload_inbody,can_manage_ai,disabled_at,revoked_at,created_at")
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

export const revokePasswordUser = async (email: string, role: Exclude<CloudRole, "owner">) => {
  const session = await getCurrentSession();
  const token = session?.access_token;
  if (!token) throw new Error("Owner sign-in is required before revoking users.");

  const response = await fetch("/api/admin-users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email: email.toLowerCase().trim(), role, action: "revoke" }),
  });

  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) {
    throw new Error(payload?.message ?? "Unable to revoke account.");
  }
};

export const uploadInBodyReport = async (
  ownerId: string,
  file: File,
  report: Omit<InBodyReport, "id" | "uploadedAt" | "fileName" | "fileType" | "storagePath" | "publicUrl">,
) => {
  if (!supabase) throw new Error("Supabase is not configured.");
  const fileType = file.type === "application/pdf" ? "pdf" : "image";
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  const path = `${ownerId}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from("inbody-reports").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("inbody_reports")
    .insert({
      owner_id: ownerId,
      uploaded_by: (await getCurrentSession())?.user.id,
      report_date: report.reportDate,
      file_name: file.name,
      file_type: fileType,
      storage_path: path,
      weight: report.weight ?? null,
      skeletal_muscle_mass: report.skeletalMuscleMass ?? null,
      body_fat_percentage: report.bodyFatPercentage ?? null,
      body_fat_mass: report.bodyFatMass ?? null,
      bmi: report.bmi ?? null,
      inbody_score: report.inbodyScore ?? null,
      waist_hip_ratio: report.waistHipRatio ?? null,
      visceral_fat_level: report.visceralFatLevel ?? null,
      metabolic_rate: report.metabolicRate ?? null,
      notes: report.notes ?? null,
      segment_analysis: report.segmentAnalysis ? { notes: report.segmentAnalysis } : null,
    })
    .select("id,owner_id,report_date,file_name,file_type,storage_path,weight,skeletal_muscle_mass,body_fat_percentage,body_fat_mass,bmi,inbody_score,waist_hip_ratio,visceral_fat_level,metabolic_rate,segment_analysis,notes,created_at")
    .single();
  if (error) throw error;
  return mapInBodyReport(data);
};

export const saveManualInBodyReport = async (
  ownerId: string,
  report: Omit<InBodyReport, "id" | "uploadedAt" | "fileName" | "fileType" | "storagePath" | "publicUrl">,
) => {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("inbody_reports")
    .insert({
      owner_id: ownerId,
      uploaded_by: (await getCurrentSession())?.user.id,
      report_date: report.reportDate,
      file_name: "Manual InBody Entry",
      file_type: "image",
      storage_path: `${ownerId}/manual-${Date.now()}`,
      weight: report.weight ?? null,
      skeletal_muscle_mass: report.skeletalMuscleMass ?? null,
      body_fat_percentage: report.bodyFatPercentage ?? null,
      body_fat_mass: report.bodyFatMass ?? null,
      bmi: report.bmi ?? null,
      inbody_score: report.inbodyScore ?? null,
      waist_hip_ratio: report.waistHipRatio ?? null,
      visceral_fat_level: report.visceralFatLevel ?? null,
      metabolic_rate: report.metabolicRate ?? null,
      notes: report.notes ?? null,
      segment_analysis: report.segmentAnalysis ? { notes: report.segmentAnalysis } : null,
    })
    .select("id,owner_id,report_date,file_name,file_type,storage_path,weight,skeletal_muscle_mass,body_fat_percentage,body_fat_mass,bmi,inbody_score,waist_hip_ratio,visceral_fat_level,metabolic_rate,segment_analysis,notes,created_at")
    .single();
  if (error) throw error;
  return mapInBodyReport(data);
};

export const listInBodyReports = async (ownerId: string) => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("inbody_reports")
    .select("id,owner_id,report_date,file_name,file_type,storage_path,weight,skeletal_muscle_mass,body_fat_percentage,body_fat_mass,bmi,inbody_score,waist_hip_ratio,visceral_fat_level,metabolic_rate,segment_analysis,notes,created_at")
    .eq("owner_id", ownerId)
    .order("report_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapInBodyReport);
};

export const deleteInBodyReport = async (report: InBodyReport) => {
  if (!supabase) return;
  if (report.storagePath) {
    const { error: storageError } = await supabase.storage.from("inbody-reports").remove([report.storagePath]);
    if (storageError) throw storageError;
  }
  const { error: reportError } = await supabase.from("inbody_reports").delete().eq("id", report.id);
  if (reportError) throw reportError;
  await supabase.from("ai_reports").delete().contains("source_ids", [report.id]);
};

export const updateInBodyReportMetrics = async (
  reportId: string,
  patch: Pick<InBodyReport, "weight" | "skeletalMuscleMass" | "bodyFatPercentage" | "bodyFatMass" | "bmi" | "inbodyScore" | "waistHipRatio" | "visceralFatLevel" | "metabolicRate" | "notes">,
) => {
  if (!supabase) return;
  const { error } = await supabase
    .from("inbody_reports")
    .update({
      weight: patch.weight ?? null,
      skeletal_muscle_mass: patch.skeletalMuscleMass ?? null,
      body_fat_percentage: patch.bodyFatPercentage ?? null,
      body_fat_mass: patch.bodyFatMass ?? null,
      bmi: patch.bmi ?? null,
      inbody_score: patch.inbodyScore ?? null,
      waist_hip_ratio: patch.waistHipRatio ?? null,
      visceral_fat_level: patch.visceralFatLevel ?? null,
      metabolic_rate: patch.metabolicRate ?? null,
      notes: patch.notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId);
  if (error) throw error;
};

export const listAIReports = async (ownerId: string) => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ai_reports")
    .select("id,owner_id,report_type,title,summary,recommendations,visibility,source_ids,approved_program_change,created_at")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapAIReport);
};

export const saveAIReport = async (ownerId: string, report: AIInsightReport) => {
  if (!supabase) return report;
  const { data, error } = await supabase
    .from("ai_reports")
    .insert({
      owner_id: ownerId,
      created_by: (await getCurrentSession())?.user.id,
      report_type: report.reportType,
      title: report.title,
      summary: report.summary,
      recommendations: report.recommendations,
      visibility: report.visibility,
      source_ids: report.sourceIds,
      approved_program_change: report.approvedProgramChange ?? false,
    })
    .select("id,owner_id,report_type,title,summary,recommendations,visibility,source_ids,approved_program_change,created_at")
    .single();
  if (error) throw error;
  return mapAIReport(data);
};

const mapAIReport = (item: any): AIInsightReport => ({
  id: item.id,
  createdAt: item.created_at,
  reportType: item.report_type,
  title: item.title,
  summary: item.summary,
  recommendations: Array.isArray(item.recommendations) ? item.recommendations : [],
  visibility: item.visibility,
  sourceIds: Array.isArray(item.source_ids) ? item.source_ids : [],
  approvedProgramChange: item.approved_program_change,
});

const mapInBodyReport = (item: any): InBodyReport => ({
  id: item.id,
  ownerId: item.owner_id,
  uploadedAt: item.created_at,
  reportDate: item.report_date,
  fileName: item.file_name,
  fileType: item.file_type,
  storagePath: item.storage_path,
  weight: item.weight == null ? undefined : Number(item.weight),
  skeletalMuscleMass: item.skeletal_muscle_mass == null ? undefined : Number(item.skeletal_muscle_mass),
  bodyFatPercentage: item.body_fat_percentage == null ? undefined : Number(item.body_fat_percentage),
  bodyFatMass: item.body_fat_mass == null ? undefined : Number(item.body_fat_mass),
  bmi: item.bmi == null ? undefined : Number(item.bmi),
  inbodyScore: item.inbody_score == null ? undefined : Number(item.inbody_score),
  waistHipRatio: item.waist_hip_ratio == null ? undefined : Number(item.waist_hip_ratio),
  visceralFatLevel: item.visceral_fat_level == null ? undefined : Number(item.visceral_fat_level),
  metabolicRate: item.metabolic_rate == null ? undefined : Number(item.metabolic_rate),
  segmentAnalysis: item.segment_analysis?.notes,
  notes: item.notes ?? undefined,
});
