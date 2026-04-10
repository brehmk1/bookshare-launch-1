create extension if not exists "pgcrypto";

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  bio text,
  avatar_url text,
  role text not null default 'reader' check (role in ('author', 'reader', 'curator')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  genre text not null,
  tags text[] not null default '{}',
  excerpt_text text not null,
  cover_image_url text,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  featured_flag boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  reader_id uuid not null references auth.users(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  response_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.featured_slots (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  slot_type text not null,
  start_at timestamptz,
  end_at timestamptz,
  curator_notes text
);

create unique index if not exists requests_pending_unique_idx
  on public.requests (work_id, reader_id)
  where status = 'pending';

create index if not exists works_author_idx on public.works (author_id);
create index if not exists works_featured_idx on public.works (featured_flag);
create index if not exists requests_author_idx on public.requests (author_id);
create index if not exists requests_reader_idx on public.requests (reader_id);
create index if not exists featured_slots_work_idx on public.featured_slots (work_id);

drop trigger if exists works_set_updated_at on public.works;
create trigger works_set_updated_at
before update on public.works
for each row
execute function public.handle_updated_at();

drop trigger if exists requests_set_updated_at on public.requests;
create trigger requests_set_updated_at
before update on public.requests
for each row
execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'reader')
  )
  on conflict (user_id) do update
  set display_name = excluded.display_name,
      role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.works enable row level security;
alter table public.requests enable row level security;
alter table public.featured_slots enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
on public.profiles
for select
using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "Public works are viewable by everyone" on public.works;
create policy "Public works are viewable by everyone"
on public.works
for select
using (
  visibility = 'public'
  or auth.uid() = author_id
);

drop policy if exists "Authors can create own works" on public.works;
create policy "Authors can create own works"
on public.works
for insert
with check (auth.uid() = author_id);

drop policy if exists "Authors can update own works" on public.works;
create policy "Authors can update own works"
on public.works
for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "Users can read involved requests" on public.requests;
create policy "Users can read involved requests"
on public.requests
for select
using (
  auth.uid() = reader_id
  or auth.uid() = author_id
);

drop policy if exists "Readers can create requests" on public.requests;
create policy "Readers can create requests"
on public.requests
for insert
with check (
  auth.uid() = reader_id
  and auth.uid() <> author_id
);

drop policy if exists "Authors can update requests they own" on public.requests;
create policy "Authors can update requests they own"
on public.requests
for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "Featured slots are viewable by everyone" on public.featured_slots;
create policy "Featured slots are viewable by everyone"
on public.featured_slots
for select
using (true);
