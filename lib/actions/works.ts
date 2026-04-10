"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthorProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseTags } from "@/lib/utils";
import { workSchema } from "@/lib/validation";

function buildWorkPayload(formData: FormData) {
  const featuredValue = formData.get("featured_flag");

  return workSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    genre: formData.get("genre"),
    tags: parseTags(String(formData.get("tags") ?? "")),
    excerptText: formData.get("excerpt_text"),
    coverImageUrl: formData.get("cover_image_url"),
    visibility: formData.get("visibility"),
    status: formData.get("status"),
    featuredFlag: featuredValue === "on" || featuredValue === "true",
  });
}

export async function createWorkAction(formData: FormData) {
  const { user } = await requireAuthorProfile();
  const parsed = buildWorkPayload(formData);

  if (!parsed.success) {
    redirect("/works/new?message=" + encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid work form."));
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("works")
    .insert({
      author_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      genre: parsed.data.genre,
      tags: parsed.data.tags,
      excerpt_text: parsed.data.excerptText,
      cover_image_url: parsed.data.coverImageUrl || null,
      visibility: parsed.data.visibility,
      status: parsed.data.status,
      featured_flag: parsed.data.featuredFlag,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect("/works/new?message=" + encodeURIComponent(error?.message ?? "Unable to create work."));
  }

  revalidatePath("/dashboard");
  revalidatePath("/browse");
  revalidatePath("/");
  redirect(`/works/${data.id}?message=${encodeURIComponent("Work saved successfully.")}`);
}

export async function updateWorkAction(formData: FormData) {
  const { user } = await requireAuthorProfile();
  const workId = String(formData.get("work_id") ?? "");
  const parsed = buildWorkPayload(formData);

  if (!workId) {
    redirect("/dashboard?message=" + encodeURIComponent("Missing work id."));
  }

  if (!parsed.success) {
    redirect(`/works/${workId}/edit?message=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid work form.")}`);
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("works")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      genre: parsed.data.genre,
      tags: parsed.data.tags,
      excerpt_text: parsed.data.excerptText,
      cover_image_url: parsed.data.coverImageUrl || null,
      visibility: parsed.data.visibility,
      status: parsed.data.status,
      featured_flag: parsed.data.featuredFlag,
      author_id: user.id,
    })
    .eq("id", workId)
    .eq("author_id", user.id);

  if (error) {
    redirect(`/works/${workId}/edit?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/works/${workId}`);
  revalidatePath("/dashboard");
  revalidatePath("/browse");
  revalidatePath("/");
  redirect(`/works/${workId}?message=${encodeURIComponent("Work updated successfully.")}`);
}
