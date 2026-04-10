# BookShare Codex Build Brief

## Goal
Build BookShare as a two-part platform:
- a public web app for discovery, identity, excerpts, and request workflows
- a desktop companion for local manuscript ownership and direct transfer

The platform should not centrally host manuscript files by default.

## Recommended Workstreams

### 1. Web App First
Build the real BookShare website:
- landing page
- auth
- author dashboard
- create and edit work listing
- browse works
- work detail page
- request workflow
- featured books page
- admin or curator page
- Supabase schema and wiring

### 2. Desktop App Second
Build the local desktop companion:
- sign in
- select local library folder
- map local files to works
- register availability
- prepare for peer-to-peer transfer

### 3. Transfer Layer Third
Build the direct transfer system:
- signaling
- approval session
- sender and receiver handshake
- WebRTC or fallback external-link flow

## Product Rules
- Store metadata and excerpts in Supabase.
- Do not centrally store full manuscript files by default.
- Keep work listings visible even when the desktop client is offline.
- Mark offline works as unavailable for immediate transfer when appropriate.
- Allow request-only access, approved transfer only, and optional external-link fallback.

## Current Starting Point
- The current repository is a React and Vite launch page.
- The deployed site is visually branded, but the form and buttons are not wired to real backend flows.
- This repo is not yet the completed BookShare platform.

## Suggested Stack
- Web: Next.js 14+, TypeScript, Vercel
- Backend: Supabase Postgres, Auth, Realtime, optional Edge Functions
- Desktop: Tauri, TypeScript frontend, Windows-first optimization
- Transfer: WebRTC data channels when practical

## Core Data Model
Create these main tables:
- `profiles`
- `works`
- `work_files`
- `requests`
- `desktop_clients`
- `transfer_sessions`
- `featured_slots`

Minimum fields to include:

### `profiles`
- `id`
- `user_id`
- `display_name`
- `bio`
- `avatar_url`
- `role`
- `created_at`

### `works`
- `id`
- `author_id`
- `title`
- `description`
- `genre`
- `tags`
- `excerpt_text`
- `cover_image_url`
- `visibility`
- `status`
- `transfer_mode`
- `featured_flag`
- `created_at`
- `updated_at`

### `work_files`
- `id`
- `work_id`
- `local_file_name`
- `file_fingerprint`
- `file_size`
- `mime_type`
- `desktop_client_id`
- `availability_status`
- `last_seen_at`

### `requests`
- `id`
- `work_id`
- `reader_id`
- `author_id`
- `message`
- `status`
- `response_message`
- `created_at`
- `updated_at`

### `desktop_clients`
- `id`
- `user_id`
- `device_name`
- `platform`
- `online_status`
- `last_heartbeat_at`
- `local_library_path_hash`

### `transfer_sessions`
- `id`
- `work_id`
- `request_id`
- `sender_client_id`
- `receiver_client_id`
- `status`
- `signaling_payload`
- `created_at`
- `updated_at`
- `completed_at`

### `featured_slots`
- `id`
- `work_id`
- `slot_type`
- `start_at`
- `end_at`
- `curator_notes`

## Deliverables
- full repo structure
- environment variable setup for Vercel and Supabase
- SQL migration files
- web frontend implementation
- Supabase integration
- Tauri desktop companion scaffold
- README with local development steps
- seed data for demo works
- clear notes on implemented features vs placeholders

## First Codex Prompt
Use this repo as the starting point for the BookShare web application. Preserve the current BookShare visual identity, but replace the static launch page architecture with a production-ready web app using Next.js and TypeScript. Implement the landing page, auth, dashboard, create/edit work listing, browse page, work detail page, request workflow, featured page, and initial Supabase schema and wiring. Do not add centralized manuscript storage. Keep the desktop app and transfer layer as explicit future workstreams, but leave extension points for them in the schema and UI.
