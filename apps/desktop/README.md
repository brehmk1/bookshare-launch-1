# BookShare Desktop

This is the BookShare desktop companion for Workstream 2B.

## What is implemented

- Tauri workspace structure
- TypeScript desktop frontend
- live Supabase-backed desktop sign-in using existing BookShare accounts
- local folder selection via directory input
- supported writing-file discovery
- file metadata display
- SHA-256 fingerprint generation in the frontend
- live authored-work lookup from the BookShare backend
- desktop client registration in `desktop_clients`
- file registration in `work_files`
- live availability status updates for linked files

## What is not implemented yet

- peer-to-peer transfer
- WebRTC
- sending or receiving manuscript files
- background heartbeat scheduling
- reader-side file receipt workflows

## Local run steps

Frontend-only scaffold:

```bash
npm install
npm run desktop:dev
```

Build the desktop frontend:

```bash
npm run desktop:build
```

Required desktop env file:

```bash
VITE_BOOKSHARE_BACKEND_MODE=supabase
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Use an existing BookShare account created through the web app. Desktop account creation is still expected to happen on the website.

## Tauri shell notes

The repo includes a Tauri shell scaffold in `src-tauri`, but launching the actual desktop window requires:

- Rust toolchain
- Cargo
- Tauri CLI dependencies
- Windows WebView2 runtime

When those are installed, the intended command is:

```bash
npm --prefix apps/desktop run tauri:dev
```

Workstream 2C or later can extend this with:

- heartbeat scheduling
- transfer-session preparation
- sender and receiver coordination
