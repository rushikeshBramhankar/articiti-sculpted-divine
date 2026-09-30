ALTER TABLE public.products ADD COLUMN IF NOT EXISTS height_ft numeric, ADD COLUMN IF NOT EXISTS width_ft numeric;
UPDATE public.products SET height_ft = 4, width_ft = 5 WHERE slug = 'peacock';
ALTER TABLE public.products DROP COLUMN size_sqft;
ALTER TABLE public.products ADD COLUMN size_sqft numeric GENERATED ALWAYS AS (height_ft * width_ft) STORED;