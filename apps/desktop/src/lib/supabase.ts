import { createClient } from "@supabase/supabase-js";
import { getDesktopEnv } from "./env";

interface DesktopDatabase {
  public: {
    Tables: {
      desktop_clients: {
        Row: {
          created_at: string;
          device_name: string;
          id: string;
          last_heartbeat_at: string | null;
          online_status: "offline" | "online";
          platform: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          device_name: string;
          id?: string;
          last_heartbeat_at?: string | null;
          online_status?: "offline" | "online";
          platform: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          device_name?: string;
          id?: string;
          last_heartbeat_at?: string | null;
          online_status?: "offline" | "online";
          platform?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          display_name: string | null;
          role: "author" | "reader" | "curator";
          user_id: string;
        };
        Insert: {
          display_name?: string | null;
          role?: "author" | "reader" | "curator";
          user_id: string;
        };
        Update: {
          display_name?: string | null;
          role?: "author" | "reader" | "curator";
          user_id?: string;
        };
        Relationships: [];
      };
      work_files: {
        Row: {
          availability_status: "unlinked" | "linked" | "ready_later";
          created_at: string;
          desktop_client_id: string;
          file_fingerprint: string;
          file_size: number;
          id: string;
          last_seen_at: string | null;
          local_file_name: string;
          mime_type: string;
          work_id: string;
        };
        Insert: {
          availability_status?: "unlinked" | "linked" | "ready_later";
          created_at?: string;
          desktop_client_id: string;
          file_fingerprint: string;
          file_size: number;
          id?: string;
          last_seen_at?: string | null;
          local_file_name: string;
          mime_type: string;
          work_id: string;
        };
        Update: {
          availability_status?: "unlinked" | "linked" | "ready_later";
          created_at?: string;
          desktop_client_id?: string;
          file_fingerprint?: string;
          file_size?: number;
          id?: string;
          last_seen_at?: string | null;
          local_file_name?: string;
          mime_type?: string;
          work_id?: string;
        };
        Relationships: [];
      };
      works: {
        Row: {
          author_id: string;
          genre: string;
          id: string;
          title: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

let client: ReturnType<typeof createClient<DesktopDatabase>> | null = null;

export function getDesktopSupabaseClient() {
  const env = getDesktopEnv();

  if (!env.configured) {
    throw new Error("Desktop Supabase env vars are not configured.");
  }

  if (client) {
    return client;
  }

  client = createClient<DesktopDatabase>(env.url, env.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}
