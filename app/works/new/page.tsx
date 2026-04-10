import { MessageBanner } from "@/components/message-banner";
import { WorkForm } from "@/components/work-form";
import { requireAuthorProfile } from "@/lib/auth";

export default async function NewWorkPage({
  searchParams,
}: {
  searchParams?: { draft_excerpt?: string; draft_genre?: string; draft_title?: string; message?: string };
}) {
  await requireAuthorProfile();

  return (
    <main className="section">
      <MessageBanner message={searchParams?.message} />
      <div className="container page-head">
        <div>
          <p className="section-kicker">Create work</p>
          <h1>Publish a metadata-first listing.</h1>
          <p>
            Add title, description, genre, tags, excerpt text, and an optional cover image URL. No manuscript upload is
            stored in this phase.
          </p>
        </div>
      </div>

      <section className="container">
        <div className="surface-card">
          <WorkForm
            mode="create"
            draft={{
              draftTitle: searchParams?.draft_title,
              draftGenre: searchParams?.draft_genre,
              draftExcerpt: searchParams?.draft_excerpt,
            }}
          />
        </div>
      </section>
    </main>
  );
}
