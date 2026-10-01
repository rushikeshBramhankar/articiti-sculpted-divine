import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/admin";
import { settingsQuery } from "@/lib/queries";
import { whatsappHref } from "@/components/site/brand";
import { notifyCustomRequest } from "@/lib/notify.functions";

export const Route = createFileRoute("/want-customization")({
  head: () => ({
    meta: [
      { title: "Want Customization? — ARTINCITY Custom 3D Wall Murals" },
      {
        name: "description",
        content: "Upload any design and ARTINCITY will recreate it as a handcrafted 3D wall mural for your home.",
      },
      { property: "og:title", content: "Want Customization? — ARTINCITY" },
      { property: "og:description", content: "Upload a design you'd like us to recreate as a 3D wall mural." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WantCustomizationPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  phone: z.string().trim().regex(/^[0-9+\s-]{7,20}$/, "Please enter a valid phone number"),
  email: z.union([z.literal(""), z.string().trim().email("Please enter a valid email").max(255)]),
});

const field = "mt-2 w-full border border-border bg-card px-4 py-3";

function WantCustomizationPage() {
  const { data: settings } = useQuery(settingsQuery);
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ height: "", width: "", name: "", phone: "", email: "" });

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (file.size > 15 * 1024 * 1024) { toast.error("Image must be under 15 MB"); return; }
    setUploading(true);
    try {
      setImageUrl(await uploadMedia(file, "custom-requests"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!imageUrl) { toast.error("Please upload an image of the design you want"); return; }
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Please check your details"); return; }
    const h = Number(form.height) > 0 ? Number(form.height) : null;
    const w = Number(form.width) > 0 ? Number(form.width) : null;
    setSending(true);
    const id = crypto.randomUUID();
    const { error } = await supabase.from("custom_requests").insert({
      id,
      image_url: imageUrl,
      height_ft: h,
      width_ft: w,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
    });
    setSending(false);
    if (error) { toast.error("Could not send your request. Please try again."); return; }
    void notifyCustomRequest({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        size: h && w ? `${h} ft x ${w} ft` : null,
        imageUrl,
        adminUrl: `${window.location.origin}/admin/custom-requests/${id}`,
      },
    }).catch(() => {});
    setDone(true);
  }

  const waMessage = [
    "Hi ArtInCity, I've sent a New Custom Design Request.",
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    form.height && form.width ? `Size: ${form.height} ft x ${form.width} ft` : null,
    imageUrl ? `Design image: ${imageUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <SiteShell>
      <section className="mx-auto max-w-2xl px-5 pt-32 pb-24 md:pt-40">
        <p className="eyebrow">Custom Design</p>
        <h1 className="font-display mt-3 text-4xl md:text-5xl">Want Customization?</h1>
        <p className="mt-4 text-muted-foreground">
          Upload a design you'd like us to recreate as a 3D wall mural.
        </p>

        {done ? (
          <div className="surface-sand mt-10 p-8">
            <h2 className="font-display text-2xl">Thank you — we've received your design.</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Our team will review it and contact you on WhatsApp shortly.
            </p>
            <a
              href={whatsappHref(settings?.["whatsapp_number"] ?? "8010129969", waMessage)}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block bg-accent px-7 py-4 text-[0.66rem] tracking-[0.22em] text-accent-foreground uppercase"
            >
              Message us on WhatsApp
            </a>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            <div className="text-sm">
              Post image of the design you want <span className="text-accent">*</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                aria-label="Post image of the design you want"
                className="hidden"
                onChange={(e) => void handleFile(e.target.files?.[0])}
              />
              {imageUrl ? (
                <div className="relative mt-2 inline-block">
                  <img src={imageUrl} alt="Your design" className="max-h-72 border border-border bg-secondary object-contain" />
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 rounded-full border border-border bg-background p-1"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 flex w-full flex-col items-center justify-center gap-2 border border-dashed border-border bg-card px-4 py-12 text-muted-foreground"
                >
                  {uploading ? <Loader2 className="size-6 animate-spin" /> : <Upload className="size-6" />}
                  {uploading ? "Uploading…" : "Tap to upload an image"}
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {(["height", "width"] as const).map((k) => (
                <label key={k} className="text-sm">
                  {k === "height" ? "Height (ft)" : "Width (ft)"}{" "}
                  <span className="text-muted-foreground">(optional)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className={field}
                  />
                </label>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                Full Name *
                <input value={form.name} maxLength={100} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
              </label>
              <label className="text-sm">
                Phone (WhatsApp) *
                <input type="tel" value={form.phone} maxLength={20} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} />
              </label>
              <label className="text-sm sm:col-span-2">
                Email <span className="text-muted-foreground">(optional)</span>
                <input type="email" value={form.email} maxLength={255} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} />
              </label>
            </div>

            <button
              onClick={() => void submit()}
              disabled={uploading || sending}
              className="bg-accent px-8 py-4 text-[0.66rem] tracking-[0.22em] text-accent-foreground uppercase disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send My Design"}
            </button>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
