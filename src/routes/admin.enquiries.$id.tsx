import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { db, formatINR, formatDate, ENQUIRY_STATUSES } from "@/lib/admin";
import { whatsappHref } from "@/components/site/brand";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/admin/enquiries/$id")({ ssr: false, head: () => ({ meta: [{ title: "Enquiry Detail — ARTICITI Admin" }, { name: "robots", content: "noindex" }] }), component: EnquiryDetailPage });

interface EnquiryDetail {
  id: string;
  full_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string | null;
  state: string | null;
  width_ft: number | null;
  height_ft: number | null;
  area_sqft: number | null;
  size_preset: string | null;
  wall_image_url: string | null;
  message: string | null;
  admin_notes: string | null;
  status: string;
  is_read: boolean;
  created_at: string;
  product_id: string | null;
  material_id: string | null;
  finish_id: string | null;
  estimated_price_min: number | null;
  estimated_price_max: number | null;
  installation_required: boolean;
  product?: { name: string; main_image_url: string };
  material?: { name: string };
  finish?: { name: string };
}

function EnquiryDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [notes, setNotes] = useState("");
  const [whatsappMsg, setWhatsappMsg] = useState("");

  const { data: enquiry } = useQuery({
    queryKey: ["admin", "enquiry", id],
    queryFn: async () => {
      const res = await db
        .from("enquiries")
        .select("*, product:products(name,main_image_url), material:materials(name), finish:finishes(name)")
        .eq("id", id)
        .single();
      if (res.error) throw new Error(res.error.message);
      return res.data as EnquiryDetail;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      const res = await db.from("enquiries").update({ is_read: true }).eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await db.from("enquiries").update({ status }).eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "enquiry", id] });
      toast.success("Status updated");
    },
  });

  const saveNotesMutation = useMutation({
    mutationFn: async () => {
      const res = await db.from("enquiries").update({ admin_notes: notes }).eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "enquiry", id] });
      toast.success("Notes saved");
    },
  });

  if (!enquiry) return <AdminShell title="Loading…"><div>Loading…</div></AdminShell>;

  const waHref = whatsappHref(enquiry.whatsapp || enquiry.phone, whatsappMsg || `Hi ${enquiry.full_name}, about your ${enquiry.product?.name} enquiry...`);

  return (
    <AdminShell title={`Enquiry from ${enquiry.full_name}`}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Name</p>
                <p className="mt-1 font-medium">{enquiry.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p>
                <p className="mt-1 font-medium">{enquiry.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">WhatsApp</p>
                <p className="mt-1 font-medium">{enquiry.whatsapp}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                <p className="mt-1 font-medium">{enquiry.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">City</p>
                <p className="mt-1 font-medium">{enquiry.city || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">State</p>
                <p className="mt-1 font-medium">{enquiry.state || "—"}</p>
              </div>
            </div>
          </Card>

          {/* Product Info */}
          {enquiry.product && (
            <Card className="p-5 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Selected Product</p>
              <div className="flex gap-4">
                {enquiry.product.main_image_url && (
                  <img
                    src={enquiry.product.main_image_url}
                    alt={enquiry.product.name}
                    className="size-20 rounded object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{enquiry.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Size: {enquiry.area_sqft ? `${enquiry.area_sqft} sq.ft` : enquiry.size_preset || "Custom"}
                  </p>
                  {enquiry.material && (
                    <p className="text-sm text-muted-foreground">Material: {enquiry.material.name}</p>
                  )}
                  {enquiry.finish && (
                    <p className="text-sm text-muted-foreground">Finish: {enquiry.finish.name}</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Message */}
          {enquiry.message && (
            <Card className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Customer Message</p>
              <p className="mt-2 text-sm">{enquiry.message}</p>
            </Card>
          )}

          {/* Admin Notes */}
          <Card className="p-5 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Admin Notes</p>
            <Textarea
              value={notes || enquiry.admin_notes || ""}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes..."
              rows={4}
            />
            <Button
              size="sm"
              onClick={() => saveNotesMutation.mutate()}
              disabled={saveNotesMutation.isPending}
            >
              Save Notes
            </Button>
          </Card>
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Estimated Price</p>
            <p className="font-display text-2xl">
              {enquiry.estimated_price_min && enquiry.estimated_price_max
                ? `${formatINR(enquiry.estimated_price_min)} – ${formatINR(enquiry.estimated_price_max)}`
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Installation: {enquiry.installation_required ? "Yes" : "No"}</p>
            <p className="text-xs text-muted-foreground">Received: {formatDate(enquiry.created_at)}</p>
          </Card>

          <Card className="p-5 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
            <Select value={enquiry.status} onValueChange={(s) => updateStatusMutation.mutate(s)}>
              <SelectTrigger>
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
          </Card>

          <Card className="p-5 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">WhatsApp Message</p>
            <Textarea
              value={whatsappMsg}
              onChange={(e) => setWhatsappMsg(e.target.value)}
              placeholder="Edit message before sending..."
              rows={4}
            />
            <a href={waHref} target="_blank" rel="noreferrer" className="block">
              <Button className="w-full" size="sm">
                <MessageCircle className="mr-2 size-4" /> Open WhatsApp
              </Button>
            </a>
          </Card>

          <Card className="p-5 space-y-3">
            <a
              href={`mailto:${enquiry.email}?subject=Your ARTICITI Enquiry&body=Hi ${enquiry.full_name},%0A%0AThank you for your enquiry regarding ${enquiry.product?.name || "our products"}.%0A%0ABest regards,%0AARTICIT%0A`}
              className="block"
            >
              <Button variant="outline" className="w-full" size="sm">
                <Mail className="mr-2 size-4" /> Send Email
              </Button>
            </a>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}