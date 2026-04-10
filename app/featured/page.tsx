import Link from "next/link";
import { MessageBanner } from "@/components/message-banner";
import { formatDate } from "@/lib/utils";
import { getFeaturedSlots, getFeaturedWorks } from "@/lib/queries";

export default async function FeaturedPage({
  searchParams,
}: {
  searchParams?: { message?: string };
}) {
  const [featuredWorks, featuredSlots] = await Promise.all([getFeaturedWorks(12), getFeaturedSlots()]);

  return (
    <main className="section">
      <MessageBanner message={searchParams?.message} />
      <div className="container page-head">
        <div>
          <p className="section-kicker">Featured books</p>
          <h1>Highlighted work and promotion-ready listings.</h1>
          <p>
            This page surfaces promoted works now and leaves room for fuller curation workflows through `featured_slots`.
          </p>
        </div>
      </div>

      <section className="container section-stack">
        <div className="listing-grid">
          {featuredWorks.map((work) => (
            <article key={work.id} className="listing-card">
              <span className="pill pill-accent">{work.genre}</span>
              <h2>{work.title}</h2>
              <p>{work.description}</p>
              <Link href={`/works/${work.id}`} className="text-link">
                Open work
              </Link>
            </article>
          ))}
        </div>

        <div className="surface-card">
          <h2>Featured slots</h2>
          <p>Slot data is included in the schema so curation can become more structured without reworking the core app.</p>
          {featuredSlots.length ? (
            <div className="stack-list">
              {featuredSlots.map((slot) => (
                <div key={slot.id} className="subtle-card">
                  <strong>{slot.slot_type}</strong>
                  <p>
                    {formatDate(slot.start_at)} to {formatDate(slot.end_at)}
                  </p>
                  <p>{slot.curator_notes || "No curator note yet."}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No featured slots are scheduled yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
