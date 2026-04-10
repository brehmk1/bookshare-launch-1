export interface DesktopEnv {
  anonKey: string;
  backendMode: "mock" | "supabase";
  configured: boolean;
  url: string;
}

export function getDesktopEnv(): DesktopEnv {
  const url = import.meta.env.VITE_SUPABASE_URL ?? "";
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
  const backendMode = import.meta.env.VITE_BOOKSHARE_BACKEND_MODE === "mock" ? "mock" : "supabase";

  return {
    anonKey,
    backendMode,
    configured: Boolean(url && anonKey),
    url,
  };
}
