import Link from "next/link";
import { ConfigNotice } from "@/components/config-notice";
import { MessageBanner } from "@/components/message-banner";
import { getSupabaseEnv } from "@/lib/env";
import { getPublishedWorks } from "@/lib/queries";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams?: { message?: string };
}) {
  const works = await getPublishedWorks();

  return (
    <main className="section">
      <MessageBanner message={searchParams?.message} />
      <div className="container page-head">
        <div>
          <p className="section-kicker">Browse works</p>
          <h1>Discover new writing without ad clutter.</h1>
          <p>Browse published listings, read excerpts, and request access directly from the author.</p>
        </div>
      </div>

      <section className="container">
        {!getSupabaseEnv().configured ? (
          <ConfigNotice />
        ) : works.length ? (
          <div className="listing-grid">
            {works.map((work) => (
              <article key={work.id} className="listing-card">
                <div className="listing-card-top">
                  <span className="pill">{work.genre}</span>
                  {work.featured_flag ? <span className="pill pill-accent">Featured</span> : null}
                </div>
                <h2>{work.title}</h2>
                <p className="card-meta">By {work.author_name ?? "BookShare author"}</p>
                <p>{work.description}</p>
                <div className="tag-row compact">
                  {work.tags.slice(0, 4).map((tag: string) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <Link href={`/works/${work.id}`} className="text-link">
                  Open work
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-panel">
            <h2>No published works yet</h2>
            <p>Once authors start posting, this browse view will populate with metadata-rich listings and excerpts.</p>
          </div>
        )}
      </section>
    </main>
  );
}
