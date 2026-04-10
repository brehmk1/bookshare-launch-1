import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageBanner } from "@/components/message-banner";
import { getCurrentProfile } from "@/lib/auth";
import { loginAction } from "@/lib/actions/auth";
import { authorHasWorks } from "@/lib/queries";
import { getSignedInPath } from "@/lib/routing";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { message?: string };
}) {
  const profile = await getCurrentProfile();

  if (profile) {
    const hasWorks = profile.role === "author" ? await authorHasWorks(profile.user_id) : false;
    redirect(getSignedInPath(profile.role, hasWorks));
  }

  return (
    <main className="section">
      <MessageBanner message={searchParams?.message} />
      <div className="container auth-shell">
        <div className="auth-panel">
          <p className="section-kicker">Welcome back</p>
          <h1>Log in to BookShare</h1>
          <p>Return to your dashboard, browse work listings, and manage requests from one place.</p>

          <form action={loginAction} className="surface-form">
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required />
            </div>
            <button type="submit" className="primary-button">
              Log in
            </button>
          </form>
        </div>

        <aside className="auth-side-panel">
          <h2>What this phase includes</h2>
          <ul className="feature-list">
            <li>Auth and session handling</li>
            <li>Author dashboard and work creation</li>
            <li>Browse, work detail, and request access</li>
            <li>Approve or deny requests as an author</li>
          </ul>
          <Link href="/signup" className="text-link">
            Need an account? Sign up
          </Link>
        </aside>
      </div>
    </main>
  );
}
