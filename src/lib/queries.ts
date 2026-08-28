import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
  display_order: number;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  long_description: string | null;
  starting_price: number;
  compare_at_price: number | null;
  pricing_mode: string;
  main_image_url: string | null;
  side_view_url: string | null;
  closeup_url: string | null;
  installation_image_url: string | null;
  ai_visualization_url: string | null;
  suitable_for: string[];
  is_featured: boolean;
  display_order: number;
};

export type Material = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  long_description: string | null;
  suitable_for: string | null;
  base_rate: number;
  pricing_unit: string;
  thickness_options: string | null;
  image_url: string | null;
  display_order: number;
};

export type Finish = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  additional_cost: number;
  cost_type: string;
  image_url: string | null;
  display_order: number;
};

export type PricingRule = {
  id: string;
  name: string;
  base_price: number;
  size_multiplier: number;
  thickness_cost: number;
  painting_cost_per_sqft: number;
  installation_cost: number;
  delivery_cost: number;
  complexity_multiplier: number;
  minimum_price: number;
  range_margin_pct: number;
  product_id: string | null;
  material_id: string | null;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  caption: string | null;
  image_kind: string;
  source_type: string;
  display_order: number;
};

export type Installation = {
  id: string;
  project_name: string;
  city: string | null;
  size_label: string | null;
  material_label: string | null;
  finish_label: string | null;
  installed_on: string | null;
  before_image_url: string | null;
  after_image_url: string | null;
  final_image_url: string | null;
  is_featured: boolean;
};

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  staleTime: 5 * 60_000,
  queryFn: async () => {
    const res = await supabase.from("website_settings").select("key,value");
    const rows = unwrap<{ key: string; value: string | null }[]>(res);
    return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""])) as Record<string, string>;
  },
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () =>
    unwrap<Category[]>(
      await supabase
        .from("categories")
        .select("id,name,slug,subtitle,description,cover_image_url,display_order")
        .eq("status", "published")
        .order("display_order"),
    ),
});

const PRODUCT_FIELDS =
  "id,category_id,name,slug,short_description,long_description,starting_price,compare_at_price,pricing_mode,main_image_url,side_view_url,closeup_url,installation_image_url,ai_visualization_url,suitable_for,is_featured,display_order";

export const productsQuery = (categoryId?: string) =>
  queryOptions({
    queryKey: ["products", categoryId ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select(PRODUCT_FIELDS)
        .eq("status", "published")
        .order("display_order");
      if (categoryId) q = q.eq("category_id", categoryId);
      return unwrap<Product[]>(await q);
    },
  });

export const featuredProductsQuery = queryOptions({
  queryKey: ["products", "featured"],
  queryFn: async () =>
    unwrap<Product[]>(
      await supabase
        .from("products")
        .select(PRODUCT_FIELDS)
        .eq("status", "published")
        .eq("is_featured", true)
        .order("display_order"),
    ),
});

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await supabase
        .from("products")
        .select(PRODUCT_FIELDS)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return (res.data as Product | null) ?? null;
    },
  });

export const categoryQuery = (slug: string) =>
  queryOptions({
    queryKey: ["category", slug],
    queryFn: async () => {
      const res = await supabase
        .from("categories")
        .select("id,name,slug,subtitle,description,cover_image_url,display_order")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return (res.data as Category | null) ?? null;
    },
  });

export const productImagesQuery = (productId: string | undefined) =>
  queryOptions({
    queryKey: ["product-images", productId],
    enabled: Boolean(productId),
    queryFn: async () =>
      unwrap<ProductImage[]>(
        await supabase
          .from("product_images")
          .select("id,product_id,image_url,caption,image_kind,source_type,display_order")
          .eq("product_id", productId!)
          .order("display_order"),
      ),
  });

export const materialsQuery = queryOptions({
  queryKey: ["materials"],
  queryFn: async () =>
    unwrap<Material[]>(
      await supabase
        .from("materials")
        .select(
          "id,name,slug,short_description,long_description,suitable_for,base_rate,pricing_unit,thickness_options,image_url,display_order",
        )
        .eq("is_active", true)
        .order("display_order"),
    ),
});

export const finishesQuery = queryOptions({
  queryKey: ["finishes"],
  queryFn: async () =>
    unwrap<Finish[]>(
      await supabase
        .from("finishes")
        .select("id,name,slug,description,additional_cost,cost_type,image_url,display_order")
        .eq("is_active", true)
        .order("display_order"),
    ),
});

export const pricingRuleQuery = queryOptions({
  queryKey: ["pricing-rule"],
  queryFn: async () =>
    unwrap<PricingRule[]>(
      await supabase
        .from("pricing_rules")
        .select(
          "id,name,base_price,size_multiplier,thickness_cost,painting_cost_per_sqft,installation_cost,delivery_cost,complexity_multiplier,minimum_price,range_margin_pct,product_id,material_id",
        )
        .eq("is_active", true),
    ),
});

export const installationsQuery = queryOptions({
  queryKey: ["installations"],
  queryFn: async () =>
    unwrap<Installation[]>(
      await supabase
        .from("installations")
        .select(
          "id,project_name,city,size_label,material_label,finish_label,installed_on,before_image_url,after_image_url,final_image_url,is_featured",
        )
        .eq("status", "published")
        .order("created_at", { ascending: false }),
    ),
});

export async function logEvent(event_type: string, payload: Record<string, unknown> = {}) {
  try {
    await supabase.from("analytics_events").insert({
      event_type,
      product_id: (payload["product_id"] as string) ?? null,
      metadata: payload as never,
    });
  } catch {
    /* analytics is best-effort */
  }
}
