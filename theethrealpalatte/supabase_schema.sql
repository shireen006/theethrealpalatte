-- ==============================================================================
-- THE ETHEREAL PALATTE: WHATSAPP-FIRST BOUTIQUE DATABASE SCHEMA (V3)
-- Role-based access control, persistent cloud cart, and admin-only product catalogue
-- Idempotent & safe: Does NOT delete existing customer data or drop existing tables.
-- ==============================================================================

-- 1. PROFILES & ROLE-BASED ACCESS CONTROL (RBAC)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure 'role' column exists if profiles table was created in an earlier migration
alter table public.profiles add column if not exists role text default 'customer' check (role in ('customer', 'admin'));

-- Enable Row Level Security (RLS) on profiles
alter table public.profiles enable row level security;

-- Helper security function: Check if current authenticated user has 'admin' role
-- SECURITY DEFINER ensures execution with table owner privileges.
-- Explicit auth.uid() null check and fixed search_path prevent privilege escalation.
-- Automatically recognizes verified store administrator email (syedashireen880@gmail.com).
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public, auth
stable
as $$
declare
  current_role text;
  jwt_email text;
begin
  if auth.uid() is null then
    return false;
  end if;

  -- 1. Direct JWT email verification for verified store administrator
  jwt_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if jwt_email = 'syedashireen880@gmail.com' then
    return true;
  end if;

  -- 2. Direct auth.users verification for verified store administrator
  if exists (
    select 1 from auth.users
    where id = auth.uid() and lower(email) = 'syedashireen880@gmail.com'
  ) then
    return true;
  end if;

  -- 3. Profiles table role verification
  select role into current_role
  from public.profiles
  where id = auth.uid();

  return coalesce(current_role = 'admin', false);
end;
$$;

-- RLS Policies for profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Remove recursive policies on profiles so is_admin() never triggers an infinite loop
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Prevent customers from changing their own role to 'admin' at the RLS policy level
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and (role = 'customer' or public.is_admin() = true)
  );

-- Database-level trigger to strictly prevent privilege escalation (cannot change role to 'admin' unless store owner or already admin)
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.role is distinct from OLD.role then
    if not public.is_admin() and lower(coalesce(NEW.email, '')) <> 'syedashireen880@gmail.com' then
      raise exception 'Unauthorized: Only store administrators can modify user roles.';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists tr_protect_profile_role on public.profiles;
create trigger tr_protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Automatic Profile Creation Trigger on Customer Registration
-- Automatically assigns 'admin' role to store administrator syedashireen880@gmail.com
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    case when lower(new.email) = 'syedashireen880@gmail.com' then 'admin' else 'customer' end,
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    role = case when lower(excluded.email) = 'syedashireen880@gmail.com' then 'admin' else public.profiles.role end,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. CART ITEMS TABLE (Persistent Cloud Shopping Cart)
-- ==============================================================================
create table if not exists public.cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id text not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint cart_items_user_product_key unique (user_id, product_id)
);

-- Enable Row Level Security (RLS) on cart_items
alter table public.cart_items enable row level security;

-- Policies for cart_items (Each customer can only access their own cart)
drop policy if exists "Users can view own cart items" on public.cart_items;
create policy "Users can view own cart items"
  on public.cart_items for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert into own cart" on public.cart_items;
create policy "Users can insert into own cart"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own cart items" on public.cart_items;
create policy "Users can update own cart items"
  on public.cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own cart items" on public.cart_items;
create policy "Users can delete own cart items"
  on public.cart_items for delete
  using (auth.uid() = user_id);


-- 3. PRODUCTS TABLE (Dynamic Boutique Catalogue & Inventory Control)
-- ==============================================================================
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric not null check (price >= 0),
  type text not null default 'Crochet' check (type in ('Crochet', 'Bloom Studio', 'Paintings', 'Accessories', 'Custom')),
  description text default '',
  image text default '',
  stock integer default 10 check (stock >= 0),
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on products
alter table public.products enable row level security;

-- Policies for products:
-- A. Anyone (customers and guests) can browse products
drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
  on public.products for select
  using (true);

-- B. ONLY verified store administrators can create new products
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  with check (
    public.is_admin() = true
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'syedashireen880@gmail.com'
    or exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- C. ONLY verified store administrators can update products
drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  using (
    public.is_admin() = true
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'syedashireen880@gmail.com'
    or exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  )
  with check (
    public.is_admin() = true
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'syedashireen880@gmail.com'
    or exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- D. ONLY verified store administrators can delete products
drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  using (
    public.is_admin() = true
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'syedashireen880@gmail.com'
    or exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );


-- 4. SUPABASE STORAGE BUCKET FOR PRODUCT IMAGES
-- ==============================================================================
-- Automatically create the public storage bucket 'product-images' if not already created
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Storage RLS Policies:
-- A. Anyone can view product images
drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- B. Only admins can upload product images
drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and (
      public.is_admin() = true
      or lower(coalesce(auth.jwt() ->> 'email', '')) = 'syedashireen880@gmail.com'
      or exists (
        select 1 from public.profiles
        where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
      )
    )
  );

-- C. Only admins can update product images
drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and (
      public.is_admin() = true
      or lower(coalesce(auth.jwt() ->> 'email', '')) = 'syedashireen880@gmail.com'
      or exists (
        select 1 from public.profiles
        where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
      )
    )
  );

-- D. Only admins can delete product images
drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and (
      public.is_admin() = true
      or lower(coalesce(auth.jwt() ->> 'email', '')) = 'syedashireen880@gmail.com'
      or exists (
        select 1 from public.profiles
        where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
      )
    )
  );


-- 5. INITIAL SEED DATA FOR PRODUCTS (Populates only if table is empty)
-- ==============================================================================
insert into public.products (name, price, type, description, stock, is_available)
select name, price, type, description, stock, is_available
from (values
  ('Crochet Sunflower Bouquet', 350, 'Crochet', 'Handmade sunshine, just for you. A cheerful crochet sunflower bouquet made with love.', 15, true),
  ('Crochet Flower Keychains', 130, 'Crochet', 'A tiny handmade flower for your everyday essentials. Perfect for keys, bags, or gifting. [Customization available.]', 25, true),
  ('Four Leaf Clover Keychain', 150, 'Crochet', 'A little handmade lucky charm. Carry a touch of luck wherever you go.', 20, true),
  ('Butterfly Hairtie', 250, 'Crochet', 'A delicate butterfly made to brighten your hairstyle. Handmade with soft crochet details.', 12, true),
  ('Crochet Bow Clip', 150, 'Crochet', 'A sweet handmade bow for your everyday look. Simple, delicate, and made with love.', 18, true),
  ('Blue Dream Bouquet', 199, 'Bloom Studio', 'A dreamy handcrafted blue flower bouquet with an elegant birthday card and delicate ribbon. Made slowly and thoughtfully with love.', 10, true),
  ('Crimson Lily Bouquet', 300, 'Bloom Studio', 'Handmade burgundy and white chenille flower bouquet finished with a soft pink ribbon. Made slowly and thoughtfully with love.', 8, true),
  ('Mini Forever Bouquet', 250, 'Bloom Studio', 'A delicate mini eternal bouquet crafted slowly and thoughtfully with love. An everlasting keepsake for someone special.', 14, true)
) as initial_data(name, price, type, description, stock, is_available)
where not exists (select 1 from public.products limit 1);


-- 6. PERMISSIONS & SCHEMA GRANTS
-- ==============================================================================
grant usage on schema public to anon, authenticated;

-- Public profiles: Only authenticated users may access their own profile. Anonymous users have NO access.
revoke all on table public.profiles from anon;
grant select, insert, update on table public.profiles to authenticated;

-- Cart items: Authenticated users only
revoke all on table public.cart_items from anon;
grant all on table public.cart_items to authenticated;

-- Products: Public catalog (read-only for anon, full permissions managed by RLS for authenticated)
grant select on table public.products to anon;
grant all on table public.products to authenticated;


-- 7. HELPER FUNCTION: STORE OWNER SELF-VERIFICATION RPC
-- ==============================================================================
create or replace function public.claim_admin_access()
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    return false;
  end if;

  if lower(coalesce(auth.jwt() ->> 'email', '')) = 'syedashireen880@gmail.com' or
     exists (select 1 from auth.users where id = auth.uid() and lower(email) = 'syedashireen880@gmail.com') then
    insert into public.profiles (id, email, full_name, role, created_at, updated_at)
    select 
      auth.uid(), 
      'syedashireen880@gmail.com',
      coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
      'admin',
      now(),
      now()
    from auth.users
    where id = auth.uid()
    on conflict (id) do update set 
      role = 'admin', 
      email = 'syedashireen880@gmail.com',
      updated_at = now();
    return true;
  end if;

  return false;
end;
$$;

grant execute on function public.is_admin() to authenticated, anon;
grant execute on function public.claim_admin_access() to authenticated;


-- ==============================================================================
-- IMMEDIATE SQL SCRIPT TO GRANT STORE ADMIN PRIVILEGES TO syedashireen880@gmail.com
-- Run this in your Supabase SQL Editor:
-- ==============================================================================
--
-- 1. Ensure profile exists and role is set to 'admin':
-- INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
-- SELECT id, email, coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 'admin', now(), now()
-- FROM auth.users
-- WHERE lower(email) = 'syedashireen880@gmail.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = now();
--
-- 2. Update existing profile record if already created:
-- UPDATE public.profiles
-- SET role = 'admin', updated_at = now()
-- WHERE lower(email) = 'syedashireen880@gmail.com';
-- ==============================================================================
