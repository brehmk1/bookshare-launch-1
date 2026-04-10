import { createClient } from "@supabase/supabase-js";
import { getDesktopEnv } from "./env";

let client: ReturnType<typeof createClient> | null = null;

export function getDesktopSupabaseClient() {
  const env = getDesktopEnv();

  if (!env.configured) {
    throw new Error("Desktop Supabase env vars are not configured.");
  }

  if (client) {
    return client;
  }

  client = createClient(env.url, env.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}
