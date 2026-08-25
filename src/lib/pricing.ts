import type { Finish, Material, PricingRule, Product } from "./queries";

export type EstimateInput = {
  product: Product;
  material?: Material | null;
  finish?: Finish | null;
  areaSqft: number;
  installation: boolean;
  rules: PricingRule[];
};

export type Estimate = {
  min: number;
  max: number;
  breakdown: { label: string; value: number }[];
  exact: boolean;
};

export function pickRule(rules: PricingRule[], productId?: string, materialId?: string) {
  return (
    rules.find((r) => r.product_id === productId && r.material_id === materialId) ??
    rules.find((r) => r.product_id === productId && !r.material_id) ??
    rules.find((r) => !r.product_id && r.material_id === materialId) ??
    rules.find((r) => !r.product_id && !r.material_id) ??
    null
  );
}

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function calculateEstimate(input: EstimateInput): Estimate | null {
  const { product, material, finish, areaSqft, installation, rules } = input;
  const rule = pickRule(rules, product.id, material?.id);
  if (!rule || !material || areaSqft <= 0) return null;

  const perSqft = material.pricing_unit === "per_sqft" ? material.base_rate : 0;
  const materialCost = perSqft * areaSqft * rule.size_multiplier;
  const finishCost = finish
    ? finish.cost_type === "per_sqft"
      ? finish.additional_cost * areaSqft
      : finish.additional_cost
    : 0;
  const paintingCost = rule.painting_cost_per_sqft * areaSqft;
  const installCost = installation ? rule.installation_cost + rule.delivery_cost : 0;

  const subtotal =
    (rule.base_price + materialCost + rule.thickness_cost + finishCost + paintingCost + installCost) *
    rule.complexity_multiplier;

  const total = Math.max(subtotal, rule.minimum_price);
  const margin = rule.range_margin_pct / 100;

  return {
    min: total * (1 - margin),
    max: total * (1 + margin),
    exact: material.pricing_unit === "per_sqft" && product.pricing_mode === "per_sqft",
    breakdown: [
      { label: "Base design", value: rule.base_price },
      { label: `Material — ${material.name}`, value: materialCost },
      { label: finish ? `Finish — ${finish.name}` : "Finish", value: finishCost },
      { label: "Artist detailing", value: paintingCost },
      { label: "Installation & delivery", value: installCost },
    ],
  };
}
