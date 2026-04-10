import { ConfigNotice } from "@/components/config-notice";
import { LandingPage } from "@/components/landing-page";
import { MessageBanner } from "@/components/message-banner";
import { getCurrentProfile } from "@/lib/auth";
import { getSupabaseEnv } from "@/lib/env";
import { authorHasWorks, getFeaturedWorks } from "@/lib/queries";
import { getSignedInPath } from "@/lib/routing";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { message?: string };
}) {
  const [featuredWorks, profile] = await Promise.all([getFeaturedWorks(), getCurrentProfile()]);
  const hasWorks = profile?.role === "author" ? await authorHasWorks(profile.user_id) : false;
  const primaryCtaHref = profile ? getSignedInPath(profile.role, hasWorks) : "/signup";
  const primaryCtaLabel =
    profile?.role === "author"
      ? hasWorks
        ? "Open your dashboard"
        : "Create your first work"
      : profile?.role === "reader"
        ? "Browse stories"
        : "Start posting free";

  return (
    <main>
      <MessageBanner message={searchParams?.message} />
      {!getSupabaseEnv().configured ? (
        <section className="section container">
          <ConfigNotice />
        </section>
      ) : null}
      <LandingPage
        featuredWorks={featuredWorks}
        primaryCtaHref={primaryCtaHref}
        primaryCtaLabel={primaryCtaLabel}
        profileRole={profile?.role ?? null}
      />
    </main>
  );
}
