import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { db, formatDate } from "@/lib/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin/custom-requests/")({
  ssr: false,
  head: () => ({ meta: [{ title: "Custom Requests — ARTINCITY Admin" }, { name: "robots", content: "noindex" }] }),
  component: CustomRequestsPage,
});

export interface CustomRequest {
  id: string;
  created_at: string;
  image_url: string;
  height_ft: number | null;
  width_ft: number | null;
  name: string;
  phone: string;
  email: string | null;
  status: string;
}

export const CUSTOM_STATUSES = ["new", "contacted", "closed"] as const;

function CustomRequestsPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "custom-requests"],
    queryFn: async () => {
      const res = await db.from("custom_requests").select("*").order("created_at", { ascending: false });
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []) as CustomRequest[];
    },
  });

  return (
    <AdminShell title="Custom Requests">
      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Design</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7}>Loading…</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">No custom requests yet.</TableCell>
              </TableRow>
            ) : (
              data.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <img src={r.image_url} alt={`Design from ${r.name}`} className="size-14 rounded border border-border object-cover" />
                  </TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.phone}</TableCell>
                  <TableCell>{r.height_ft && r.width_ft ? `${r.height_ft} ft x ${r.width_ft} ft` : "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(r.created_at)}</TableCell>
                  <TableCell><Badge variant={r.status === "new" ? "default" : "secondary"}>{r.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Link to="/admin/custom-requests/$id" params={{ id: r.id }} className="text-accent text-sm font-medium hover:underline">View</Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </AdminShell>
  );
}
