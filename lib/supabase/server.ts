import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { assertSupabaseConfigured } from "@/lib/supabase/shared";

export function createServerSupabaseClient() {
  const env = assertSupabaseConfigured();
  const cookieStore = cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...(options ?? {}) });
          });
        } catch {
          // Server components can read cookies during render, but writes only work in actions and handlers.
        }
      },
    },
  });
}
