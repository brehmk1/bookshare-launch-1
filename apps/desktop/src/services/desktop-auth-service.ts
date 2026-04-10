import type { DesktopSession } from "../types";

export interface DesktopAuthService {
  connect(input: Omit<DesktopSession, "authMode">): Promise<DesktopSession>;
  disconnect(): Promise<DesktopSession>;
  getSession(): Promise<DesktopSession>;
}

const initialSession: DesktopSession = {
  authMode: "placeholder",
  email: "",
  notes: "Supabase desktop auth is not connected yet. This is a local scaffold only.",
  role: "author",
};

export function createDesktopAuthService(): DesktopAuthService {
  let currentSession = initialSession;

  return {
    async connect(input) {
      currentSession = {
        ...input,
        authMode: "connected",
        notes: "Local scaffold session only. Replace this service with real Supabase auth in Workstream 2B.",
      };

      return currentSession;
    },
    async disconnect() {
      currentSession = initialSession;
      return currentSession;
    },
    async getSession() {
      return currentSession;
    },
  };
}
