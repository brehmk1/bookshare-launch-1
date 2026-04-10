"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createBrowserSupabaseClient() {
  if (browserClient) {
    return browserClient;
  }

  const env = getSupabaseEnv();

  if (!env.configured) {
    throw new Error("Supabase environment variables are not configured.");
  }

  browserClient = createBrowserClient(env.url, env.anonKey);

  return browserClient;
}
