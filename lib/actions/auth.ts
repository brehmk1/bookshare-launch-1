"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/env";
import { getPostAuthPath, getSignedInPath } from "@/lib/routing";
import { authSchema, loginSchema } from "@/lib/validation";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

export async function signUpAction(formData: FormData) {
  if (!getSupabaseEnv().configured) {
    redirect("/signup?message=" + encodeMessage("Add your Supabase environment variables to enable signup."));
  }

  const parsed = authSchema.safeParse({
    displayName: formData.get("display_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirect("/signup?message=" + encodeMessage(parsed.error.issues[0]?.message ?? "Invalid signup form."));
  }

  const supabase = createServerSupabaseClient();
  const origin = headers().get("origin");
  const draft = {
    draftTitle: String(formData.get("draft_title") ?? ""),
    draftGenre: String(formData.get("draft_genre") ?? ""),
    draftExcerpt: String(formData.get("draft_excerpt") ?? ""),
  };
  const postAuthPath = getPostAuthPath(parsed.data.role, draft);

  const { error, data } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
        role: parsed.data.role,
      },
      emailRedirectTo: origin ? `${origin}${postAuthPath}` : undefined,
    },
  });

  if (error) {
    redirect("/signup?message=" + encodeMessage(error.message));
  }

  if (data.user && !data.session) {
    redirect("/login?message=" + encodeMessage("Check your email to confirm your account, then log in."));
  }

  revalidatePath("/", "layout");
  redirect(postAuthPath);
}

export async function loginAction(formData: FormData) {
  if (!getSupabaseEnv().configured) {
    redirect("/login?message=" + encodeMessage("Add your Supabase environment variables to enable login."));
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/login?message=" + encodeMessage(parsed.error.issues[0]?.message ?? "Invalid login form."));
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    redirect("/login?message=" + encodeMessage(error.message));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: authoredWork } = user
    ? await supabase.from("works").select("id").eq("author_id", user.id).limit(1).maybeSingle()
    : { data: null };
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
    : { data: null };

  revalidatePath("/", "layout");
  redirect(getSignedInPath(profile?.role ?? "reader", Boolean(authoredWork?.id)));
}

export async function logoutAction() {
  if (getSupabaseEnv().configured) {
    const supabase = createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/");
}
