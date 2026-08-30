import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { formatINR } from "@/lib/admin";

export const Route = createFileRoute("/admin/finishes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Finishes — ARTINCITY Admin" },
      { name: "description", content: "Manage finishes and their additional cost." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Finishes — ARTINCITY Admin" },
      { property: "og:description", content: "Manage finishes and their additional cost." },
    ],
  }),
  component: () => (
    <AdminShell title="Finishes">
      <ResourceManager
        table="finishes"
        singular="Finish"
        orderBy="display_order"
        columns={[
          { key: "name", label: "Name" },
          {
            key: "additional_cost",
            label: "Additional cost",
            render: (row) => formatINR(Number(row["additional_cost"] ?? 0)),
          },
          { key: "cost_type", label: "Cost type" },
          { key: "is_active", label: "Active", render: (row) => (row["is_active"] ? "Yes" : "No") },
        ]}
        defaults={{ is_active: true, cost_type: "per_sqft", additional_cost: 0, display_order: 0 }}
        fields={[
          { key: "name", label: "Name", type: "text" },
          { key: "slug", label: "Slug", type: "slug" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "additional_cost", label: "Additional cost (₹)", type: "number" },
          {
            key: "cost_type",
            label: "Cost type",
            type: "select",
            options: [
              { value: "per_sqft", label: "Per sq.ft" },
              { value: "flat", label: "Flat" },
            ],
          },
          { key: "image_url", label: "Image", type: "image" },
          { key: "is_active", label: "Active", type: "switch" },
          { key: "display_order", label: "Display order", type: "number" },
        ]}
      />
    </AdminShell>
  ),
});
