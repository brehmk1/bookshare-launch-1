-- BookShare demo seed
-- Replace the placeholder UUIDs below with real auth.users ids from accounts you created through the app.
-- This seed is optional. It exists to make local and preview verification easier.

-- Example:
-- 1. Sign up one author account in BookShare.
-- 2. Copy that user's UUID from Supabase Auth.
-- 3. Replace 'AUTHOR_USER_ID_HERE' below.
-- 4. Run this file in the Supabase SQL editor.

insert into public.works (
  author_id,
  title,
  description,
  genre,
  tags,
  excerpt_text,
  cover_image_url,
  visibility,
  status,
  featured_flag
)
values
  (
    'AUTHOR_USER_ID_HERE',
    'The Lantern House',
    'A moody gothic mystery about inheritance, memory, and the rooms we avoid opening.',
    'Gothic Mystery',
    array['gothic', 'family secrets', 'slow burn'],
    'By the time Mara found the key, the house had already decided she belonged to it.',
    null,
    'public',
    'published',
    true
  ),
  (
    'AUTHOR_USER_ID_HERE',
    'Signal Bloom',
    'A literary science-fiction novella about grief, distance, and encoded messages from deep space.',
    'Sci-Fi',
    array['literary sci-fi', 'space', 'grief'],
    'The message arrived in fragments, each one sounding more like a memory than a transmission.',
    null,
    'public',
    'published',
    false
  );
