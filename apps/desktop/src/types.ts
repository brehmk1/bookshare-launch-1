export type DesktopAuthMode = "placeholder" | "connected";
export type PresenceStatus = "not_connected" | "connected" | "file_linked" | "available_later";
export type OnlineStatus = "offline" | "online";
export type AvailabilityStatus = "unlinked" | "linked" | "ready_later";

export interface DesktopSession {
  authMode: DesktopAuthMode;
  email: string;
  notes: string;
  role: "author" | "reader";
  userId: string | null;
}

export interface DesktopClientRecord {
  createdAt: string;
  deviceName: string;
  id: string;
  lastHeartbeatAt: string | null;
  onlineStatus: OnlineStatus;
  platform: string;
  userId: string | null;
}

export interface LocalFileRecord {
  availabilityStatus: AvailabilityStatus;
  extension: string;
  file: File;
  fingerprint: string;
  id: string;
  lastModified: string;
  linkedWorkId: string | null;
  linkedWorkTitle: string | null;
  mimeType: string;
  relativePath: string;
  size: number;
}

export interface WorkSummary {
  id: string;
  title: string;
  genre: string;
  authorName?: string | null;
}

export interface LinkFileRequest {
  availabilityStatus: AvailabilityStatus;
  desktopClientId: string;
  fileFingerprint: string;
  lastSeenAt: string;
  localFileName: string;
  mimeType: string;
  size: number;
  workId: string;
}

export interface DesktopPresenceState {
  client: DesktopClientRecord | null;
  detail: string;
  status: PresenceStatus;
}

export interface DesktopConnectionSnapshot {
  client: DesktopClientRecord | null;
  session: DesktopSession;
  works: WorkSummary[];
}
