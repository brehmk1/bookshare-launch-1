import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import type { ProfileRole, ProfileRow } from "@/types/database";
import { getSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCurrentSession() {
  noStore();

  if (!getSupabaseEnv().configured) {
    return null;
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?message=Please%20log%20in%20to%20continue.");
  }

  return user;
}

export async function getCurrentProfile() {
  noStore();

  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (data ?? null) as ProfileRow | null;
}

export async function requireAuthorProfile() {
  const [user, profile] = await Promise.all([requireUser(), getCurrentProfile()]);

  if (!profile || (profile.role !== "author" && profile.role !== "curator")) {
    redirect("/browse?message=Author%20access%20is%20required%20to%20create%20or%20edit%20works.");
  }

  return { user, profile };
}

export function getRoleLabel(role: ProfileRole | null | undefined) {
  if (role === "author") {
    return "author";
  }

  if (role === "curator") {
    return "curator";
  }

  return "reader";
}
