# AGENTS.md

## Product
BookShare is an author-first writing platform.

The public website is responsible for discovery, excerpts, requests, featured works, and account management.
The desktop companion is responsible for local manuscript ownership, desktop presence, and direct reader-author transfer workflows.

The platform should not centrally store full manuscript files by default. Store metadata, excerpts, requests, approvals, device presence, and transfer session state in the backend.

## Current Repo State
- This repository now contains the first real BookShare web app built with Next.js and TypeScript.
- The deployed marketing page started at `https://bookshare-launch.vercel.app/`, and the homepage styling in this repo preserves that BookShare look.
- The web app covers auth, dashboard, work listings, browsing, work detail pages, requests, and featured works support.
- This repo now also includes the first desktop companion scaffold in `apps/desktop`.
- Real desktop backend sync and transfer work remain future workstreams.

## Target Architecture
- Web app: Next.js, TypeScript, Supabase, Vercel
- Desktop app: Tauri, TypeScript frontend, Rust shell as needed
- Backend: Supabase Postgres, Auth, Realtime, optional Edge Functions

## Core Product Rules
- Do not add centralized manuscript storage by default.
- Store only metadata, excerpts, requests, approvals, client presence, and transfer session data in Supabase.
- Large file transfer should happen between author and reader desktop apps.
- Keep web and desktop responsibilities clearly separated.
- Prefer simple, working implementations over speculative architecture.
- Keep components modular, typed, and easy to test locally.

## Expected Web Features
- Landing page
- Signup and login
- Author dashboard
- Create and edit work listing
- Browse works
- Work detail page
- Request workflow
- Featured books page
- Admin or curator workflow for highlighted books

## Expected Desktop Features
- Sign in with existing BookShare auth
- Select local library folder
- Scan local files
- Associate local files with work records
- Register file fingerprint, size, mime type, and availability
- Background heartbeat or presence updates
- Transfer session UI placeholders before full peer-to-peer delivery is complete

## Transfer Constraints
- Prefer WebRTC data channels for direct file transfer.
- Use the backend for signaling, approvals, session coordination, and status only.
- Provide a fallback path for author-controlled external links if direct transfer is unavailable.

## Repo Layout
- `apps/desktop/`: Tauri desktop companion scaffold with TypeScript frontend and Rust shell stub
- `app/`: Next.js App Router pages, layouts, and global styling
- `components/`: reusable UI components and forms
- `lib/`: Supabase clients, server actions, auth helpers, validation, and queries
- `supabase/migrations/`: SQL migrations for the web phase and desktop scaffold support
- `types/`: shared database and application types
- `public/`: static assets

If this repo later becomes a monorepo, keep the structure explicit. A preferred future layout would be:
- `apps/web`
- `apps/desktop`
- `supabase`
- `packages/ui`
- `packages/config`

## Run, Build, and Lint
- Install: `npm install`
- Dev server: `npm run dev`
- Desktop dev server: `npm run desktop:dev`
- Production build: `npm run build`
- Desktop build: `npm run desktop:build`
- Lint: `npm run lint`
- Type check: `npm run typecheck`

## Engineering Conventions
- Use TypeScript for all new application code unless there is a strong reason not to.
- Preserve the current BookShare visual identity: dark stone or black foundation, amber or gold accents, soft white text, premium literary feel.
- Favor server-backed workflows over mock-only UI once Supabase details are available.
- Keep route structure stable and avoid broken navigation.
- Document required environment variables in `.env.example` and `README.md`.
- Add concise comments only where the logic is not self-evident.

## Definition Of Done
A feature is only done when:
- it runs locally
- TypeScript passes
- lint passes
- there are no broken routes for the affected area
- Supabase integration is documented if applicable
- placeholder vs real implementation is clearly labeled
- the UI still matches BookShare branding

## Near-Term Priority
1. Finish and harden the web metadata workflow against the live Supabase project.
2. Refine featured and curation workflows.
3. Build the desktop companion after the web metadata workflow is working.
4. Build the direct transfer layer after desktop presence and file registration exist.
