# BookShare Platform

This repository now contains:
- Workstream 1: the real BookShare website built with Next.js, TypeScript, and Supabase integration points
- Workstream 2A/2B: the desktop companion with local file discovery plus live backend file registration and availability updates

## Product Direction

BookShare is intended to become a two-part system:
- a public web app for marketing, discovery, metadata, excerpts, requests, and featured works
- a desktop companion app for local manuscript ownership, availability tracking, and direct author-to-reader transfer

The platform should not centrally store full manuscript files by default. The web app stores metadata and excerpt text only, while the desktop scaffold keeps actual files on the local machine.

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
- desktop companion scaffold in `apps/desktop`
- local folder selection and supported writing-file discovery
- local file metadata and SHA-256 fingerprinting
- desktop sign-in using the existing BookShare auth model
- live authored-work lookup in the desktop app
- desktop client registration in `desktop_clients`
- live file registration in `work_files`
- live availability status updates for linked files
- phase-2 schema hooks for `desktop_clients` and `work_files`

Not implemented in this phase:
- peer-to-peer transfer
- manuscript upload or storage
- payments
- full admin curation console
- background heartbeat scheduling

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

2. Apply the SQL in both migration files to your Supabase project:

- [`supabase/migrations/20260410_000001_bookshare_web_phase.sql`](C:\Users\Kevin%20Brehm\Desktop\bookshare-launch\supabase\migrations\20260410_000001_bookshare_web_phase.sql)
- [`supabase/migrations/20260410_000002_bookshare_desktop_scaffold.sql`](C:\Users\Kevin%20Brehm\Desktop\bookshare-launch\supabase\migrations\20260410_000002_bookshare_desktop_scaffold.sql)

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

Desktop scaffold:

```bash
npm install
npm run desktop:dev
npm run desktop:typecheck
npm run desktop:build
```

Notes:
- `npm run desktop:dev` runs the desktop frontend through Vite for local development.
- The repo also includes a Tauri shell scaffold in `apps/desktop/src-tauri`.
- Running the actual Tauri desktop window requires Rust, Cargo, and Windows desktop prerequisites to be installed.
- Create `apps/desktop/.env.local` using the env format in `apps/desktop/.env.example`.

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

## Desktop Local Notes

The desktop app is scaffolded for local development first.

Real in Workstream 2B:
- desktop frontend workspace
- BookShare sign-in with email/password
- desktop client registration in Supabase
- authored-work lookup from Supabase
- `work_files` registration
- live availability updates
- local folder selection
- supported file scanning
- file metadata extraction
- SHA-256 fingerprint generation
- desktop presence status derived from backend registration
- Tauri project structure
- Supabase schema extension points

Still scaffolded after Workstream 2B:
- long-running heartbeat scheduling
- transfer session creation
- sender and receiver handshake flows
- all transfer logic

To run the full Tauri shell later, the intended command is:

```bash
npm --prefix apps/desktop run tauri:dev
```

That command is not verified in this pass because Rust/Cargo is not installed on this machine yet.

## Recommended Next Steps

1. Add heartbeat scheduling and presence refresh for registered desktop clients.
2. Add richer profile editing and curation tooling.
3. Install the Rust/Tauri toolchain so the desktop shell can be launched directly.
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

## Desktop Scaffold Verification

1. Run `npm run desktop:dev`.
2. Open the local URL shown by Vite.
3. Sign in with an existing BookShare account email and password.
4. Click `Select local library folder`.
5. Choose a folder containing supported writing files such as `.txt`, `.md`, `.docx`, `.pdf`, or `.epub`.
6. Confirm the app lists discovered files and computes metadata plus SHA-256 fingerprints.
7. Select a file and confirm the metadata panel updates.
8. Confirm authored works load from the live backend.
9. Link the file to a real BookShare work record and confirm registration succeeds.
10. Mark the linked file as available later and confirm the status updates.

## Codex Guidance

This repo now includes:
- `AGENTS.md` for repo-level build rules and definition of done
- `docs/codex-build-brief.md` for the BookShare architecture and workstream brief

The next task should be:

`Workstream 2C: add desktop heartbeat scheduling and stronger backend sync around registered files and device presence`
