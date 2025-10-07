-- Migração: múltiplas modalidades por imóvel (venda e aluguel)
-- Data: 2025-10-07

-- 1) Novas colunas
alter table public.properties
  add column if not exists is_for_sale boolean not null default false,
  add column if not exists is_for_rent boolean not null default false,
  add column if not exists price_sale numeric(12,2),
  add column if not exists price_rent numeric(12,2);

-- 2) Backfill a partir do modelo antigo (business + price)
update public.properties
set
  is_for_sale = coalesce(is_for_sale, false) or business = 'sale',
  is_for_rent = coalesce(is_for_rent, false) or business = 'rent',
  price_sale = coalesce(price_sale, case when business = 'sale' then price else price_sale end),
  price_rent = coalesce(price_rent, case when business = 'rent' then price else price_rent end)
where business in ('sale','rent');

-- 3) Índices úteis
create index if not exists idx_properties_is_for_sale on public.properties(is_for_sale) where is_for_sale = true;
create index if not exists idx_properties_is_for_rent on public.properties(is_for_rent) where is_for_rent = true;
