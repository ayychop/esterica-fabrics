-- Paid card orders, written by the stripe-webhook function, which also takes the cloth off the shelf.
-- Run once in the Supabase SQL Editor, after the admin portal migration.

-- The table may already exist (it was first made by hand), so add whatever is missing.
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  stripe_session_id text not null,
  customer_email text,
  amount_total integer not null, -- in pence, as Stripe reports it
  status text not null default 'paid',
  created_at timestamptz not null default now()
);
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists status text not null default 'paid';
alter table public.orders add column if not exists created_at timestamptz not null default now();
-- What was bought: [{ "slug": "royal-gold", "metres": 2.5 }, ...]
alter table public.orders add column if not exists items jsonb not null default '[]';
-- Stripe can deliver one event more than once; one row per checkout session keeps that harmless.
create unique index if not exists orders_stripe_session_id_key on public.orders (stripe_session_id);

-- RLS on with no policies: the browser keys can neither read nor write orders.
alter table public.orders enable row level security;

-- Records a paid order and lowers stock in one transaction. A session already recorded changes
-- nothing and returns false, so a repeated webhook never takes the same cloth twice.
create or replace function public.record_paid_order(p_session_id text, p_email text, p_amount_total integer, p_items jsonb)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  inserted integer;
begin
  insert into public.orders (stripe_session_id, customer_email, amount_total, status, items)
  values (p_session_id, p_email, p_amount_total, 'paid', p_items)
  on conflict (stripe_session_id) do nothing;
  get diagnostics inserted = row_count;
  if inserted = 0 then
    return false;
  end if;

  -- Never below zero: two shoppers paying for the last metres at once leaves 0, not a negative.
  update public.products p
  set stock = greatest(p.stock - bought.metres, 0)
  from (
    select i->>'slug' as slug, sum((i->>'metres')::numeric) as metres
    from jsonb_array_elements(p_items) as i
    group by 1
  ) as bought
  where p.slug = bought.slug;
  return true;
end;
$$;

-- Only the webhook (service role) may call it.
revoke all on function public.record_paid_order(text, text, integer, jsonb) from public, anon, authenticated;
grant execute on function public.record_paid_order(text, text, integer, jsonb) to service_role;
