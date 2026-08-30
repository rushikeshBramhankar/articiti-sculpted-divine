import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { db, formatDate } from "@/lib/admin";
import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/admin/customers")({ ssr: false, head: () => ({ meta: [{ title: "Customers — ARTINCITY Admin" }, { name: "robots", content: "noindex" }] }), component: CustomersPage });

interface CustomerWithStats {
  id: string;
  full_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string | null;
  last_contacted_at: string | null;
  enquiry_count: number;
  order_count: number;
}

function CustomersPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const res = await db.from("customers").select("*").order("full_name");
      if (res.error) throw new Error(res.error.message);
      
      const custs = (res.data ?? []) as any[];
      
      // Get stats for each
      const withStats = await Promise.all(
        custs.map(async (c) => {
          const [enqs, ords] = await Promise.all([
            db.from("enquiries").select("id", { count: "exact", head: true }).eq("customer_id", c.id),
            db.from("orders").select("id", { count: "exact", head: true }).eq("customer_id", c.id),
          ]);
          return { ...c, enquiry_count: enqs.count ?? 0, order_count: ords.count ?? 0 };
        })
      );
      return withStats as CustomerWithStats[];
    },
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  
  const { data: customerEnquiries = [] } = useQuery({
    queryKey: ["admin", "customer-enquiries", selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return [];
      const res = await db
        .from("enquiries")
        .select("id,full_name,status,created_at,estimated_price_max")
        .eq("customer_id", selectedCustomerId)
        .order("created_at", { ascending: false });
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
    enabled: !!selectedCustomerId,
  });

  const { data: customerOrders = [] } = useQuery({
    queryKey: ["admin", "customer-orders", selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return [];
      const res = await db
        .from("orders")
        .select("id,status,order_value,created_at")
        .eq("customer_id", selectedCustomerId)
        .order("created_at", { ascending: false });
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
    enabled: !!selectedCustomerId,
  });

  return (
    <AdminShell title="Customers">
      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Enquiries</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Last Contacted</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8}>Loading…</TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground text-center py-8">
                  No customers yet.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.full_name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell className="text-sm">{customer.email}</TableCell>
                  <TableCell>{customer.city || "—"}</TableCell>
                  <TableCell className="text-center font-semibold">{customer.enquiry_count}</TableCell>
                  <TableCell className="text-center font-semibold">{customer.order_count}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {customer.last_contacted_at ? formatDate(customer.last_contacted_at) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCustomerId(customer.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={!!selectedCustomerId} onOpenChange={(open) => !open && setSelectedCustomerId(null)}>
        <SheetContent className="max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedCustomer?.full_name}</SheetTitle>
            <SheetDescription>
              {selectedCustomer?.phone} • {selectedCustomer?.email}
            </SheetDescription>
          </SheetHeader>

          {selectedCustomer && (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">WhatsApp</p>
                  <p className="mt-1 font-medium">{selectedCustomer.whatsapp}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">City</p>
                  <p className="mt-1 font-medium">{selectedCustomer.city || "—"}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Enquiries ({customerEnquiries.length})</h3>
                <div className="space-y-2">
                  {customerEnquiries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No enquiries</p>
                  ) : (
                    customerEnquiries.map((e: any) => (
                      <Link
                        key={e.id}
                        to="/admin/enquiries/$id"
                        params={{ id: e.id }}
                        className="block p-2 border rounded hover:bg-muted text-sm"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{e.full_name}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(e.created_at)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Status: {e.status}</div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Orders ({customerOrders.length})</h3>
                <div className="space-y-2">
                  {customerOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No orders</p>
                  ) : (
                    customerOrders.map((o: any) => (
                      <Link
                        key={o.id}
                        to="/admin/orders"
                        className="block p-2 border rounded hover:bg-muted text-sm"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Order {o.id.slice(0, 8)}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(o.created_at)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Status: {o.status}</div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminShell>
  );
}