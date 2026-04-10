import { getSupabaseEnv } from "@/lib/env";

export function assertSupabaseConfigured() {
  const env = getSupabaseEnv();

  if (!env.configured) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return env;
}
