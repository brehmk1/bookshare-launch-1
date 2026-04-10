import { getDeviceName, getDevicePlatform, getOrCreateLocalDeviceId } from "../lib/device";
import { getDesktopEnv } from "../lib/env";
import { getDesktopSupabaseClient } from "../lib/supabase";
import type {
  DesktopClientRecord,
  DesktopConnectionSnapshot,
  DesktopPresenceState,
  DesktopSession,
  LinkFileRequest,
  WorkSummary,
} from "../types";

interface ProfileRecord {
  display_name: string | null;
  role: "author" | "reader" | "curator";
  user_id: string;
}

interface DesktopClientRow {
  created_at: string;
  device_name: string;
  id: string;
  last_heartbeat_at: string | null;
  online_status: "offline" | "online";
  platform: string;
  user_id: string;
}

interface WorkRow {
  author_id: string;
  genre: string;
  id: string;
  title: string;
}

function emptySession(message = "Sign in with an existing BookShare account to register desktop availability.") {
  return {
    authMode: "placeholder",
    email: "",
    notes: message,
    role: "author",
    userId: null,
  } satisfies DesktopSession;
}

function toDesktopClientRecord(record: DesktopClientRow): DesktopClientRecord {
  return {
    createdAt: record.created_at,
    deviceName: record.device_name,
    id: record.id,
    lastHeartbeatAt: record.last_heartbeat_at,
    onlineStatus: record.online_status,
    platform: record.platform,
    userId: record.user_id,
  };
}

export interface DesktopBackendService {
  connect(input: { email: string; password: string }): Promise<DesktopConnectionSnapshot>;
  disconnect(): Promise<DesktopSession>;
  getPresence(): Promise<DesktopPresenceState>;
  getSession(): Promise<DesktopSession>;
  listWorks(): Promise<WorkSummary[]>;
  registerLinkedFile(input: LinkFileRequest): Promise<{ detail: string }>;
  setAvailability(input: { availabilityStatus: "ready_later"; desktopClientId: string; fileFingerprint: string; lastSeenAt: string }): Promise<{ detail: string }>;
}

async function getProfile(userId: string) {
  const supabase = getDesktopSupabaseClient();
  const { data, error } = await supabase.from("profiles").select("display_name, role, user_id").eq("user_id", userId).maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as ProfileRecord | null;
}

async function ensureDesktopClient(userId: string) {
  const supabase = getDesktopSupabaseClient();
  const deviceName = getDeviceName();
  const platform = getDevicePlatform();
  const localDeviceId = getOrCreateLocalDeviceId();
  const registeredDeviceName = `${deviceName} ${localDeviceId.slice(0, 8)}`;

  const { data: existing, error: queryError } = await supabase
    .from("desktop_clients")
    .select("*")
    .eq("user_id", userId)
    .eq("device_name", registeredDeviceName)
    .maybeSingle();

  if (queryError) {
    throw queryError;
  }

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("desktop_clients")
      .update({
        last_heartbeat_at: new Date().toISOString(),
        online_status: "online",
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (updateError) {
      throw updateError;
    }

    return toDesktopClientRecord(updated as DesktopClientRow);
  }

  const { data: created, error: insertError } = await supabase
    .from("desktop_clients")
    .insert({
      device_name: registeredDeviceName,
      last_heartbeat_at: new Date().toISOString(),
      online_status: "online",
      platform,
      user_id: userId,
    })
    .select("*")
    .single();

  if (insertError) {
    throw insertError;
  }

  return toDesktopClientRecord(created as DesktopClientRow);
}

async function buildConnectedSession(email: string, userId: string) {
  const profile = await getProfile(userId);

  return {
    authMode: "connected",
    email,
    notes: profile
      ? `Connected to BookShare as ${profile.role}. Desktop registration and availability updates are live.`
      : "Connected to BookShare. Profile lookup returned no record yet.",
    role: profile?.role === "reader" ? "reader" : "author",
    userId,
  } satisfies DesktopSession;
}

export function createDesktopBackendService(): DesktopBackendService {
  const service: DesktopBackendService = {
    async connect({ email, password }) {
      const env = getDesktopEnv();

      if (env.backendMode === "mock" || !env.configured) {
        throw new Error("Desktop backend mode is not configured for Supabase. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      }

      const supabase = getDesktopSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        throw error ?? new Error("Unable to sign in to BookShare desktop.");
      }

      const [session, client, works] = await Promise.all([
        buildConnectedSession(data.user.email ?? email, data.user.id),
        ensureDesktopClient(data.user.id),
        service.listWorks(),
      ]);

      return {
        client,
        session,
        works,
      };
    },

    async disconnect() {
      const env = getDesktopEnv();

      if (!env.configured) {
        return emptySession();
      }

      const supabase = getDesktopSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const localDeviceId = getOrCreateLocalDeviceId();
        const registeredDeviceName = `${getDeviceName()} ${localDeviceId.slice(0, 8)}`;

        await supabase
          .from("desktop_clients")
          .update({
            last_heartbeat_at: new Date().toISOString(),
            online_status: "offline",
          })
          .eq("user_id", user.id)
          .eq("device_name", registeredDeviceName);
      }

      await supabase.auth.signOut();
      return emptySession();
    },

    async getSession() {
      const env = getDesktopEnv();

      if (!env.configured || env.backendMode === "mock") {
        return emptySession("Desktop backend mode is mock or env vars are missing.");
      }

      const supabase = getDesktopSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return emptySession();
      }

      return buildConnectedSession(session.user.email ?? "", session.user.id);
    },

    async getPresence() {
      const session = await service.getSession();

      if (!session.userId) {
        return {
          client: null,
          detail: "Not connected to BookShare desktop yet.",
          status: "not_connected",
        } satisfies DesktopPresenceState;
      }

      const client = await ensureDesktopClient(session.userId);
      return {
        client,
        detail: `Desktop client ${client.deviceName} is registered and online.`,
        status: "connected",
      } satisfies DesktopPresenceState;
    },

    async listWorks() {
      const env = getDesktopEnv();

      if (!env.configured || env.backendMode === "mock") {
        return [] as WorkSummary[];
      }

      const supabase = getDesktopSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return [] as WorkSummary[];
      }

      const profile = await getProfile(user.id);

      if (profile?.role === "reader") {
        return [] as WorkSummary[];
      }

      const { data, error } = await supabase
        .from("works")
        .select("id, title, genre, author_id")
        .eq("author_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      return ((data ?? []) as WorkRow[]).map((work) => ({
        authorName: profile?.display_name ?? null,
        genre: work.genre,
        id: work.id,
        title: work.title,
      }));
    },

    async registerLinkedFile(input) {
      const supabase = getDesktopSupabaseClient();

      const { data, error } = await supabase
        .from("work_files")
        .upsert(
          {
            availability_status: input.availabilityStatus,
            desktop_client_id: input.desktopClientId,
            file_fingerprint: input.fileFingerprint,
            file_size: input.size,
            last_seen_at: input.lastSeenAt,
            local_file_name: input.localFileName,
            mime_type: input.mimeType,
            work_id: input.workId,
          },
          {
            onConflict: "file_fingerprint,desktop_client_id",
          },
        )
        .select("id")
        .single();

      if (error || !data) {
        throw error ?? new Error("Unable to register the selected local file.");
      }

      return {
        detail: `Registered ${input.localFileName} to BookShare work ${input.workId}.`,
      };
    },

    async setAvailability({ availabilityStatus, desktopClientId, fileFingerprint, lastSeenAt }) {
      const supabase = getDesktopSupabaseClient();
      const { error } = await supabase
        .from("work_files")
        .update({
          availability_status: availabilityStatus,
          last_seen_at: lastSeenAt,
        })
        .eq("desktop_client_id", desktopClientId)
        .eq("file_fingerprint", fileFingerprint);

      if (error) {
        throw error;
      }

      return {
        detail: "Availability status updated in BookShare.",
      };
    }
  };

  return service;
}
