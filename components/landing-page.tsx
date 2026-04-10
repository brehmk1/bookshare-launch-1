import Link from "next/link";
import type { ProfileRole, WorkRow } from "@/types/database";

const reversals = [
  {
    complaint: "Too many ads",
    answer: "No ads. No interruptions. No clutter between readers and writing.",
  },
  {
    complaint: "Discovery feels rigged",
    answer: "Transparent discovery through new, trending, most requested, and hidden gems.",
  },
  {
    complaint: "Community tools got weaker",
    answer: "Human connection stays, with structured requests and safer author-reader interaction.",
  },
  {
    complaint: "Everything pushes monetization",
    answer: "Free to join. Free to post. Free to read. Revenue comes later, after value exists.",
  },
];

const steps = [
  {
    title: "Create your page",
    text: "Set up your author profile in minutes and build a public home for your work.",
  },
  {
    title: "Post your writing",
    text: "Add title, description, tags, genre, and an excerpt. Keep the manuscript itself in your control.",
  },
  {
    title: "Build momentum",
    text: "Readers browse, request access, and help surface the work that deserves attention.",
  },
];

const features = [
  "Ad-free reading experience",
  "Free posting for authors",
  "Transparent discovery instead of black-box feeds",
  "Request-based author control",
  "Featured promotion support",
  "Ready for future desktop delivery without storing manuscripts here",
];

interface LandingPageProps {
  primaryCtaHref: string;
  primaryCtaLabel: string;
  profileRole: ProfileRole | null;
  featuredWorks: WorkRow[];
}

export function LandingPage({ featuredWorks, primaryCtaHref, primaryCtaLabel, profileRole }: LandingPageProps) {
  const showLaunchForm = !profileRole;

  return (
    <>
      <section className="hero-section container">
        <div className="hero-copy">
          <div className="eyebrow">A counter-position to ad-heavy writing platforms</div>
          <h1>Post your writing free. Build readers free. Let the crowd prove what deserves more.</h1>
          <p className="hero-text">
            BookShare is now a real metadata-first web app for writers and readers. Publish a polished listing, share
            your opening, collect requests, and decide who gets access without surrendering your manuscript to a
            storage-heavy platform.
          </p>
          <div className="hero-actions">
            <Link href={primaryCtaHref} className="primary-button">
              {primaryCtaLabel}
            </Link>
            <Link href="/browse" className="secondary-button">
              Browse stories
            </Link>
          </div>
          <div className="tag-row">
            <span>Free to join</span>
            <span>Free to read</span>
            <span>No ads</span>
            <span>Metadata only</span>
          </div>
        </div>

        {showLaunchForm ? (
          <div className="launch-card">
            <div className="launch-card-label">Writer launch form</div>
            <form action="/signup" className="form-stack">
              <div>
                <label htmlFor="display_name">Author name</label>
                <input id="display_name" name="display_name" placeholder="Your author name" />
              </div>
              <div>
                <label htmlFor="draft_title">Story title</label>
                <input id="draft_title" name="draft_title" placeholder="Title of your work" />
              </div>
              <div>
                <label htmlFor="draft_genre">Genre</label>
                <select id="draft_genre" name="draft_genre" defaultValue="Fantasy">
                  <option>Fantasy</option>
                  <option>Sci-Fi</option>
                  <option>Romance</option>
                  <option>Dystopian</option>
                  <option>Thriller</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="draft_excerpt">Paste your opening</label>
                <textarea id="draft_excerpt" name="draft_excerpt" placeholder="Paste your first chapter or excerpt here..." />
              </div>
              <input type="hidden" name="role" value="author" />
              <button className="full-button" type="submit">
                Claim your page and start posting
              </button>
              <p className="form-note">No ads. No fees. No manuscript upload required in this phase.</p>
            </form>
          </div>
        ) : (
          <div className="launch-card">
            <div className="launch-card-label">Your next step</div>
            <div className="surface-form">
              <h2>{profileRole === "author" ? "Keep building your catalog." : "Start discovering stories."}</h2>
              <p>
                {profileRole === "author"
                  ? "You’re already signed in as an author. Jump straight into creating a new listing or manage the work you already posted."
                  : "You’re signed in as a reader. Browse published listings, open excerpts, and request access from authors directly."}
              </p>
              <div className="hero-actions">
                <Link href={primaryCtaHref} className="primary-button">
                  {primaryCtaLabel}
                </Link>
                <Link href={profileRole === "author" ? "/dashboard" : "/browse"} className="secondary-button">
                  {profileRole === "author" ? "Open dashboard" : "Browse works"}
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      <section id="why" className="section container">
        <div className="section-intro">
          <p className="section-kicker">Why this exists</p>
          <h2>We built the opposite of what writers and readers complain about.</h2>
          <p>
            Some platforms interrupt the reading experience, bury new work, and push monetization before trust.
            BookShare flips each of those choices on purpose.
          </p>
        </div>

        <div className="card-grid two-col">
          {reversals.map((item) => (
            <div key={item.complaint} className="info-card">
              <div className="mini-label">Complaint</div>
              <h3>{item.complaint}</h3>
              <div className="divider" />
              <div className="mini-label accent">Our answer</div>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="section container">
        <div className="section-intro">
          <p className="section-kicker">How it works</p>
          <h2>Built for easy posting, visible momentum, and author-controlled requests.</h2>
        </div>

        <div className="card-grid three-col">
          {steps.map((step, index) => (
            <div key={step.title} className="step-card">
              <div className="step-badge">{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="feature-panel">
          <div>
            <p className="section-kicker">What you get</p>
            <h2>A discovery-focused website for books, excerpts, requests, and featured promotion.</h2>
            <p>
              This phase focuses on the real BookShare website: landing page, auth, dashboard, works, browse, work
              detail, request handling, and featured books support.
            </p>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <div key={feature} className="feature-item">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-intro">
          <p className="section-kicker">Featured now</p>
          <h2>Promoted works can be highlighted without storing full manuscripts on the platform.</h2>
          <p>The featured section below is backed by the `featured_flag` field and can be extended later with slots.</p>
        </div>

        <div className="card-grid two-col">
          {featuredWorks.length ? (
            featuredWorks.map((work) => (
              <article key={work.id} className="info-card">
                <div className="mini-label accent">{work.genre}</div>
                <h3>{work.title}</h3>
                <p className="card-meta">Excerpt-first listing</p>
                <p>{work.description}</p>
                <div className="tag-row compact">
                  {work.tags.slice(0, 4).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <Link href={`/works/${work.id}`} className="text-link">
                  Read the listing
                </Link>
              </article>
            ))
          ) : (
            <div className="empty-panel">
              <h3>No featured works yet</h3>
              <p>Authors can mark standout listings as featured during this phase, then refine promotion later.</p>
            </div>
          )}
        </div>
      </section>

      <section id="post" className="section container">
        <div className="cta-panel">
          <div className="section-kicker dark">Launch invitation</div>
          <h2>Stop waiting for permission. Start building readers now.</h2>
          <p>
            Create an account, post your excerpt, and let readers request access through a cleaner workflow designed for
            breakout writing.
          </p>
          <div className="hero-actions">
            <Link href={primaryCtaHref} className="dark-button">
              {primaryCtaLabel}
            </Link>
            <Link href="/browse" className="ghost-dark-button">
              Read rising stories
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
