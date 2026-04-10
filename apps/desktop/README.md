# BookShare Desktop

This is the Workstream 2A desktop companion scaffold for BookShare.

## What is implemented

- Tauri workspace structure
- TypeScript desktop frontend
- local scaffold auth panel
- local folder selection via directory input
- supported writing-file discovery
- file metadata display
- SHA-256 fingerprint generation in the frontend
- mockable adapter for linking local files to BookShare works
- local presence and availability status scaffolding

## What is not implemented yet

- real Supabase desktop auth
- real backend file registration
- real desktop client heartbeat
- peer-to-peer transfer
- WebRTC
- sending or receiving manuscript files

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

Workstream 2B should connect this scaffold to the live BookShare backend for:

- real auth
- `desktop_clients` registration
- `work_files` registration
- availability heartbeat updates
