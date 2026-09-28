CREATE TABLE public.thickness_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thickness_mm integer NOT NULL UNIQUE,
  rate_per_sqft numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.thickness_rates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.thickness_rates TO authenticated;
GRANT ALL ON public.thickness_rates TO service_role;
ALTER TABLE public.thickness_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read thickness rates" ON public.thickness_rates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write thickness rates" ON public.thickness_rates FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER t_thickness_rates_updated BEFORE UPDATE ON public.thickness_rates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.thickness_rates (thickness_mm, rate_per_sqft) VALUES (25,850),(50,1300),(75,1850),(100,2300);

ALTER TABLE public.products ADD COLUMN size_sqft numeric, ADD COLUMN thickness_options integer[] NOT NULL DEFAULT '{}';
ALTER TABLE public.enquiries ADD COLUMN thickness_mm integer;

INSERT INTO public.website_settings (key, value)
SELECT 'mrp_markup_pct', '40' WHERE NOT EXISTS (SELECT 1 FROM public.website_settings WHERE key='mrp_markup_pct');