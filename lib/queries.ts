import { unstable_noStore as noStore } from "next/cache";
import type { RequestRow, WorkRow, ProfileRow, FeaturedSlotRow } from "@/types/database";
import { getSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface WorkWithAuthor extends WorkRow {
  author_name: string | null;
}

export interface RequestWithWork extends RequestRow {
  work: Pick<WorkRow, "id" | "title" | "genre"> | null;
  counterparty_name: string | null;
}

async function getProfilesByUserIds(userIds: string[]) {
  noStore();

  if (!userIds.length || !getSupabaseEnv().configured) {
    return new Map<string, ProfileRow>();
  }

  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("profiles").select("*").in("user_id", userIds);

  return new Map((data ?? []).map((profile) => [profile.user_id, profile]));
}

export async function getFeaturedWorks(limit = 4) {
  noStore();

  if (!getSupabaseEnv().configured) {
    return [] as WorkRow[];
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from("works")
      .select("*")
      .eq("visibility", "public")
      .eq("status", "published")
      .eq("featured_flag", true)
      .order("updated_at", { ascending: false })
      .limit(limit);

    return data ?? [];
  } catch {
    return [] as WorkRow[];
  }
}

export async function getPublishedWorks() {
  noStore();

  if (!getSupabaseEnv().configured) {
    return [] as WorkWithAuthor[];
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from("works")
      .select("*")
      .eq("visibility", "public")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    const works = data ?? [];
    const profiles = await getProfilesByUserIds([...new Set(works.map((work) => work.author_id))]);

    return works.map((work) => ({
      ...work,
      author_name: profiles.get(work.author_id)?.display_name ?? null,
    }));
  } catch {
    return [] as WorkWithAuthor[];
  }
}

export async function getWorkById(id: string) {
  noStore();

  if (!getSupabaseEnv().configured) {
    return null as WorkWithAuthor | null;
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase.from("works").select("*").eq("id", id).maybeSingle();

    if (!data) {
      return null;
    }

    const profiles = await getProfilesByUserIds([data.author_id]);

    return {
      ...data,
      author_name: profiles.get(data.author_id)?.display_name ?? null,
    };
  } catch {
    return null;
  }
}

export async function getAuthorWorks(authorId: string) {
  noStore();

  if (!getSupabaseEnv().configured) {
    return [] as WorkRow[];
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase.from("works").select("*").eq("author_id", authorId).order("updated_at", { ascending: false });
    return data ?? [];
  } catch {
    return [] as WorkRow[];
  }
}

export async function authorHasWorks(authorId: string) {
  noStore();

  if (!getSupabaseEnv().configured) {
    return false;
  }

  try {
    const supabase = createServerSupabaseClient();
    const { count } = await supabase
      .from("works")
      .select("id", { count: "exact", head: true })
      .eq("author_id", authorId);

    return Boolean(count && count > 0);
  } catch {
    return false;
  }
}

export async function getRequestsForUser(userId: string) {
  noStore();

  if (!getSupabaseEnv().configured) {
    return {
      incoming: [] as RequestWithWork[],
      outgoing: [] as RequestWithWork[],
    };
  }

  try {
    const supabase = createServerSupabaseClient();
    const [{ data: incoming }, { data: outgoing }, { data: works }] = await Promise.all([
      supabase.from("requests").select("*").eq("author_id", userId).order("created_at", { ascending: false }),
      supabase.from("requests").select("*").eq("reader_id", userId).order("created_at", { ascending: false }),
      supabase.from("works").select("id, title, genre"),
    ]);

    const workMap = new Map((works ?? []).map((work) => [work.id, work]));
    const otherUserIds = [
      ...new Set([
        ...(incoming ?? []).map((request) => request.reader_id),
        ...(outgoing ?? []).map((request) => request.author_id),
      ]),
    ];
    const profiles = await getProfilesByUserIds(otherUserIds);

    return {
      incoming: (incoming ?? []).map((request) => ({
        ...request,
        work: workMap.get(request.work_id) ?? null,
        counterparty_name: profiles.get(request.reader_id)?.display_name ?? null,
      })),
      outgoing: (outgoing ?? []).map((request) => ({
        ...request,
        work: workMap.get(request.work_id) ?? null,
        counterparty_name: profiles.get(request.author_id)?.display_name ?? null,
      })),
    };
  } catch {
    return {
      incoming: [] as RequestWithWork[],
      outgoing: [] as RequestWithWork[],
    };
  }
}

export async function getFeaturedSlots() {
  noStore();

  if (!getSupabaseEnv().configured) {
    return [] as FeaturedSlotRow[];
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase.from("featured_slots").select("*").order("start_at", { ascending: true });
    return data ?? [];
  } catch {
    return [] as FeaturedSlotRow[];
  }
}
