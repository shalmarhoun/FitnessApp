import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

  const token = request.headers.authorization?.replace("Bearer ", "");
  if (!token) return json(response, 401, { message: "Signed-in account is required." });

  const publicClient = createClient(supabaseUrl, anonKey);
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: authData, error: authError } = await publicClient.auth.getUser(token);
  const user = authData?.user;
  if (authError || !user) return json(response, 401, { message: "Invalid session." });

  const body = await readBody(request).catch(() => null);
  const subscription = body?.subscription;
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return json(response, 400, { message: "A valid push subscription is required." });
  }

  const { data: profile, error: profileError } = await serviceClient
    .from("profiles")
    .select("id,email,role,assigned_owner_id,disabled_at")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) return json(response, 500, { message: profileError.message });

  const normalizedEmail = user.email?.toLowerCase() ?? "";
  const role = normalizedEmail === ownerEmail ? "owner" : profile?.role;
  if (!role || profile?.disabled_at) return json(response, 403, { message: "This account cannot receive notifications." });
  if (!["owner", "admin", "coach"].includes(role)) {
    return json(response, 403, { message: "Only owner, admin, and coach accounts can receive phone notifications." });
  }

  const ownerId = role === "owner" ? user.id : profile?.assigned_owner_id;
  if (!ownerId) return json(response, 403, { message: "No owner is assigned to this account." });

  const { error } = await serviceClient.from("push_subscriptions").upsert(
    {
      owner_id: ownerId,
      user_id: user.id,
      role,
      endpoint: subscription.endpoint,
      subscription,
      user_agent: request.headers["user-agent"] ?? null,
      enabled: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );
  if (error) return json(response, 500, { message: error.message });

  return json(response, 200, { message: "Phone notifications are enabled." });
}
