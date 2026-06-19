import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:sh.almarhoun@gmail.com";
const ownerEmail = "sh.almarhoun@gmail.com";

const json = (response, status, body) => {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
};

const readBody = async (request) => {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") return JSON.parse(request.body);

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
};

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { message: "Method not allowed." });
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json(response, 500, { message: "Supabase server environment is not configured." });
  }
  if (!vapidPublicKey || !vapidPrivateKey) {
    return json(response, 500, { message: "Push notification environment is not configured." });
  }

  const token = request.headers.authorization?.replace("Bearer ", "");
  if (!token) return json(response, 401, { message: "Owner session is required." });

  const publicClient = createClient(supabaseUrl, anonKey);
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: authData, error: authError } = await publicClient.auth.getUser(token);
  const user = authData?.user;
  if (authError || !user) return json(response, 401, { message: "Invalid session." });

  const { data: profile, error: profileError } = await serviceClient
    .from("profiles")
    .select("id,email,role,assigned_owner_id,disabled_at")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) return json(response, 500, { message: profileError.message });

  const isOwner = profile?.role === "owner" || user.email?.toLowerCase() === ownerEmail;
  if (!isOwner || profile?.disabled_at) return json(response, 403, { message: "Only the owner can send workout finish notifications." });

  const body = await readBody(request).catch(() => null);
  const session = body?.session;
  if (!session?.id || !session?.title || !session?.completedAt) {
    return json(response, 400, { message: "Workout session details are required." });
  }

  const { data: subscriptions, error: subscriptionError } = await serviceClient
    .from("push_subscriptions")
    .select("id,user_id,subscription,role,enabled")
    .eq("owner_id", user.id)
    .eq("enabled", true)
    .in("role", ["admin", "coach"]);
  if (subscriptionError) return json(response, 500, { message: subscriptionError.message });

  if (!subscriptions?.length) return json(response, 200, { message: "No coach devices are subscribed yet.", sent: 0 });

  const userIds = [...new Set(subscriptions.map((item) => item.user_id).filter(Boolean))];
  const { data: activePermissions, error: permissionError } = await serviceClient
    .from("user_permissions")
    .select("user_id,role,can_view_logs,disabled_at,revoked_at")
    .eq("owner_id", user.id)
    .in("user_id", userIds);
  if (permissionError) return json(response, 500, { message: permissionError.message });

  const activeRecipientIds = new Set(
    (activePermissions ?? [])
      .filter((permission) => ["admin", "coach"].includes(permission.role))
      .filter((permission) => permission.can_view_logs && !permission.disabled_at && !permission.revoked_at)
      .map((permission) => permission.user_id),
  );
  const recipients = subscriptions.filter((item) => activeRecipientIds.has(item.user_id));
  if (!recipients.length) return json(response, 200, { message: "No active coach devices are subscribed yet.", sent: 0 });

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const durationMinutes = session.durationSeconds ? Math.max(1, Math.round(session.durationSeconds / 60)) : null;
  const payload = JSON.stringify({
    title: "FITNESS SM",
    body: `${user.email ?? "Owner"} finished ${session.title}${durationMinutes ? ` in ${durationMinutes} min` : ""}. Tap to review history.`,
    url: `${request.headers["x-forwarded-proto"] || "https"}://${request.headers.host || "fitness-sm-app.vercel.app"}/`,
    tag: `workout-${session.id}`,
    sessionId: session.id,
  });

  const results = await Promise.allSettled(
    recipients.map((item) =>
      webpush.sendNotification(item.subscription, payload).catch(async (error) => {
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await serviceClient.from("push_subscriptions").update({ enabled: false, updated_at: new Date().toISOString() }).eq("id", item.id);
        }
        throw error;
      }),
    ),
  );

  const sent = results.filter((result) => result.status === "fulfilled").length;
  const failed = results.length - sent;
  return json(response, 200, { message: "Workout notification processed.", sent, failed });
}
