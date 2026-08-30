import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { formatINR } from "@/lib/admin";

export const Route = createFileRoute("/admin/materials")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Materials — ARTINCITY Admin" },
      { name: "description", content: "Manage materials and their base rates." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Materials — ARTINCITY Admin" },
      { property: "og:description", content: "Manage materials and their base rates." },
    ],
  }),
  component: () => (
    <AdminShell title="Materials">
      <ResourceManager
        table="materials"
        singular="Material"
        orderBy="display_order"
        columns={[
          { key: "name", label: "Name" },
          {
            key: "base_rate",
            label: "Base rate",
            render: (row) => formatINR(Number(row["base_rate"] ?? 0)),
          },
          { key: "pricing_unit", label: "Unit" },
          { key: "is_active", label: "Active", render: (row) => (row["is_active"] ? "Yes" : "No") },
          { key: "display_order", label: "Order" },
        ]}
        defaults={{ is_active: true, pricing_unit: "per_sqft", base_rate: 0, display_order: 0 }}
        fields={[
          { key: "name", label: "Name", type: "text" },
          { key: "slug", label: "Slug", type: "slug" },
          { key: "short_description", label: "Short description", type: "textarea" },
          { key: "long_description", label: "Long description", type: "textarea" },
          { key: "suitable_for", label: "Suitable for", type: "text" },
          { key: "base_rate", label: "Base rate (₹)", type: "number" },
          {
            key: "pricing_unit",
            label: "Pricing unit",
            type: "select",
            options: [
              { value: "per_sqft", label: "Per sq.ft" },
              { value: "flat", label: "Flat" },
            ],
          },
          { key: "thickness_options", label: "Thickness options", type: "text" },
          { key: "image_url", label: "Image", type: "image" },
          { key: "is_active", label: "Active", type: "switch" },
          { key: "display_order", label: "Display order", type: "number" },
        ]}
      />
    </AdminShell>
  ),
});
