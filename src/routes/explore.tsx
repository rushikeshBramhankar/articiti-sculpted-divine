import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { categoriesQuery, productsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Designs — ARTICITI Devotional Wall Sculptures" },
      {
        name: "description",
        content:
          "Browse every ARTICITI 3D devotional wall sculpture — Krishna, Mahadev, Ganpati and Hanuman designs for modern Indian homes.",
      },
      { property: "og:title", content: "Explore Designs — ARTICITI" },
      {
        property: "og:description",
        content: "Browse every ARTICITI 3D devotional wall sculpture design.",
      },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: products = [] } = useQuery(productsQuery());
  const [active, setActive] = useState<string | null>(null);

  const list = active ? products.filter((p) => p.category_id === active) : products;

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 pt-32 pb-16 md:px-10 md:pt-44">
        <Link to="/" className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
          ← Home
        </Link>
        <h1 className="font-display mt-6 text-4xl sm:text-6xl">Explore Designs.</h1>
        <p className="mt-5 max-w-lg text-muted-foreground">
          Every piece is made to your wall. Start with a design you love.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={() => setActive(null)}
            className={cn(
              "border px-5 py-2.5 text-[0.66rem] tracking-[0.2em] uppercase transition-colors",
              active === null ? "border-accent text-accent" : "border-border text-muted-foreground",
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={cn(
                "border px-5 py-2.5 text-[0.66rem] tracking-[0.2em] uppercase transition-colors",
                active === c.id ? "border-accent text-accent" : "border-border text-muted-foreground",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-28 md:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
