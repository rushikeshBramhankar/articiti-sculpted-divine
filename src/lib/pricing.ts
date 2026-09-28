import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery } from "./queries";

export const THICKNESS_OPTIONS = [25, 50, 75, 100] as const;
export const DEFAULT_MARKUP_PCT = 40;

export type ThicknessRate = { id: string; thickness_mm: number; rate_per_sqft: number };

export const thicknessRatesQuery = queryOptions({
  queryKey: ["thickness-rates"],
  staleTime: 5 * 60_000,
  queryFn: async () => {
    const res = await supabase
      .from("thickness_rates")
      .select("id,thickness_mm,rate_per_sqft")
      .order("thickness_mm");
    if (res.error) throw new Error(res.error.message);
    return (res.data ?? []) as ThicknessRate[];
  },
});

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export type PriceInfo = { thickness: number; price: number; mrp: number; off: number };

export function computePrice(
  sizeSqft: number | null | undefined,
  thickness: number,
  rates: ThicknessRate[],
  markupPct: number,
): PriceInfo | null {
  const rate = rates.find((r) => r.thickness_mm === thickness)?.rate_per_sqft;
  if (!sizeSqft || sizeSqft <= 0 || rate == null) return null;
  const price = Math.round(Number(sizeSqft) * Number(rate));
  const mrp = Math.ceil((price * (1 + markupPct / 100)) / 100) * 100;
  const off = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { thickness, price, mrp, off };
}

type Priceable = { size_sqft?: number | null; thickness_options?: number[] | null };

export function productThicknesses(p: Priceable | null | undefined) {
  return [...(p?.thickness_options ?? [])].sort((a, b) => a - b);
}

export function usePricing() {
  const { data: rates = [] } = useQuery(thicknessRatesQuery);
  const { data: settings } = useQuery(settingsQuery);
  const parsed = Number(settings?.["mrp_markup_pct"]);
  const markup = Number.isFinite(parsed) && settings?.["mrp_markup_pct"] ? parsed : DEFAULT_MARKUP_PCT;
  return {
    rates,
    markup,
    priceFor: (p: Priceable | null | undefined, thickness: number) =>
      computePrice(p?.size_sqft, thickness, rates, markup),
    lowestFor: (p: Priceable | null | undefined) => {
      const opts = productThicknesses(p)
        .map((t) => computePrice(p?.size_sqft, t, rates, markup))
        .filter((x): x is PriceInfo => x != null);
      return opts.sort((a, b) => a.price - b.price)[0] ?? null;
    },
  };
}
