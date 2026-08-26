import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { db, formatDate, formatINR } from "@/lib/admin";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard — ARTICITI Admin" },
      { name: "description", content: "Business overview for the ARTICITI team." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Dashboard — ARTICITI Admin" },
      { property: "og:description", content: "Business overview for the ARTICITI team." },
    ],
  }),
  component: AdminHome,
});

type Enquiry = {
  id: string;
  full_name: string;
  city: string | null;
  status: string;
  is_read: boolean;
  estimated_price_max: number | null;
  created_at: string;
};

function AdminHome() {
  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [products, active, enquiries, orders] = await Promise.all([
        db.from("products").select("id", { count: "exact", head: true }),
        db
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),
        db.from("enquiries").select("id,status,estimated_price_max"),
        db.from("orders").select("id", { count: "exact", head: true }),
      ]);
      const rows = (enquiries.data ?? []) as {
        status: string;
        estimated_price_max: number | null;
      }[];
      return {
        products: products.count ?? 0,
        active: active.count ?? 0,
        newEnquiries: rows.filter((r) => r.status === "NEW").length,
        quotations: rows.filter((r) => r.status === "QUOTED").length,
        orders: orders.count ?? 0,
        value: rows.reduce((sum, r) => sum + (r.estimated_price_max ?? 0), 0),
      };
    },
  });

  const recent = useQuery({
    queryKey: ["admin", "recent-enquiries"],
    queryFn: async () => {
      const res = await db
        .from("enquiries")
        .select("id,full_name,city,status,is_read,estimated_price_max,created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []) as Enquiry[];
    },
  });

  const unread = (recent.data ?? []).filter((e) => !e.is_read).length;

  const cards = [
    { label: "Total Products", value: stats.data?.products ?? 0 },
    { label: "Active Products", value: stats.data?.active ?? 0 },
    { label: "New Enquiries", value: stats.data?.newEnquiries ?? 0 },
    { label: "Quotations", value: stats.data?.quotations ?? 0 },
    { label: "Orders", value: stats.data?.orders ?? 0 },
    { label: "Estimated Enquiry Value", value: formatINR(stats.data?.value ?? 0) },
  ];

  return (
    <AdminShell title="Dashboard">
      {unread > 0 ? (
        <div className="bg-accent/10 border-accent/40 mb-6 flex items-center justify-between rounded-md border px-4 py-3 text-sm">
          <span>
            {unread} new {unread === 1 ? "enquiry" : "enquiries"} received.
          </span>
          <Link to="/admin/enquiries" className="text-accent underline">
            View enquiries
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label} className="p-5">
            <p className="text-muted-foreground text-[0.65rem] tracking-[0.2em] uppercase">
              {card.label}
            </p>
            <p className="font-display mt-3 text-3xl">{card.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-5">
        <h2 className="font-display text-lg">Latest enquiries</h2>
        <div className="mt-4 divide-y divide-border">
          {(recent.data ?? []).map((e) => (
            <Link
              key={e.id}
              to="/admin/enquiries/$id"
              params={{ id: e.id }}
              className="hover:bg-muted/40 flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
            >
              <span className="font-medium">{e.full_name}</span>
              <span className="text-muted-foreground">{e.city ?? "—"}</span>
              <span className="text-muted-foreground">{formatINR(e.estimated_price_max)}</span>
              <Badge variant="outline">{e.status}</Badge>
              <span className="text-muted-foreground text-xs">{formatDate(e.created_at)}</span>
            </Link>
          ))}
          {recent.data?.length === 0 ? (
            <p className="text-muted-foreground py-3 text-sm">No enquiries yet.</p>
          ) : null}
        </div>
      </Card>
    </AdminShell>
  );
}
