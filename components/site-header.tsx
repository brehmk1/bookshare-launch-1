import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  const primarySignedInHref = profile?.role === "reader" ? "/browse" : "/dashboard";
  const primarySignedInLabel = profile?.role === "reader" ? "Browse" : "Dashboard";

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <div>
          <Link href="/" className="brand-link">
            <div className="brand">BookShare</div>
          </Link>
          <div className="brand-subtitle">Ad-free. Author-first. Built for breakout writing.</div>
        </div>

        <nav className="nav-links">
          <Link href="/browse">Browse</Link>
          <Link href="/featured">Featured</Link>
          {user ? <Link href={primarySignedInHref}>{primarySignedInLabel}</Link> : <Link href="/login">Log in</Link>}
          {user ? <Link href="/requests">Requests</Link> : <Link href="/signup" className="nav-button">Join now</Link>}
          {user ? (
            <form action={logoutAction}>
              <button className="nav-ghost-button" type="submit">
                Log out{profile?.display_name ? ` ${profile.display_name}` : ""}
              </button>
            </form>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
