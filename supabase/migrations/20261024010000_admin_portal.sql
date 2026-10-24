-- Admin portal: the product catalogue, the store's open/closed switch, and who may change them.
-- Run once in the Supabase SQL Editor (or `supabase db push`).

-- Admins are named here by their auth user id. Add the owner after creating their login under
-- Authentication > Users:  insert into public.admin_users (user_id) values ('<their user id>');
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
drop policy if exists "Admins can see their own row" on public.admin_users;
create policy "Admins can see their own row" on public.admin_users for select to authenticated using (user_id = auth.uid());
grant select on public.admin_users to authenticated;

-- Security definer, so policies can ask without the caller needing to read admin_users.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admin_users where user_id = auth.uid()) $$;

-- Money is held in pence and lengths in metres, matching src/lib/pricing.js.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (length(trim(name)) > 0),
  price integer not null check (price > 0), -- pence per metre
  category text not null check (category in ('budget', 'standard', 'premium', 'designer')),
  stock numeric(6, 1) not null default 0 check (stock >= 0), -- metres on the shelf
  image_url text,
  tone text check (tone in ('gold', 'crimson', 'forest', 'indigo', 'charcoal')),
  weave text,
  origin text,
  occasions text[] not null default '{}',
  colours text[] not null default '{}',
  patterns text[] not null default '{}',
  blurb text,
  created_at timestamptz not null default now()
);
-- The table may already exist with fewer columns (it was first made by hand), so add whatever is missing.
alter table public.products add column if not exists slug text;
alter table public.products add column if not exists name text;
alter table public.products add column if not exists price integer;
alter table public.products add column if not exists category text;
alter table public.products add column if not exists stock numeric(6, 1) not null default 0;
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists tone text check (tone in ('gold', 'crimson', 'forest', 'indigo', 'charcoal'));
alter table public.products add column if not exists weave text;
alter table public.products add column if not exists origin text;
alter table public.products add column if not exists occasions text[] not null default '{}';
alter table public.products add column if not exists colours text[] not null default '{}';
alter table public.products add column if not exists patterns text[] not null default '{}';
alter table public.products add column if not exists blurb text;
alter table public.products add column if not exists created_at timestamptz not null default now();
-- The shop looks cloth up by slug, and the seed below relies on it being unique.
create unique index if not exists products_slug_key on public.products (slug);
alter table public.products enable row level security;
drop policy if exists "Anyone can read products" on public.products;
create policy "Anyone can read products" on public.products for select to anon, authenticated using (true);
drop policy if exists "Admins can add products" on public.products;
create policy "Admins can add products" on public.products for insert to authenticated with check (public.is_admin());
drop policy if exists "Admins can edit products" on public.products;
create policy "Admins can edit products" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can remove products" on public.products;
create policy "Admins can remove products" on public.products for delete to authenticated using (public.is_admin());
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

-- A single row (id = 1): is the shop taking online orders?
create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  is_open boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.store_settings add column if not exists is_open boolean not null default true;
alter table public.store_settings add column if not exists updated_at timestamptz not null default now();
insert into public.store_settings (id, is_open) values (1, true) on conflict (id) do nothing;
alter table public.store_settings enable row level security;
drop policy if exists "Anyone can read store settings" on public.store_settings;
create policy "Anyone can read store settings" on public.store_settings for select to anon, authenticated using (true);
drop policy if exists "Admins can change store settings" on public.store_settings;
create policy "Admins can change store settings" on public.store_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.store_settings to anon, authenticated;
grant update on public.store_settings to authenticated;

-- Product photographs: public to view, only admins may upload or replace them.
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do nothing;
drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "Admins replace product images" on storage.objects;
create policy "Admins replace product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

-- The eight cloths the site launched with. Stock starts at 25m each: set the real figures in the admin portal.
insert into public.products (slug, name, price, category, stock, image_url, tone, weave, origin, occasions, colours, patterns, blurb, created_at) values
  ('royal-gold', 'Royal Gold', 5500, 'premium', 25, 'https://images.unsplash.com/photo-1660695828374-4ff51ac9df5d', 'gold', 'Sika Futuro', 'Hand-woven in Bonwire, Ashanti Region, Ghana', array['Weddings & engagements', 'Festivals & durbars']::text[], array['Gold', 'Green']::text[], array['Geometric blocks', 'Warp stripes']::text[], 'A Sika Futuro weave, "gold dust", named for its field of gold. Worn to say the wearer has arrived: bright, heavy and made for the engagement and the durbar.', '2026-09-28'),
  ('adinkra-wine', 'Adinkra Wine', 1200, 'budget', 25, 'https://images.unsplash.com/photo-1578509566163-068acd11b8e7', 'crimson', 'Adinkra print', 'Printed in Ghana on cotton', array['Everyday wear', 'Church & Sunday best']::text[], array['Red', 'Black']::text[], array['Printed']::text[], 'Adinkra symbols printed on deep red and black cotton, the colours of remembrance. A quiet, dignified cloth for Sunday service and everyday wear, and easy for a new tailor to sew.', '2026-07-12'),
  ('forest-pride', 'Forest Pride', 2800, 'standard', 25, 'https://images.unsplash.com/photo-1655682614757-a9a33fa45c93', 'forest', 'Asante warp stripe', 'Hand-woven in Bonwire, Ashanti Region, Ghana', array['Graduations', 'Festivals & durbars']::text[], array['Green', 'Gold', 'Black']::text[], array['Warp stripes']::text[], 'Green warp stripes for growth, edged in gold and steadied with black for maturity. A natural cloth for graduation stoles and the family photograph afterwards.', '2026-08-30'),
  ('indigo-crown', 'Indigo Crown', 9500, 'designer', 25, 'https://images.unsplash.com/photo-1734868032501-448d1457dc38', 'indigo', 'Emaa Da', 'Hand-woven in Adanwomase, Ashanti Region, Ghana', array['Weddings & engagements', 'Church & Sunday best']::text[], array['Indigo', 'Gold']::text[], array['Geometric blocks']::text[], 'An Emaa Da design, "it has not happened before", in indigo and gold. Blue for peace and love, gold for the occasion: a limited weave for the bride, the groom and the top table.', '2026-10-09'),
  ('ashanti-sunrise', 'Ashanti Sunrise', 2800, 'standard', 25, 'https://images.unsplash.com/photo-1660695828403-b42e117e0b4f', 'gold', 'Asante check', 'Hand-woven in Adanwomase, Ashanti Region, Ghana', array['Festivals & durbars', 'Naming ceremonies', 'Graduations']::text[], array['Gold', 'Red', 'Green']::text[], array['Woven checks']::text[], 'Gold, red and green checks, the colours most people picture when they think of kente. Joyful for naming days, festivals and every celebration in between.', '2026-06-18'),
  ('ewe-heritage', 'Ewe Heritage', 5500, 'premium', 25, 'https://images.unsplash.com/photo-1444362408440-274ecb6fc730', 'indigo', 'Ewe kente', 'Hand-woven in Agotime Kpetoe, Volta Region, Ghana', array['Weddings & engagements', 'Church & Sunday best']::text[], array['Gold', 'Green', 'Indigo']::text[], array['Ewe motifs']::text[], 'Ewe kente from the Volta Region, where weavers set small figures between the strips, often drawn from proverbs. Finer and softer in the hand, with a story in every panel.', '2026-09-05'),
  ('bonwire-classic', 'Bonwire Classic', 9500, 'designer', 25, 'https://images.unsplash.com/photo-1552710307-537199cd41c0', 'charcoal', 'Adweneasa', 'Hand-woven in Bonwire, Ashanti Region, Ghana', array['Graduations', 'Festivals & durbars']::text[], array['Gold', 'Red', 'Green']::text[], array['Geometric blocks', 'Woven checks']::text[], 'Adweneasa, "my skill is exhausted": a weave with a motif in every block, the weaver''s finest work. From the town that made kente famous, with a rich, heavy drape.', '2026-10-02'),
  ('akwaaba-bloom', 'Akwaaba Bloom', 1200, 'budget', 25, 'https://images.unsplash.com/photo-1784123476742-de48239d2fb0', 'forest', 'Kente-style print', 'Printed in Ghana on cotton', array['Naming ceremonies', 'Everyday wear', 'Church & Sunday best']::text[], array['Gold', 'Green']::text[], array['Printed']::text[], 'Akwaaba means welcome. A bright kente-style print in gold and green, light and cheerful for a new baby''s naming day, and kind to the budget for big family orders.', '2026-10-12')

on conflict (slug) do nothing;

-- Check: every column the site uses, with its type. price should be integer (pence), stock numeric (metres).
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name in ('products', 'store_settings', 'admin_users')
order by table_name, ordinal_position;
