import Link from "next/link";

export function ConfigNotice() {
  return (
    <div className="config-notice">
      <h2>Supabase setup is still required.</h2>
      <p>
        Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable auth,
        works, requests, and featured data.
      </p>
      <div className="hero-actions">
        <Link href="/signup" className="primary-button">
          View signup flow
        </Link>
        <Link href="/browse" className="secondary-button">
          See app routes
        </Link>
      </div>
    </div>
  );
}
