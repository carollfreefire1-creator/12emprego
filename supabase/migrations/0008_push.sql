-- ============================================================
-- Migration 0008: push notifications
-- ============================================================

create table if not exists push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  title      text not null,
  body       text not null,
  url        text,
  read       boolean not null default false,
  sent_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_push_subs_user on push_subscriptions(user_id);
create index if not exists idx_notifications_user_read on notifications(user_id, read);

alter table push_subscriptions enable row level security;
alter table notifications enable row level security;

create policy "push_subs_own" on push_subscriptions for all
  using (user_id = (select id from users where email = auth.email() limit 1))
  with check (user_id = (select id from users where email = auth.email() limit 1));

create policy "notifications_own" on notifications for select
  using (user_id = (select id from users where email = auth.email() limit 1));

create policy "admin_full_notifications" on notifications for all
  using (exists (select 1 from users where email = auth.email() and role = 'admin'))
  with check (exists (select 1 from users where email = auth.email() and role = 'admin'));
