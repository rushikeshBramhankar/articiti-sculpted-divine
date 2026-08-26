import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { db, formatINR } from "@/lib/admin";

export const Route = createFileRoute("/admin/pricing")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Pricing Rules — ARTICITI Admin" },
      { name: "description", content: "Configure the engine behind public price estimates." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Pricing Rules — ARTICITI Admin" },
      {
        property: "og:description",
        content: "Configure the engine behind public price estimates.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const products = useQuery({
    queryKey: ["admin", "product-options"],
    queryFn: async () => {
      const res = await db.from("products").select("id,name").order("name");
      return ((res.data ?? []) as { id: string; name: string }[]).map((p) => ({
        value: p.id,
        label: p.name,
      }));
    },
  });
  const materials = useQuery({
    queryKey: ["admin", "material-options"],
    queryFn: async () => {
      const res = await db.from("materials").select("id,name").order("name");
      return ((res.data ?? []) as { id: string; name: string }[]).map((m) => ({
        value: m.id,
        label: m.name,
      }));
    },
  });

  return (
    <AdminShell title="Pricing Rules">
      <p className="text-muted-foreground mb-4 max-w-2xl text-sm">
        These rules drive the estimate shown in the public quotation wizard. A rule matching both
        product and material wins, then product-only, then material-only, then the global default.
      </p>
      <ResourceManager
        table="pricing_rules"
        singular="Pricing rule"
        orderBy="created_at"
        columns={[
          { key: "name", label: "Rule" },
          {
            key: "base_price",
            label: "Base",
            render: (row) => formatINR(Number(row["base_price"] ?? 0)),
          },
          { key: "size_multiplier", label: "Size ×" },
          { key: "complexity_multiplier", label: "Complexity ×" },
          {
            key: "minimum_price",
            label: "Minimum",
            render: (row) => formatINR(Number(row["minimum_price"] ?? 0)),
          },
          { key: "is_active", label: "Active", render: (row) => (row["is_active"] ? "Yes" : "No") },
        ]}
        defaults={{
          is_active: true,
          base_price: 0,
          size_multiplier: 1,
          thickness_cost: 0,
          painting_cost_per_sqft: 0,
          installation_cost: 0,
          delivery_cost: 0,
          complexity_multiplier: 1,
          minimum_price: 15000,
          range_margin_pct: 10,
        }}
        fields={[
          { key: "name", label: "Rule name", type: "text" },
          {
            key: "product_id",
            label: "Product (optional)",
            type: "select",
            options: products.data ?? [],
          },
          {
            key: "material_id",
            label: "Material (optional)",
            type: "select",
            options: materials.data ?? [],
          },
          { key: "base_price", label: "Base price (₹)", type: "number" },
          { key: "size_multiplier", label: "Size multiplier", type: "number" },
          { key: "thickness_cost", label: "Thickness adjustment (₹)", type: "number" },
          { key: "painting_cost_per_sqft", label: "Painting cost / sq.ft (₹)", type: "number" },
          { key: "installation_cost", label: "Installation cost (₹)", type: "number" },
          { key: "delivery_cost", label: "Delivery cost (₹)", type: "number" },
          { key: "complexity_multiplier", label: "Complexity multiplier", type: "number" },
          { key: "minimum_price", label: "Minimum order price (₹)", type: "number" },
          { key: "range_margin_pct", label: "Range margin %", type: "number" },
          { key: "is_active", label: "Active", type: "switch" },
        ]}
      />
    </AdminShell>
  );
}
