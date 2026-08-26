import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { productsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Search = { product?: string | undefined };

export const Route = createFileRoute("/visualize")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    product: typeof search["product"] === "string" ? search["product"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Visualize Your Wall — ARTICITI" },
      {
        name: "description",
        content:
          "Upload a photo of your wall and preview how an ARTICITI devotional wall sculpture will look in your home.",
      },
      { property: "og:title", content: "Visualize Your Wall — ARTICITI" },
      {
        property: "og:description",
        content: "See an ARTICITI wall sculpture on your own wall before you order.",
      },
    ],
  }),
  component: VisualizePage,
});

function VisualizePage() {
  const search = Route.useSearch();
  const { data: products = [] } = useQuery(productsQuery());
  const [wall, setWall] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | undefined>(search.product);

  const product = products.find((p) => p.slug === selected) ?? products[0];

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 pt-32 pb-8 md:px-10 md:pt-44">
        <Link to="/" className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
          ← Home
        </Link>
        <h1 className="font-display mt-6 text-4xl sm:text-6xl">See It On Your Wall.</h1>
        <p className="mt-5 max-w-lg text-muted-foreground">
          Wondering how it will look in your home? Upload your living room, mandir, entrance,
          bedroom or office wall.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-28 md:grid-cols-2 md:px-10">
        <div>
          <p className="eyebrow">Step 01 — Your Wall</p>
          <label className="mt-5 flex aspect-4/3 cursor-pointer items-center justify-center border border-dashed border-border surface-sand text-center text-sm text-muted-foreground">
            {wall ? (
              <img src={wall} alt="Your wall" className="size-full object-cover" />
            ) : (
              <span className="px-8">Upload your wall photo</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setWall(URL.createObjectURL(file));
              }}
            />
          </label>

          <p className="eyebrow mt-10">Step 02 — Choose Design</p>
          <div className="mt-5 flex gap-4 overflow-x-auto pb-3">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p.slug)}
                className={cn(
                  "w-28 shrink-0 border p-1 transition-colors",
                  p.slug === product?.slug ? "border-accent" : "border-transparent",
                )}
              >
                <img
                  src={p.main_image_url ?? ""}
                  alt={p.name}
                  loading="lazy"
                  className="aspect-3/4 w-full object-cover"
                />
                <span className="mt-2 block text-[0.6rem] tracking-[0.12em] uppercase">
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow">Preview</p>
          <div className="relative mt-5 aspect-4/3 overflow-hidden bg-ink">
            {wall ? (
              <>
                <img src={wall} alt="Wall preview" className="size-full object-cover" />
                {product?.main_image_url && (
                  <img
                    src={product.main_image_url}
                    alt={product.name}
                    className="absolute top-1/2 left-1/2 h-[62%] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-2xl"
                  />
                )}
              </>
            ) : (
              <div className="flex size-full items-center justify-center px-8 text-center text-sm text-ink-foreground/60">
                Upload a wall photo to preview your design.
              </div>
            )}
            <span className="absolute top-3 left-3 bg-accent px-2 py-1 text-[0.55rem] tracking-[0.18em] text-accent-foreground uppercase">
              AI Visualization
            </span>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            Visualization is an artistic preview. Final appearance may vary slightly depending on
            wall dimensions, lighting, material and installation.
          </p>

          <Link
            to="/quote"
            search={product ? { product: product.slug } : {}}
            className="mt-8 inline-block bg-accent px-8 py-4 text-[0.66rem] tracking-[0.22em] text-accent-foreground uppercase"
          >
            Like the look? Get your quotation →
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
