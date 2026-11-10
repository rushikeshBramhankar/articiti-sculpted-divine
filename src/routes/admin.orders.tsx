import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { db, formatINR, ORDER_STATUSES } from "@/lib/admin";

export const Route = createFileRoute("/admin/orders")({
  ssr: false,
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Orders — Interior by Veera Admin" },
      { name: "twitter:description", content: "Track orders from enquiry to installation." },

      { title: "Orders — Interior by Veera Admin" },
      { name: "description", content: "Track orders from enquiry to installation." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Orders — Interior by Veera Admin" },
      { property: "og:description", content: "Track orders from enquiry to installation." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const options = useQuery({
    queryKey: ["admin", "order-options"],
    queryFn: async () => {
      const [customers, products] = await Promise.all([
        db.from("customers").select("id,full_name").order("full_name"),
        db.from("products").select("id,name").order("name"),
      ]);
      return {
        customers: ((customers.data ?? []) as { id: string; full_name: string }[]).map((c) => ({
          value: c.id,
          label: c.full_name,
        })),
        products: ((products.data ?? []) as { id: string; name: string }[]).map((p) => ({
          value: p.id,
          label: p.name,
        })),
      };
    },
  });

  return (
    <AdminShell title="Orders">
      <ResourceManager
        table="orders"
        singular="Order"
        orderBy="created_at"
        ascending={false}
        columns={[
          { key: "status", label: "Status" },
          {
            key: "order_value",
            label: "Value",
            render: (row) => formatINR(row["order_value"] as number | null),
          },
          { key: "notes", label: "Notes" },
        ]}
        defaults={{ status: "ENQUIRY" }}
        fields={[
          {
            key: "customer_id",
            label: "Customer",
            type: "select",
            options: options.data?.customers ?? [],
          },
          {
            key: "product_id",
            label: "Product",
            type: "select",
            options: options.data?.products ?? [],
          },
          { key: "order_value", label: "Order value (₹)", type: "number" },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: ORDER_STATUSES.map((s) => ({ value: s, label: s })),
          },
          { key: "notes", label: "Notes", type: "textarea" },
        ]}
      />
    </AdminShell>
  );
}
