create table if not exists public.desktop_clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_name text not null,
  platform text not null,
  online_status text not null default 'offline' check (online_status in ('offline', 'online')),
  last_heartbeat_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.work_files (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  desktop_client_id uuid not null references public.desktop_clients(id) on delete cascade,
  local_file_name text not null,
  file_fingerprint text not null,
  file_size bigint not null,
  mime_type text not null,
  availability_status text not null default 'unlinked' check (availability_status in ('unlinked', 'linked', 'ready_later')),
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists desktop_clients_user_idx on public.desktop_clients (user_id);
create index if not exists work_files_work_idx on public.work_files (work_id);
create index if not exists work_files_client_idx on public.work_files (desktop_client_id);
create unique index if not exists work_files_fingerprint_idx on public.work_files (file_fingerprint, desktop_client_id);

alter table public.desktop_clients enable row level security;
alter table public.work_files enable row level security;

drop policy if exists "Users can read own desktop clients" on public.desktop_clients;
create policy "Users can read own desktop clients"
on public.desktop_clients
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own desktop clients" on public.desktop_clients;
create policy "Users can insert own desktop clients"
on public.desktop_clients
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own desktop clients" on public.desktop_clients;
create policy "Users can update own desktop clients"
on public.desktop_clients
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Authors can read their work files" on public.work_files;
create policy "Authors can read their work files"
on public.work_files
for select
using (
  exists (
    select 1
    from public.works
    where works.id = work_files.work_id
      and works.author_id = auth.uid()
  )
  or exists (
    select 1
    from public.desktop_clients
    where desktop_clients.id = work_files.desktop_client_id
      and desktop_clients.user_id = auth.uid()
  )
);

drop policy if exists "Desktop owners can insert work files" on public.work_files;
create policy "Desktop owners can insert work files"
on public.work_files
for insert
with check (
  exists (
    select 1
    from public.desktop_clients
    where desktop_clients.id = work_files.desktop_client_id
      and desktop_clients.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.works
    where works.id = work_files.work_id
      and works.author_id = auth.uid()
  )
);

drop policy if exists "Desktop owners can update work files" on public.work_files;
create policy "Desktop owners can update work files"
on public.work_files
for update
using (
  exists (
    select 1
    from public.desktop_clients
    where desktop_clients.id = work_files.desktop_client_id
      and desktop_clients.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.desktop_clients
    where desktop_clients.id = work_files.desktop_client_id
      and desktop_clients.user_id = auth.uid()
  )
);
