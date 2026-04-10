"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requestResponseSchema, requestSchema } from "@/lib/validation";

export async function createRequestAction(formData: FormData) {
  const user = await requireUser();
  const parsed = requestSchema.safeParse({
    workId: formData.get("work_id"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    redirect("/browse?message=" + encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid request form."));
  }

  const supabase = createServerSupabaseClient();
  const { data: work, error: workError } = await supabase
    .from("works")
    .select("id, author_id, title")
    .eq("id", parsed.data.workId)
    .maybeSingle();

  if (workError || !work) {
    redirect("/browse?message=" + encodeURIComponent(workError?.message ?? "Work not found."));
  }

  if (work.author_id === user.id) {
    redirect(`/works/${work.id}?message=${encodeURIComponent("You cannot request your own work.")}`);
  }

  const { data: existing } = await supabase
    .from("requests")
    .select("id, status")
    .eq("work_id", work.id)
    .eq("reader_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing && existing.status === "pending") {
    redirect(`/works/${work.id}?message=${encodeURIComponent("You already have a pending request for this work.")}`);
  }

  const { error } = await supabase.from("requests").insert({
    work_id: work.id,
    reader_id: user.id,
    author_id: work.author_id,
    message: parsed.data.message || null,
  });

  if (error) {
    redirect(`/works/${work.id}?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/works/${work.id}`);
  revalidatePath("/requests");
  revalidatePath("/dashboard");
  redirect(`/works/${work.id}?message=${encodeURIComponent("Request sent to the author.")}`);
}

export async function respondToRequestAction(formData: FormData) {
  const user = await requireUser();
  const parsed = requestResponseSchema.safeParse({
    requestId: formData.get("request_id"),
    status: formData.get("status"),
    responseMessage: formData.get("response_message"),
  });

  if (!parsed.success) {
    redirect("/requests?message=" + encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid response form."));
  }

  const supabase = createServerSupabaseClient();
  const { data: request, error: requestError } = await supabase
    .from("requests")
    .select("id, author_id, work_id")
    .eq("id", parsed.data.requestId)
    .maybeSingle();

  if (requestError || !request) {
    redirect("/requests?message=" + encodeURIComponent(requestError?.message ?? "Request not found."));
  }

  if (request.author_id !== user.id) {
    redirect("/requests?message=" + encodeURIComponent("Only the author can respond to this request."));
  }

  const { error } = await supabase
    .from("requests")
    .update({
      status: parsed.data.status,
      response_message: parsed.data.responseMessage || null,
    })
    .eq("id", request.id)
    .eq("author_id", user.id);

  if (error) {
    redirect("/requests?message=" + encodeURIComponent(error.message));
  }

  revalidatePath("/requests");
  revalidatePath("/dashboard");
  revalidatePath(`/works/${request.work_id}`);
  redirect("/requests?message=" + encodeURIComponent(`Request ${parsed.data.status}.`));
}
