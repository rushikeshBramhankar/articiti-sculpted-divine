
-- roles
create type public.app_role as enum ('admin','editor','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'admin')
$$;

create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  subtitle text,
  description text,
  cover_image_url text,
  status text not null default 'published',
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- materials
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  long_description text,
  suitable_for text,
  base_rate numeric not null default 0,
  pricing_unit text not null default 'per_sqft',
  thickness_options text,
  image_url text,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- finishes
create table public.finishes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  additional_cost numeric not null default 0,
  cost_type text not null default 'per_sqft',
  image_url text,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text,
  long_description text,
  starting_price numeric not null default 15000,
  pricing_mode text not null default 'per_sqft',
  main_image_url text,
  side_view_url text,
  closeup_url text,
  installation_image_url text,
  ai_visualization_url text,
  video_url text,
  suitable_for text[] not null default '{}',
  status text not null default 'published',
  is_featured boolean not null default false,
  display_order int not null default 0,
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  caption text,
  image_kind text not null default 'gallery',
  source_type text not null default 'ai_visualization',
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.product_materials (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  rate_override numeric,
  recommended_thickness text,
  unique (product_id, material_id)
);

create table public.product_finishes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  finish_id uuid not null references public.finishes(id) on delete cascade,
  cost_override numeric,
  unique (product_id, finish_id)
);

create table public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  product_id uuid references public.products(id) on delete cascade,
  material_id uuid references public.materials(id) on delete cascade,
  base_price numeric not null default 0,
  size_multiplier numeric not null default 1,
  thickness_cost numeric not null default 0,
  painting_cost_per_sqft numeric not null default 0,
  installation_cost numeric not null default 0,
  delivery_cost numeric not null default 0,
  complexity_multiplier numeric not null default 1,
  minimum_price numeric not null default 15000,
  range_margin_pct numeric not null default 10,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  whatsapp text,
  email text,
  city text,
  state text,
  status text not null default 'lead',
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  full_name text not null,
  phone text not null,
  whatsapp text,
  email text,
  city text,
  state text,
  width_ft numeric,
  height_ft numeric,
  area_sqft numeric,
  size_preset text,
  material_id uuid references public.materials(id) on delete set null,
  finish_id uuid references public.finishes(id) on delete set null,
  installation_required boolean not null default true,
  estimated_price_min numeric,
  estimated_price_max numeric,
  wall_image_url text,
  message text,
  status text not null default 'NEW',
  admin_notes text,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid references public.enquiries(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  order_value numeric,
  status text not null default 'ENQUIRY',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.installations (
  id uuid primary key default gen_random_uuid(),
  project_name text not null,
  city text,
  product_id uuid references public.products(id) on delete set null,
  size_label text,
  material_label text,
  finish_label text,
  installed_on date,
  before_image_url text,
  after_image_url text,
  final_image_url text,
  video_url text,
  is_featured boolean not null default false,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text,
  media_type text not null default 'image',
  source_type text not null default 'ai_visualization',
  product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.website_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text,
  updated_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  product_id uuid references public.products(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- grants
grant select on public.categories, public.materials, public.finishes, public.products,
  public.product_images, public.product_materials, public.product_finishes,
  public.pricing_rules, public.installations, public.media, public.website_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.materials, public.finishes, public.products,
  public.product_images, public.product_materials, public.product_finishes,
  public.pricing_rules, public.installations, public.media, public.website_settings to authenticated;
grant select, insert, update, delete on public.customers, public.enquiries, public.orders to authenticated;
grant insert on public.enquiries to anon;
grant insert on public.analytics_events to anon, authenticated;
grant select, update, delete on public.analytics_events to authenticated;
grant all on public.categories, public.materials, public.finishes, public.products,
  public.product_images, public.product_materials, public.product_finishes, public.pricing_rules,
  public.customers, public.enquiries, public.orders, public.installations, public.media,
  public.website_settings, public.analytics_events to service_role;

-- RLS
alter table public.categories enable row level security;
alter table public.materials enable row level security;
alter table public.finishes enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_materials enable row level security;
alter table public.product_finishes enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.customers enable row level security;
alter table public.enquiries enable row level security;
alter table public.orders enable row level security;
alter table public.installations enable row level security;
alter table public.media enable row level security;
alter table public.website_settings enable row level security;
alter table public.analytics_events enable row level security;

create policy "public read categories" on public.categories for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy "admin write categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read materials" on public.materials for select to anon, authenticated using (is_active or public.is_admin());
create policy "admin write materials" on public.materials for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read finishes" on public.finishes for select to anon, authenticated using (is_active or public.is_admin());
create policy "admin write finishes" on public.finishes for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read products" on public.products for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy "admin write products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read product images" on public.product_images for select to anon, authenticated using (true);
create policy "admin write product images" on public.product_images for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read product materials" on public.product_materials for select to anon, authenticated using (true);
create policy "admin write product materials" on public.product_materials for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read product finishes" on public.product_finishes for select to anon, authenticated using (true);
create policy "admin write product finishes" on public.product_finishes for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read pricing rules" on public.pricing_rules for select to anon, authenticated using (is_active or public.is_admin());
create policy "admin write pricing rules" on public.pricing_rules for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read installations" on public.installations for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy "admin write installations" on public.installations for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read media" on public.media for select to anon, authenticated using (true);
create policy "admin write media" on public.media for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read settings" on public.website_settings for select to anon, authenticated using (true);
create policy "admin write settings" on public.website_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "anyone submit enquiry" on public.enquiries for insert to anon, authenticated with check (true);
create policy "admin read enquiries" on public.enquiries for select to authenticated using (public.is_admin());
create policy "admin update enquiries" on public.enquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete enquiries" on public.enquiries for delete to authenticated using (public.is_admin());

create policy "admin manage customers" on public.customers for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manage orders" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "anyone log events" on public.analytics_events for insert to anon, authenticated with check (true);
create policy "admin read events" on public.analytics_events for select to authenticated using (public.is_admin());
create policy "admin manage events" on public.analytics_events for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete events" on public.analytics_events for delete to authenticated using (public.is_admin());

create trigger t_categories_updated before update on public.categories for each row execute function public.update_updated_at_column();
create trigger t_products_updated before update on public.products for each row execute function public.update_updated_at_column();
create trigger t_materials_updated before update on public.materials for each row execute function public.update_updated_at_column();
create trigger t_finishes_updated before update on public.finishes for each row execute function public.update_updated_at_column();
create trigger t_enquiries_updated before update on public.enquiries for each row execute function public.update_updated_at_column();
create trigger t_customers_updated before update on public.customers for each row execute function public.update_updated_at_column();
create trigger t_orders_updated before update on public.orders for each row execute function public.update_updated_at_column();
create trigger t_installations_updated before update on public.installations for each row execute function public.update_updated_at_column();
create trigger t_pricing_updated before update on public.pricing_rules for each row execute function public.update_updated_at_column();

-- seed
insert into public.categories (name, slug, subtitle, description, display_order) values
('Shri Krishna','krishna','Grace • Music • Serenity','Timeless devotion interpreted through contemporary architectural art.',1),
('Mahadev','mahadev','Power • Stillness • Transformation','Sculptural stillness for spaces that hold quiet strength.',2),
('Ganpati Bappa','ganpati','Wisdom • Prosperity • Auspiciousness','Auspicious beginnings, sculpted into your walls.',3),
('Bajrang Bali','hanuman','Strength • Devotion • Courage','Devotional strength reimagined as architectural relief.',4);

insert into public.materials (name, slug, short_description, long_description, suitable_for, base_rate, pricing_unit, thickness_options, display_order) values
('Premium Sculptural','premium-sculptural','Our most dimensional option for high-detail artwork.','A composite sculptural build used for artwork with deep relief and fine detailing.','High-detail dimensional artwork',1400,'per_sqft','Design dependent',1),
('HDHMR','hdhmr','Strong and suitable for detailed architectural work.','A dense engineered board widely used for detailed architectural wall pieces.','Detailed architectural work',950,'per_sqft','25mm / 50mm / 75mm',2),
('Gypsum / POP','gypsum-pop','Excellent detailing, economical for selected applications.','Allows intricate detailing for selected sculptural applications.','Intricate detailing, selected applications',700,'per_sqft','Design dependent',3),
('MDF','mdf','Suitable for selected decorative wall applications.','A smooth engineered board suited to selected decorative wall work.','Decorative wall applications',600,'per_sqft','18mm / 25mm',4),
('FRP / Fibre','frp-fibre','For lightweight or specialised requirements.','Lightweight fibre build used for specialised or large-format requirements.','Lightweight or specialised requirements',1200,'per_sqft','Custom',5),
('Custom','custom','Specialised requirements, quoted individually.','For requirements outside our standard material set.','Specialised requirements',0,'custom','Custom',6);

insert into public.finishes (name, slug, description, additional_cost, display_order) values
('Stone White','stone-white','A calm matte stone-like surface.',120,1),
('Antique','antique','Aged, warm depth with subtle shading.',180,2),
('Gold Accent','gold-accent','Muted brushed gold highlights on selected detail.',260,3),
('Metallic','metallic','Brushed metallic sheen with soft reflectivity.',240,4),
('Artist Painted','artist-painted','Hand detailed and painted by our artists.',400,5),
('Custom Finish','custom-finish','Finish developed to your requirement.',0,6);

insert into public.pricing_rules (name, base_price, size_multiplier, thickness_cost, painting_cost_per_sqft, installation_cost, delivery_cost, complexity_multiplier, minimum_price, range_margin_pct)
values ('Default Estimate Rule', 6000, 1, 0, 150, 3500, 1200, 1, 15000, 10);

insert into public.products (category_id, name, slug, short_description, long_description, starting_price, suitable_for, is_featured, display_order)
select c.id, p.name, p.slug, p.sd, p.ld, p.price, p.sf, p.feat, p.ord
from (values
 ('krishna','Krishna Playing Flute','krishna-flute','Serene relief of the divine flautist.','A dimensional relief capturing stillness and music in a single composition.',15000,array['Living Room','Mandir','Feature Wall'],true,1),
 ('krishna','Krishna & Radha','krishna-radha','Two figures, one eternal composition.','A contemporary sculptural interpretation of Radha and Krishna, designed for feature walls.',15000,array['Living Room','Mandir','Feature Wall','Entrance'],true,2),
 ('krishna','Standing Krishna','krishna-standing','A tall, architectural devotional presence.','A vertical composition suited to narrow feature and entrance walls.',15000,array['Entrance','Mandir'],false,3),
 ('krishna','Krishna Hand & Flute','krishna-hand-flute','Minimal, abstract, deeply evocative.','A minimal sculptural detail for contemporary interiors.',15000,array['Living Room','Office'],false,4),
 ('mahadev','Mahadev in Meditation','mahadev-meditation','Stillness sculpted into stone-like relief.','A meditative composition designed to anchor a large wall with calm presence.',15000,array['Living Room','Mandir','Feature Wall'],true,5),
 ('ganpati','Contemporary Ganpati Relief','ganpati-relief','Auspicious geometry, modern lines.','A clean, contemporary Ganpati relief for entrances and mandir walls.',15000,array['Entrance','Mandir'],true,6),
 ('hanuman','Bajrang Bali Relief','hanuman-relief','Strength rendered in dimensional detail.','A powerful relief composition with deep shadow and architectural detailing.',15000,array['Living Room','Feature Wall'],false,7)
) as p(cat,name,slug,sd,ld,price,sf,feat,ord)
join public.categories c on c.slug = p.cat;

insert into public.product_materials (product_id, material_id)
select p.id, m.id from public.products p cross join public.materials m where m.slug in ('premium-sculptural','hdhmr','gypsum-pop','frp-fibre','custom');

insert into public.product_finishes (product_id, finish_id)
select p.id, f.id from public.products p cross join public.finishes f;

insert into public.website_settings (key, value) values
('brand_name','ARTICITI'),
('tagline','Divinity, Sculpted for Your Space.'),
('supporting_line','Custom 3D devotional wall art designed for modern Indian homes.'),
('whatsapp_number','8010129969'),
('instagram_url','https://www.instagram.com/interior_by_veera/'),
('contact_email','rushikeshbramhankar.dev@gmail.com'),
('footer_text','Divinity, Sculpted for Your Space.'),
('hero_heading','DIVINITY, SCULPTED FOR YOUR SPACE.'),
('hero_subheading','Custom 3D devotional wall art designed to transform modern Indian homes.'),
('hero_note','Custom Sizes • Multiple Materials • Artist Finished'),
('hero_image_url','');
