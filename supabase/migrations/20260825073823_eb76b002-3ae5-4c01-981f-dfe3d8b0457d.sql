
drop policy "public read categories" on public.categories;
create policy "anon read categories" on public.categories for select to anon using (status='published');
create policy "auth read categories" on public.categories for select to authenticated using (status='published' or public.is_admin());

drop policy "public read materials" on public.materials;
create policy "anon read materials" on public.materials for select to anon using (is_active);
create policy "auth read materials" on public.materials for select to authenticated using (is_active or public.is_admin());

drop policy "public read finishes" on public.finishes;
create policy "anon read finishes" on public.finishes for select to anon using (is_active);
create policy "auth read finishes" on public.finishes for select to authenticated using (is_active or public.is_admin());

drop policy "public read products" on public.products;
create policy "anon read products" on public.products for select to anon using (status='published');
create policy "auth read products" on public.products for select to authenticated using (status='published' or public.is_admin());

drop policy "public read pricing rules" on public.pricing_rules;
create policy "anon read pricing rules" on public.pricing_rules for select to anon using (is_active);
create policy "auth read pricing rules" on public.pricing_rules for select to authenticated using (is_active or public.is_admin());

drop policy "public read installations" on public.installations;
create policy "anon read installations" on public.installations for select to anon using (status='published');
create policy "auth read installations" on public.installations for select to authenticated using (status='published' or public.is_admin());

revoke execute on function public.is_admin() from anon;
revoke execute on function public.has_role(uuid, public.app_role) from anon;
