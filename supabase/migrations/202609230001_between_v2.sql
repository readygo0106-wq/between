create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.actions (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  duration text not null,
  difficulty text not null,
  cost_level text not null,
  what_you_need jsonb not null default '[]'::jsonb,
  what_you_might_leave_with text not null,
  cover_image text,
  source_type text not null check (source_type in ('curated','user','external')),
  source_url text,
  source_name text,
  retrieved_at timestamptz,
  is_published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_actions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  action_id text references public.actions(id) on delete cascade,
  custom_title text,
  custom_description text,
  custom_category text,
  custom_duration text,
  status text not null check (status in ('saved','doing','done')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.captures (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_action_id text references public.user_actions(id) on delete set null,
  capture_type text not null,
  content text not null,
  capture_date date not null,
  location text,
  person_note text,
  tags text[] not null default '{}',
  visibility text not null default 'private' check (visibility = 'private'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.capture_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  capture_id text not null references public.captures(id) on delete cascade,
  storage_path text not null,
  mime_type text,
  byte_size integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journey_events (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  capture_id text references public.captures(id) on delete cascade,
  user_action_id text references public.user_actions(id) on delete cascade,
  event_date date not null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.future_postcards (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  deliver_at date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stamps (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_action_id text references public.user_actions(id) on delete set null,
  label text not null,
  stamped_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reflections (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  summary text not null,
  recurring_themes text[] not null default '{}',
  open_questions text[] not null default '{}',
  source_capture_ids text[] not null default '{}',
  source_user_action_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  title text not null,
  content text not null,
  source_url text,
  consent_confirmed boolean not null default false,
  status text not null default 'draft' check (status in ('draft','review','published','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_id text not null references public.actions(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, action_id)
);

insert into public.actions (id, title, description, category, duration, difficulty, cost_level, what_you_need, what_you_might_leave_with, cover_image, source_type, is_published)
values
  ('film-three-minutes', '拍一支 3 分钟短片', '找一个最近一直在注意的人、地方或者事情，用手机把它留下来。', '做点东西', '2–4 小时', '需要一点准备', '免费', '["一部手机","一个下午","一个有点好奇的东西"]', '一支属于这段时间的短片', '/images/between/travel-desk.png', 'curated', true),
  ('unknown-neighborhood', '去一个从没去过的街区', '选一个平时不会下车的站，走一小时，只看看在那里生活的人。', '去看看世界', '1–2 小时', '很轻松', '低成本', '["一双舒服的鞋","往返交通费"]', '一条新的散步路线和几张照片', '/images/between/road-map.png', 'curated', true),
  ('talk-to-different-work', '和一个陌生职业的人聊 30 分钟', '问问对方普通的一天怎么过、最意外的部分是什么。', '认识一些人', '30–60 分钟', '需要一点准备', '免费', '["一位愿意聊天的人","三个真心好奇的问题"]', '对一种生活更具体的认识', '/images/between/writing-desk.png', 'curated', true),
  ('tiny-website', '做一个只解决一件事的小网站', '从一个小麻烦开始，用最简单的方式做出可以点开的版本。', '做点东西', '一个周末', '认真做一次', '免费', '["一个具体的小问题","电脑"]', '一个真实可用的小作品', '/images/between/scrapbook-cover.png', 'curated', true),
  ('learn-one-dish', '认真学会做一道菜', '从买材料开始完整做一次，再请一个人一起吃。', '学点东西', '2 小时', '很轻松', '低成本', '["一份可靠食谱","基础厨具","食材"]', '一道以后还能再做的菜', '/images/between/writing-desk.png', 'curated', true),
  ('quiet-afternoon', '给自己一个没有安排的下午', '不把休息变成任务，不打卡，不总结。', '慢下来', '一个下午', '很轻松', '免费', '["关掉一部分提醒"]', '一点真正休息过的感觉', '/images/between/passport-table.png', 'curated', true),
  ('work-shadow', '跟着一个人看半天真实工作', '征得同意后观察半天，看看工作中真正花时间的是什么。', '试试一种工作', '半天', '认真做一次', '免费', '["对方明确同意","不影响工作的边界"]', '对这份工作去掉滤镜后的认识', '/images/between/travel-desk.png', 'curated', true),
  ('three-city-photos', '拍下今天城市里的三种声音', '用照片记录你觉得能听见声音的画面。', '去看看世界', '30–90 分钟', '很轻松', '免费', '["手机或相机"]', '一组三张的城市小记录', '/images/between/travel-desk.png', 'curated', true)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  duration = excluded.duration,
  difficulty = excluded.difficulty,
  cost_level = excluded.cost_level,
  what_you_need = excluded.what_you_need,
  what_you_might_leave_with = excluded.what_you_might_leave_with,
  cover_image = excluded.cover_image,
  source_type = excluded.source_type,
  is_published = excluded.is_published,
  updated_at = now();

alter table public.profiles enable row level security;
alter table public.actions enable row level security;
alter table public.user_actions enable row level security;
alter table public.captures enable row level security;
alter table public.capture_images enable row level security;
alter table public.journey_events enable row level security;
alter table public.future_postcards enable row level security;
alter table public.stamps enable row level security;
alter table public.reflections enable row level security;
alter table public.stories enable row level security;
alter table public.favorites enable row level security;

create policy "profiles_own_all" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "actions_public_read" on public.actions for select using (is_published = true or created_by = auth.uid());
create policy "actions_own_insert" on public.actions for insert with check (source_type = 'user' and created_by = auth.uid());
create policy "actions_own_update" on public.actions for update using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "actions_own_delete" on public.actions for delete using (created_by = auth.uid());
create policy "user_actions_own_all" on public.user_actions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "captures_own_all" on public.captures for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "capture_images_own_all" on public.capture_images for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "journey_events_own_all" on public.journey_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "future_postcards_own_all" on public.future_postcards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "stamps_own_all" on public.stamps for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reflections_own_all" on public.reflections for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "stories_published_read" on public.stories for select using (status = 'published' and consent_confirmed = true);
create policy "stories_author_all" on public.stories for all using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "favorites_own_all" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-captures', 'user-captures', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

create policy "capture_storage_own_read" on storage.objects for select using (bucket_id = 'user-captures' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "capture_storage_own_insert" on storage.objects for insert with check (bucket_id = 'user-captures' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "capture_storage_own_update" on storage.objects for update using (bucket_id = 'user-captures' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "capture_storage_own_delete" on storage.objects for delete using (bucket_id = 'user-captures' and (storage.foldername(name))[1] = auth.uid()::text);
