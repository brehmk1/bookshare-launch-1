import Link from "next/link";
import { MessageBanner } from "@/components/message-banner";
import { getCurrentProfile, requireUser } from "@/lib/auth";
import { getAuthorWorks, getRequestsForUser } from "@/lib/queries";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { message?: string };
}) {
  const user = await requireUser();
  const [works, requests, profile] = await Promise.all([getAuthorWorks(user.id), getRequestsForUser(user.id), getCurrentProfile()]);
  const isAuthor = profile?.role === "author" || profile?.role === "curator";

  return (
    <main className="section">
      <MessageBanner message={searchParams?.message} />
      <div className="container page-head dashboard-head">
        <div>
          <p className="section-kicker">Dashboard</p>
          <h1>Manage your BookShare presence.</h1>
          <p>
            {isAuthor
              ? "Create and edit your listings, track reader demand, and keep featured-ready works moving."
              : "Track your requests, revisit works you care about, and browse new writing without losing momentum."}
          </p>
        </div>
        <div className="hero-actions">
          {isAuthor ? (
            <Link href="/works/new" className="primary-button">
              Create work
            </Link>
          ) : (
            <Link href="/browse" className="primary-button">
              Browse works
            </Link>
          )}
          <Link href="/requests" className="secondary-button">
            View requests
          </Link>
        </div>
      </div>

      <section className="container dashboard-grid">
        <div className="surface-card">
          <h2>{isAuthor ? "Your works" : "Reader summary"}</h2>
          {isAuthor && works.length ? (
            <div className="stack-list">
              {works.map((work) => (
                <div key={work.id} className="subtle-card">
                  <div className="listing-card-top">
                    <strong>{work.title}</strong>
                    <span className="pill">{work.status}</span>
                  </div>
                  <p>{work.description}</p>
                  <div className="hero-actions">
                    <Link href={`/works/${work.id}`} className="text-link">
                      View
                    </Link>
                    <Link href={`/works/${work.id}/edit`} className="text-link">
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : isAuthor ? (
            <p>No works yet. Create your first listing to start building readership.</p>
          ) : (
            <p>You’re set up as a reader, so this dashboard centers on browse and request activity instead of work creation.</p>
          )}
        </div>

        <div className="surface-card">
          <h2>Request activity</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span>Incoming</span>
              <strong>{requests.incoming.length}</strong>
            </div>
            <div className="stat-card">
              <span>Pending</span>
              <strong>{requests.incoming.filter((request) => request.status === "pending").length}</strong>
            </div>
            <div className="stat-card">
              <span>Outgoing</span>
              <strong>{requests.outgoing.length}</strong>
            </div>
          </div>
          <p>Use requests to manage approvals now. Desktop delivery can plug in later without redesigning the website.</p>
        </div>
      </section>
    </main>
  );
}
