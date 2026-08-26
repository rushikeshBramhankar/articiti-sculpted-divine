import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { calculateEstimate, formatINR } from "@/lib/pricing";
import {
  finishesQuery,
  logEvent,
  materialsQuery,
  pricingRuleQuery,
  productsQuery,
  settingsQuery,
} from "@/lib/queries";
import { enquiryMessage, whatsappHref } from "@/components/site/brand";
import { cn } from "@/lib/utils";

type Search = { product?: string | undefined };

export const Route = createFileRoute("/quote")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    product: typeof search["product"] === "string" ? search["product"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Get a Quotation — ARTICITI Custom Devotional Wall Art" },
      {
        name: "description",
        content:
          "Enter your wall size, choose a material and finish, and get an estimated price range for your custom ARTICITI wall sculpture.",
      },
      { property: "og:title", content: "Get a Quotation — ARTICITI" },
      {
        property: "og:description",
        content: "Estimate your custom devotional wall sculpture in a few steps.",
      },
    ],
  }),
  component: QuotePage,
});

const STEPS = ["Size", "Material", "Finish", "Estimate", "Enquiry"];

function QuotePage() {
  const search = Route.useSearch();
  const { data: products = [] } = useQuery(productsQuery());
  const { data: materials = [] } = useQuery(materialsQuery);
  const { data: finishes = [] } = useQuery(finishesQuery);
  const { data: rules = [] } = useQuery(pricingRuleQuery);
  const { data: settings } = useQuery(settingsQuery);

  const [step, setStep] = useState(0);
  const [productSlug, setProductSlug] = useState(search.product);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [preset, setPreset] = useState<string | null>(null);
  const [materialId, setMaterialId] = useState<string | null>(null);
  const [recommend, setRecommend] = useState(false);
  const [finishId, setFinishId] = useState<string | null>(null);
  const [installation, setInstallation] = useState(true);
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
  const material = materials.find((m) => m.id === materialId) ?? null;
  const finish = finishes.find((f) => f.id === finishId) ?? null;

  const presetArea: Record<string, number> = { Small: 12, Medium: 24, Large: 40 };
  const area = useMemo(() => {
    if (preset) return presetArea[preset] ?? 0;
    const w = parseFloat(width);
    const h = parseFloat(height);
    return w > 0 && h > 0 ? +(w * h).toFixed(1) : 0;
  }, [width, height, preset]);

  const estimate = useMemo(() => {
    if (!product) return null;
    const effectiveMaterial = material ?? (recommend ? (materials[1] ?? materials[0] ?? null) : null);
    if (!effectiveMaterial) return null;
    return calculateEstimate({
      product,
      material: effectiveMaterial,
      finish,
      areaSqft: area,
      installation,
      rules,
    });
  }, [product, material, recommend, materials, finish, area, installation, rules]);

  async function submitEnquiry() {
    if (!form.full_name || !form.phone) {
      toast.error("Please add your name and mobile number.");
      return;
    }
    const { error } = await supabase.from("enquiries").insert({
      product_id: product?.id ?? null,
      full_name: form.full_name,
      phone: form.phone,
      whatsapp: form.whatsapp || form.phone,
      email: form.email || null,
      city: form.city || null,
      state: form.state || null,
      width_ft: preset ? null : parseFloat(width) || null,
      height_ft: preset ? null : parseFloat(height) || null,
      area_sqft: area || null,
      size_preset: preset,
      material_id: material?.id ?? null,
      finish_id: finish?.id ?? null,
      installation_required: installation,
      estimated_price_min: estimate ? Math.round(estimate.min) : null,
      estimated_price_max: estimate ? Math.round(estimate.max) : null,
      message: form.message || null,
    });
    if (error) {
      toast.error("Something went wrong. Please try WhatsApp.");
      return;
    }
    void logEvent("enquiry_submitted", { product_id: product?.id });
    setSubmitted(true);
  }

  const waMessage = enquiryMessage({
    product: product?.name,
    size: area ? `${area} sq.ft` : undefined,
    material: material?.name,
    finish: finish?.name,
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
              <h2 className="font-display text-2xl">What size is your wall?</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm">
                  Width (ft)
                  <input
                    value={width}
                    onChange={(e) => {
                      setWidth(e.target.value);
                      setPreset(null);
                    }}
                    inputMode="decimal"
                    className="mt-2 w-full border border-border bg-card px-4 py-3"
                  />
                </label>
                <label className="text-sm">
                  Height (ft)
                  <input
                    value={height}
                    onChange={(e) => {
                      setHeight(e.target.value);
                      setPreset(null);
                    }}
                    inputMode="decimal"
                    className="mt-2 w-full border border-border bg-card px-4 py-3"
                  />
                </label>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                {area ? `Wall area: ${area} sq.ft` : "Custom sizes available."}
              </p>

              <p className="eyebrow mt-10">I don't know my exact size</p>
              <div className="mt-4 flex gap-3">
                {Object.keys(presetArea).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPreset(p);
                      setWidth("");
                      setHeight("");
                    }}
                    className={cn(
                      "border px-5 py-3 text-[0.64rem] tracking-[0.18em] uppercase",
                      preset === p ? "border-accent text-accent" : "border-border",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <p className="eyebrow mt-10">Your design</p>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProductSlug(p.slug)}
                    className={cn(
                      "w-28 shrink-0 border p-1",
                      p.slug === product?.slug ? "border-accent" : "border-transparent",
                    )}
                  >
                    <img
                      src={p.main_image_url ?? ""}
                      alt={p.name}
                      loading="lazy"
                      className="aspect-3/4 w-full object-cover"
                    />
                    <span className="mt-2 block text-[0.58rem] uppercase">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-display text-2xl">Choose Your Material.</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                We'll recommend the most suitable option based on your design and size.
              </p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {materials.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMaterialId(m.id);
                      setRecommend(false);
                    }}
                    className={cn(
                      "border p-6 text-left transition-colors",
                      materialId === m.id ? "border-accent" : "border-border",
                    )}
                  >
                    <p className="text-sm tracking-[0.14em] uppercase">{m.name}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{m.short_description}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Suitable for: {m.suitable_for}
                    </p>
                    {m.base_rate > 0 && (
                      <p className="mt-3 text-xs tracking-[0.14em] text-accent uppercase">
                        from {formatINR(m.base_rate)} / sq.ft
                      </p>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setRecommend(true);
                  setMaterialId(null);
                }}
                className={cn(
                  "mt-6 border px-6 py-4 text-[0.64rem] tracking-[0.18em] uppercase",
                  recommend ? "border-accent text-accent" : "border-border",
                )}
              >
                Not sure? Let us recommend the best material →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-display text-2xl">Choose Your Finish.</h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-3">
                {finishes.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFinishId(f.id)}
                    className={cn(
                      "border p-5 text-left",
                      finishId === f.id ? "border-accent" : "border-border",
                    )}
                  >
                    <span className="block h-16 w-full surface-sand" />
                    <p className="mt-4 text-sm tracking-[0.14em] uppercase">{f.name}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{f.description}</p>
                  </button>
                ))}
              </div>
              <label className="mt-8 flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={installation}
                  onChange={(e) => setInstallation(e.target.checked)}
                />
                Include installation &amp; delivery
              </label>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-display text-2xl">Your Estimate.</h2>
              <dl className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="eyebrow">Your Design</dt>
                  <dd className="mt-1">{product?.name}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Size</dt>
                  <dd className="mt-1">
                    {preset ? `${preset} wall` : width && height ? `${width} × ${height} ft` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Area</dt>
                  <dd className="mt-1">{area ? `${area} sq.ft` : "—"}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Material</dt>
                  <dd className="mt-1">{material?.name ?? "Recommended by Articiti"}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Finish</dt>
                  <dd className="mt-1">{finish?.name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Installation</dt>
                  <dd className="mt-1">{installation ? "Yes" : "No"}</dd>
                </div>
              </dl>

              <div className="mt-10 surface-sand p-8">
                <p className="eyebrow">Estimated Price</p>
                <p className="font-display mt-3 text-4xl">
                  {estimate
                    ? `${formatINR(estimate.min)} – ${formatINR(estimate.max)}`
                    : "Request final quotation"}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  This is an estimated range. Final quotation depends on design detailing, material
                  selection, finishing, installation and location.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
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
                Anything else you'd like us to know?
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
          {step < 4 && (
            <button
              onClick={() => setStep((s) => Math.min(4, s + 1))}
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
