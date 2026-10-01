import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { db, formatDate } from "@/lib/admin";
import { whatsappHref } from "@/components/site/brand";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CUSTOM_STATUSES, type CustomRequest } from "./admin.custom-requests.index";

export const Route = createFileRoute("/admin/custom-requests/$id")({
  ssr: false,
  head: () => ({ meta: [{ title: "Custom Request — ARTINCITY Admin" }, { name: "robots", content: "noindex" }] }),
  component: CustomRequestDetail,
});

function CustomRequestDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data: r } = useQuery({
    queryKey: ["admin", "custom-request", id],
    queryFn: async () => {
      const res = await db.from("custom_requests").select("*").eq("id", id).single();
      if (res.error) throw new Error(res.error.message);
      return res.data as CustomRequest;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await db.from("custom_requests").update({ status }).eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      toast.success("Status updated");
      void qc.invalidateQueries({ queryKey: ["admin", "custom-request", id] });
      void qc.invalidateQueries({ queryKey: ["admin", "custom-requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!r) return <AdminShell title="Loading…"><div>Loading…</div></AdminShell>;

  return (
    <AdminShell title={`Custom request from ${r.name}`}>
      <Link to="/admin/custom-requests" className="text-muted-foreground mb-4 inline-block text-sm hover:underline">← All custom requests</Link>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <p className="text-muted-foreground mb-3 text-xs tracking-wide uppercase">Uploaded design</p>
          <a href={r.image_url} target="_blank" rel="noreferrer">
            <img src={r.image_url} alt={`Design from ${r.name}`} className="bg-muted max-h-[70vh] w-full rounded object-contain" />
          </a>
          <a href={r.image_url} target="_blank" rel="noreferrer" className="text-accent mt-2 inline-block text-sm hover:underline">Open full image</a>
        </Card>
        <div className="space-y-6">
          <Card className="space-y-2 p-5 text-sm">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">Contact</p>
            <p><b>Name:</b> {r.name}</p>
            <p><b>Phone:</b> {r.phone}</p>
            <p><b>Email:</b> {r.email || "—"}</p>
            <p><b>Size:</b> {r.height_ft && r.width_ft ? `${r.height_ft} ft x ${r.width_ft} ft` : r.height_ft || r.width_ft ? `${r.height_ft ?? "?"} ft x ${r.width_ft ?? "?"} ft` : "Not provided"}</p>
            <p><b>Received:</b> {formatDate(r.created_at)}</p>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <a href={whatsappHref(r.phone, `Hi ${r.name}, thank you for your custom design request with ArtInCity.`)} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 size-4" /> WhatsApp customer
              </a>
            </Button>
          </Card>
          <Card className="space-y-3 p-5">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">Status</p>
            <Select value={r.status} onValueChange={(s) => statusMutation.mutate(s)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CUSTOM_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
