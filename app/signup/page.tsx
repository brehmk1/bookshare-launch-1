import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageBanner } from "@/components/message-banner";
import { getCurrentProfile } from "@/lib/auth";
import { signUpAction } from "@/lib/actions/auth";
import { getPostAuthPath } from "@/lib/routing";

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: { message?: string; display_name?: string; draft_title?: string; draft_genre?: string; draft_excerpt?: string; role?: string };
}) {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect(getPostAuthPath(profile.role, {
      draftTitle: searchParams?.draft_title,
      draftGenre: searchParams?.draft_genre,
      draftExcerpt: searchParams?.draft_excerpt,
    }));
  }

  const draftTitle = searchParams?.draft_title ?? "";
  const draftGenre = searchParams?.draft_genre ?? "";
  const draftExcerpt = searchParams?.draft_excerpt ?? "";

  return (
    <main className="section">
      <MessageBanner message={searchParams?.message} />
      <div className="container auth-shell">
        <div className="auth-panel">
          <p className="section-kicker">Create account</p>
          <h1>Join BookShare</h1>
          <p>
            Create an account to post metadata-rich work listings, browse excerpts, and request access directly from
            authors.
          </p>

          <form action={signUpAction} className="surface-form">
            <input type="hidden" name="draft_title" value={draftTitle} />
            <input type="hidden" name="draft_genre" value={draftGenre} />
            <input type="hidden" name="draft_excerpt" value={draftExcerpt} />
            <div>
              <label htmlFor="display_name">Display name</label>
              <input id="display_name" name="display_name" defaultValue={searchParams?.display_name ?? ""} required />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required />
            </div>
            <div>
              <label htmlFor="role">Primary role</label>
              <select id="role" name="role" defaultValue={searchParams?.role === "reader" ? "reader" : "author"}>
                <option value="author">Author</option>
                <option value="reader">Reader</option>
              </select>
            </div>
            <button type="submit" className="primary-button">
              Create account
            </button>
          </form>
        </div>

        <aside className="auth-side-panel">
          <h2>Launch page handoff</h2>
          <p>The homepage writer form now feeds into signup instead of ending at static UI.</p>
          <div className="auth-draft-card">
            <div>
              <strong>Draft title</strong>
              <p>{searchParams?.draft_title || "No title captured yet"}</p>
            </div>
            <div>
              <strong>Draft genre</strong>
              <p>{searchParams?.draft_genre || "No genre captured yet"}</p>
            </div>
            <div>
              <strong>Draft excerpt</strong>
              <p>{searchParams?.draft_excerpt ? `${searchParams.draft_excerpt.slice(0, 180)}...` : "No excerpt captured yet"}</p>
            </div>
          </div>
          <p>
            After signing up, authors are guided directly into the create-work flow with these draft fields preserved.
          </p>
          <Link href="/login" className="text-link">
            Already have an account? Log in
          </Link>
        </aside>
      </div>
    </main>
  );
}
