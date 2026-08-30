import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { db, formatINR, formatDate, ENQUIRY_STATUSES } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/enquiries")({ ssr: false, head: () => ({ meta: [{ title: "Enquiries — ARTINCITY Admin" }, { name: "robots", content: "noindex" }] }), component: EnquiriesPage });

interface Enquiry {
  id: string;
  full_name: string;
  product_id: string | null;
  material_id: string | null;
  finish_id: string | null;
  city: string | null;
  area_sqft: number | null;
  size_preset: string | null;
  estimated_price_min: number | null;
  estimated_price_max: number | null;
  created_at: string;
  status: string;
  is_read: boolean;
  product?: { name: string; category_id: string };
  material?: { name: string };
  finish?: { name: string };
  category?: { name: string };
}

function EnquiriesPage() {
  const qc = useQueryClient();

  const { data: enquiries = [], isLoading } = useQuery({
    queryKey: ["admin", "enquiries"],
    queryFn: async () => {
      const res = await db
        .from("enquiries")
        .select("*, product:products(name,category_id), category:products(category:categories(name)), material:materials(name), finish:finishes(name)")
        .order("created_at", { ascending: false });
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []) as Enquiry[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await db.from("enquiries").update({ status }).eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "enquiries"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell title="Enquiries">
      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Finish</TableHead>
              <TableHead>Price Range</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10}>Loading…</TableCell>
              </TableRow>
            ) : enquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-muted-foreground text-center py-8">
                  No enquiries yet.
                </TableCell>
              </TableRow>
            ) : (
              enquiries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">
                    <Link to="/admin/enquiries/$id" params={{ id: e.id }} className="hover:underline">
                      {e.full_name}
                    </Link>
                  </TableCell>
                  <TableCell>{e.product?.name || "—"}</TableCell>
                  <TableCell>
                    {e.area_sqft ? `${e.area_sqft} sq.ft` : e.size_preset ? e.size_preset : "—"}
                  </TableCell>
                  <TableCell>{e.material?.name || "—"}</TableCell>
                  <TableCell>{e.finish?.name || "—"}</TableCell>
                  <TableCell>
                    {e.estimated_price_min && e.estimated_price_max
                      ? `${formatINR(e.estimated_price_min)} – ${formatINR(e.estimated_price_max)}`
                      : "—"}
                  </TableCell>
                  <TableCell>{e.city || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(e.created_at)}</TableCell>
                  <TableCell>
                    <Select
                      value={e.status}
                      onValueChange={(status) =>
                        updateStatusMutation.mutate({ id: e.id, status })
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ENQUIRY_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to="/admin/enquiries/$id"
                      params={{ id: e.id }}
                      className="text-accent hover:underline text-sm font-medium"
                    >
                      View
                    </Link>
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