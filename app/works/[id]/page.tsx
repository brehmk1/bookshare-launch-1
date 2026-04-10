import Link from "next/link";
import { MessageBanner } from "@/components/message-banner";
import { RequestAccessForm } from "@/components/request-access-form";
import { getCurrentUser } from "@/lib/auth";
import { getWorkById } from "@/lib/queries";

export default async function WorkDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { message?: string };
}) {
  const [work, user] = await Promise.all([getWorkById(params.id), getCurrentUser()]);

  if (!work) {
    return (
      <main className="section">
        <MessageBanner message={searchParams?.message} />
        <div className="container empty-panel">
          <h1>Work not found</h1>
          <p>This listing may not exist yet, or Supabase is not configured.</p>
        </div>
      </main>
    );
  }

  const isAuthor = user?.id === work.author_id;

  return (
    <main className="section">
      <MessageBanner message={searchParams?.message} />
      <div className="container work-hero">
        <div className="work-main">
          <div className="listing-card-top">
            <span className="pill">{work.genre}</span>
            {work.featured_flag ? <span className="pill pill-accent">Featured</span> : null}
          </div>
          <h1>{work.title}</h1>
          <p className="card-meta">By {work.author_name ?? "BookShare author"}</p>
          <p className="lead-copy">{work.description}</p>
          <div className="tag-row compact">
            {work.tags.map((tag: string) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>

        <aside className="surface-card">
          <h2>Access workflow</h2>
          <p>This phase stores metadata and excerpt text only. Access is request-based and author-controlled.</p>
          {isAuthor ? (
            <div className="hero-actions">
              <Link href={`/works/${work.id}/edit`} className="primary-button">
                Edit work
              </Link>
              <Link href="/requests" className="secondary-button">
                Manage requests
              </Link>
            </div>
          ) : user ? (
            <RequestAccessForm workId={work.id} />
          ) : (
            <div className="hero-actions">
              <Link href="/login" className="primary-button">
                Log in to request
              </Link>
              <Link href="/signup" className="secondary-button">
                Create account
              </Link>
            </div>
          )}
        </aside>
      </div>

      <section className="container section-stack">
        <article className="surface-card">
          <h2>Excerpt</h2>
          <p className="excerpt-block">{work.excerpt_text}</p>
        </article>

        <article className="surface-card">
          <h2>Listing details</h2>
          <div className="stack-list">
            <div className="subtle-card">
              <strong>Status</strong>
              <p>{work.status}</p>
            </div>
            <div className="subtle-card">
              <strong>Visibility</strong>
              <p>{work.visibility}</p>
            </div>
            <div className="subtle-card">
              <strong>Cover image URL</strong>
              <p>{work.cover_image_url || "No cover URL added."}</p>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
