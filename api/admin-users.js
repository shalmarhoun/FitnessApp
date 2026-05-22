import { createClient } from "@supabase/supabase-js";

const ownerEmail = "sh.almarhoun@gmail.com";
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const json = (response, status, body) => {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
};

const readBody = async (request) => {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") return JSON.parse(request.body);

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
};

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return json(response, 405, { message: "Method not allowed." });
  }

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json(response, 500, { message: "Supabase server environment is not configured." });
  }

  const token = request.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return json(response, 401, { message: "Owner session is required." });
  }

  const publicClient = createClient(supabaseUrl, anonKey);
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: authData, error: authError } = await publicClient.auth.getUser(token);
  const owner = authData?.user;
  if (authError || !owner || owner.email?.toLowerCase() !== ownerEmail) {
    return json(response, 403, { message: "Only the owner can create accounts." });
  }

  const body = await readBody(request).catch(() => null);
  if (!body) {
    return json(response, 400, { message: "Invalid JSON body." });
  }

  const { email, password, role } = body;
  const normalizedEmail = String(email ?? "").toLowerCase().trim();
  const normalizedRole = role === "viewer" ? "viewer" : role === "coach" ? "coach" : null;

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return json(response, 400, { message: "A valid email is required." });
  }

  if (!password || String(password).length < 6) {
    return json(response, 400, { message: "Password must be at least 6 characters." });
  }

  if (!normalizedRole) {
    return json(response, 400, { message: "Role must be coach or viewer." });
  }

  const { data: existingUsers, error: listError } = await serviceClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) {
    return json(response, 500, { message: listError.message });
  }

  const existingUser = existingUsers.users.find((user) => user.email?.toLowerCase() === normalizedEmail);
  const userResult = existingUser
    ? await serviceClient.auth.admin.updateUserById(existingUser.id, {
        password: String(password),
        email_confirm: true,
        user_metadata: { role: normalizedRole },
      })
    : await serviceClient.auth.admin.createUser({
        email: normalizedEmail,
        password: String(password),
        email_confirm: true,
        user_metadata: { role: normalizedRole },
      });

  if (userResult.error || !userResult.data.user) {
    return json(response, 500, { message: userResult.error?.message ?? "Unable to create account." });
  }

  const invitedUser = userResult.data.user;
  const { error: profileError } = await serviceClient.from("profiles").upsert(
    [
      { id: owner.id, email: owner.email?.toLowerCase(), role: "owner" },
      { id: invitedUser.id, email: normalizedEmail, role: normalizedRole },
    ],
    { onConflict: "id" },
  );
  if (profileError) {
    return json(response, 500, { message: profileError.message });
  }

  const { error: permissionError } = await serviceClient.from("user_permissions").upsert(
    {
      owner_id: owner.id,
      user_id: invitedUser.id,
      email: normalizedEmail,
      role: normalizedRole,
      can_view_logs: true,
      can_edit_program: normalizedRole === "coach",
      can_view_measurements: normalizedRole === "coach",
      can_add_notes: normalizedRole === "coach",
    },
    { onConflict: "owner_id,email" },
  );
  if (permissionError) {
    return json(response, 500, { message: permissionError.message });
  }

  return json(response, 200, { message: "Account created.", email: normalizedEmail, role: normalizedRole });
}
