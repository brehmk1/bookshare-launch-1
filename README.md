# BookShare Web App

This repository now contains Workstream 1 of BookShare: the real website built with Next.js, TypeScript, and Supabase integration points while preserving the existing BookShare launch-page branding.

## Product Direction

BookShare is intended to become a two-part system:
- a public web app for marketing, discovery, metadata, excerpts, requests, and featured works
- a desktop companion app for local manuscript ownership, availability tracking, and direct author-to-reader transfer

The platform should not centrally store full manuscript files by default. This phase stores metadata and excerpt text only.

## Current Status

Implemented in this phase:
- Next.js App Router structure
- homepage that preserves the BookShare launch-page look
- Supabase auth flows for signup, login, logout, and session-aware navigation
- author dashboard
- create work and edit work flows
- browse works page
- work detail page
- request access workflow
- approve and deny requests
- featured works page
- SQL migration for the core BookShare web schema

Not implemented in this phase:
- desktop companion app
- peer-to-peer transfer
- manuscript upload or storage
- payments
- full admin curation console

## Required Environment Variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

No server-side Supabase key is required for this phase.
The app uses the public anon key together with Supabase Auth sessions and Row Level Security so authors and readers can only act within their allowed records.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Apply the SQL in [`supabase/migrations/20260410_000001_bookshare_web_phase.sql`](C:\Users\Kevin%20Brehm\Desktop\bookshare-launch\supabase\migrations\20260410_000001_bookshare_web_phase.sql) to your Supabase project.

Recommended option:
- Open the Supabase SQL Editor for your project.
- Paste the migration contents.
- Run it once.

Optional CLI option if you already use the Supabase CLI:

```bash
supabase db push
```

If you want demo content after creating an author account, use the optional seed template in [`supabase/seed/demo_seed.sql`](C:\Users\Kevin%20Brehm\Desktop\bookshare-launch\supabase\seed\demo_seed.sql).

3. Add the environment variables above to `.env.local`.

4. Start the development server:

```bash
npm run dev
```

5. Verify the app:

```bash
npm run typecheck
npm run build
```

## Vercel Deployment

1. Import the repo into Vercel as a Next.js project.
2. Add these environment variables in the Vercel project settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Redeploy after the migration has been applied in Supabase.

No `vercel.json` file is required for this phase.

Requirements:
- Node.js 20+ recommended

## Recommended Next Steps

1. Point the app at the live Supabase project and test the full auth and request workflow end to end.
2. Add richer profile editing and curation tooling.
3. Build the Tauri desktop companion after the web metadata flow is working.
4. Add the transfer layer after desktop client registration and presence are in place.

## Manual Verification Flow

1. Open the homepage and confirm the BookShare landing page renders with the original branding.
2. Click `Start posting free` while signed out and confirm it goes to signup.
3. Sign up as an author and confirm you are sent to `/works/new`.
4. Create a work with title, description, genre, tags, excerpt text, and optional cover image URL.
5. Confirm the saved work opens at `/works/[id]`.
6. Edit the work and confirm the updates appear on the detail page and in browse.
7. Sign up or log in as a reader in a separate browser session.
8. Open `/browse`, open the work detail page, and submit a request.
9. Return to the author session, open `/requests`, and approve or deny the request with an optional response message.
10. Return to the reader session and confirm the request status and response are visible in `/requests`.

## Codex Guidance

This repo now includes:
- `AGENTS.md` for repo-level build rules and definition of done
- `docs/codex-build-brief.md` for the BookShare architecture and workstream brief

If you use Codex on this project next, keep the focus on web hardening and Supabase wiring until the website flow is stable.
