import { MessageBanner } from "@/components/message-banner";
import { WorkForm } from "@/components/work-form";
import { requireAuthorProfile } from "@/lib/auth";
import { getWorkById } from "@/lib/queries";

export default async function EditWorkPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { message?: string };
}) {
  const { user } = await requireAuthorProfile();
  const work = await getWorkById(params.id);

  if (!work || work.author_id !== user.id) {
    return (
      <main className="section">
        <MessageBanner message={searchParams?.message} />
        <div className="container empty-panel">
          <h1>Work unavailable</h1>
          <p>You can only edit your own listings.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <MessageBanner message={searchParams?.message} />
      <div className="container page-head">
        <div>
          <p className="section-kicker">Edit work</p>
          <h1>Update your listing.</h1>
          <p>Keep the metadata current while leaving desktop delivery and manuscript handling for later workstreams.</p>
        </div>
      </div>

      <section className="container">
        <div className="surface-card">
          <WorkForm mode="edit" work={work} />
        </div>
      </section>
    </main>
  );
}
