import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { PriceTag } from "@/components/site/PriceTag";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, productThicknesses, usePricing } from "@/lib/pricing";
import { logEvent, productsQuery, settingsQuery } from "@/lib/queries";
import { enquiryMessage, whatsappHref } from "@/components/site/brand";
import { notifyNewEnquiry } from "@/lib/notify.functions";
import { cn } from "@/lib/utils";

type Search = { product?: string | undefined; thickness?: number | undefined };

export const Route = createFileRoute("/quote")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const t = Number(search["thickness"]);
    return {
      product: typeof search["product"] === "string" ? search["product"] : undefined,
      thickness: search["thickness"] != null && Number.isFinite(t) ? t : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Get a Quotation — ARTINCITY Custom Devotional Wall Art" },
      {
        name: "description",
        content:
          "Choose your design and thickness and get the final price for your custom ARTINCITY wall sculpture.",
      },
      { property: "og:title", content: "Get a Quotation — ARTINCITY" },
      {
        property: "og:description",
        content: "Choose your design and thickness and get the final price instantly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuotePage,
});

const STEPS = ["Design & Thickness", "Price", "Enquiry"];

function QuotePage() {
  const search = Route.useSearch();
  const { data: allProducts = [] } = useQuery(productsQuery());
  const { data: settings } = useQuery(settingsQuery);
  const { priceFor } = usePricing();

  const products = allProducts.filter(
    (p) => p.size_sqft && p.size_sqft > 0 && productThicknesses(p).length > 0,
  );

  const [step, setStep] = useState(0);
  const [productSlug, setProductSlug] = useState(search.product);
  const [thickness, setThickness] = useState<number | undefined>(search.thickness);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    whatsapp: "",
    email: "",
    city: "",
    state: "",
    message: "",
  });

  const product = products.find((p) => p.slug === productSlug) ?? products[0];
  const opts = productThicknesses(product);
  const selThick = thickness != null && opts.includes(thickness) ? thickness : opts[0];
  const info = product && selThick != null ? priceFor(product, selThick) : null;

  async function submitEnquiry() {
    if (!form.full_name || !form.phone) {
      toast.error("Please add your name and mobile number.");
      return;
    }
    const { data: inserted, error } = await supabase
      .from("enquiries")
      .insert({
        product_id: product?.id ?? null,
        full_name: form.full_name,
        phone: form.phone,
        whatsapp: form.whatsapp || form.phone,
        email: form.email || null,
        city: form.city || null,
        state: form.state || null,
        thickness_mm: selThick ?? null,
        area_sqft: product?.size_sqft ?? null,
        estimated_price_min: info ? info.price : null,
        estimated_price_max: info ? info.price : null,
        message: form.message || null,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Something went wrong. Please try WhatsApp.");
      return;
    }

    void logEvent("enquiry_submitted", { product_id: product?.id });

    if (inserted?.id) {
      void notifyNewEnquiry({
        data: {
          enquiryId: inserted.id,
          fullName: form.full_name,
          phone: form.phone,
          city: form.city || null,
          product: product?.name ?? null,
          thickness: selThick ? `${selThick} mm` : null,
          estimate: info ? formatINR(info.price) : null,
          message: form.message || null,
          adminUrl: `${window.location.origin}/admin/enquiries/${inserted.id}`,
        },
      }).catch(() => {});
    }

    setSubmitted(true);
  }

  const waMessage = enquiryMessage({
    product: product?.name,
    thickness: selThick ? `${selThick} mm` : undefined,
    price: info ? formatINR(info.price) : undefined,
  });

  if (submitted) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-2xl px-5 py-40 text-center md:px-10">
          <h1 className="font-display text-4xl">Thank you.</h1>
          <p className="mt-5 text-muted-foreground">
            Your enquiry has been received. We'll contact you shortly with the final quotation.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={whatsappHref(settings?.["whatsapp_number"] ?? "8010129969", waMessage)}
              target="_blank"
              rel="noreferrer"
              className="bg-accent px-8 py-4 text-[0.66rem] tracking-[0.22em] text-accent-foreground uppercase"
            >
              Chat on WhatsApp
            </a>
            <Link
              to="/collections"
              className="border border-foreground/25 px-8 py-4 text-[0.66rem] tracking-[0.22em] uppercase"
            >
              Back to collection
            </Link>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-5 pt-32 pb-24 md:px-10 md:pt-44">
        <h1 className="font-display text-4xl sm:text-5xl">Let's Create Yours.</h1>

        <ol className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={cn(
                "text-[0.62rem] tracking-[0.2em] uppercase",
                i === step ? "text-accent" : "text-muted-foreground",
              )}
            >
              {i + 1} {s}
            </li>
          ))}
        </ol>

        <div className="mt-12 border-t border-border pt-10">
          {step === 0 && (
            <div>
              <h2 className="font-display text-2xl">Choose your design</h2>
              <div className="mt-6 flex gap-4 overflow-x-auto pb-3">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setProductSlug(p.slug);
                      setThickness(productThicknesses(p)[0]);
                    }}
                    className={cn(
                      "w-28 shrink-0 border p-1",
                      p.slug === product?.slug ? "border-accent" : "border-transparent",
                    )}
                  >
                    <img
                      src={p.images?.[0] || p.main_image_url || ""}
                      alt={p.name}
                      loading="lazy"
                      className="aspect-3/4 w-full object-cover"
                    />
                    <span className="mt-2 block text-[0.58rem] uppercase">{p.name}</span>
                  </button>
                ))}
              </div>

              <h2 className="font-display mt-10 text-2xl">Choose thickness</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {opts.map((t) => (
                  <button
                    key={t}
                    onClick={() => setThickness(t)}
                    className={cn(
                      "border px-5 py-3 text-[0.64rem] tracking-[0.18em] uppercase",
                      selThick === t ? "border-accent text-accent" : "border-border",
                    )}
                  >
                    {t} mm
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-display text-2xl">Your Price.</h2>
              <dl className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="eyebrow">Your Design</dt>
                  <dd className="mt-1">{product?.name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Thickness</dt>
                  <dd className="mt-1">{selThick ? `${selThick} mm` : "—"}</dd>
                </div>
              </dl>
              <div className="mt-10 surface-sand p-8">
                <p className="eyebrow">Final Price</p>
                <div className="mt-3">
                  {info ? (
                    <PriceTag info={info} />
                  ) : (
                    <p className="font-display text-3xl">Request final quotation</p>
                  )}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">Inclusive of all charges</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-display text-2xl">Bring This Design Home.</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["full_name", "Full Name"],
                    ["phone", "Mobile Number"],
                    ["whatsapp", "WhatsApp Number"],
                    ["email", "Email"],
                    ["city", "City"],
                    ["state", "State"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="text-sm">
                    {label}
                    <input
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="mt-2 w-full border border-border bg-card px-4 py-3"
                    />
                  </label>
                ))}
              </div>
              <label className="mt-4 block text-sm">
                Anything else you'd like us to know? (e.g. preferred size)
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  className="mt-2 w-full border border-border bg-card px-4 py-3"
                />
              </label>
              <button
                onClick={submitEnquiry}
                className="mt-8 bg-accent px-8 py-4 text-[0.66rem] tracking-[0.22em] text-accent-foreground uppercase"
              >
                Send My Enquiry
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 flex justify-between">
          <button
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="text-[0.64rem] tracking-[0.2em] text-muted-foreground uppercase disabled:opacity-30"
          >
            ← Back
          </button>
          {step < STEPS.length - 1 && (
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="border border-accent px-7 py-3 text-[0.64rem] tracking-[0.2em] text-accent uppercase"
            >
              Continue →
            </button>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
