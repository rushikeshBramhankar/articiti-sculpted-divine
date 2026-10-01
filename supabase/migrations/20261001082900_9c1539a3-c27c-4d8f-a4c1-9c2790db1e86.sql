CREATE TABLE public.custom_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  image_url text NOT NULL,
  height_ft numeric,
  width_ft numeric,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  status text NOT NULL DEFAULT 'new'
);
GRANT INSERT ON public.custom_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_requests TO authenticated;
GRANT ALL ON public.custom_requests TO service_role;
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone submit custom request" ON public.custom_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin read custom requests" ON public.custom_requests FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admin update custom requests" ON public.custom_requests FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin delete custom requests" ON public.custom_requests FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER t_custom_requests_updated BEFORE UPDATE ON public.custom_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "public upload custom request images" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = 'custom-requests');