import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { ProductCard } from "@/components/site/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARTINCITY — Divinity, Sculpted for Your Space" },
      {
        name: "description",
        content:
          "Custom 3D devotional wall art and sculptural reliefs designed for modern Indian homes. Krishna, Mahadev, Ganpati and Hanuman wall installations.",
      },
      { property: "og:title", content: "ARTINCITY — Divinity, Sculpted for Your Space" },
      {
        property: "og:description",
        content: "Custom 3D devotional wall art designed to transform modern Indian homes.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: products = [], isLoading } = useQuery(productsQuery());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Our Collection</p>
            <h1 className="font-display mt-4 text-3xl sm:text-5xl">All Time Best Seller</h1>
          </div>
          <div className="flex w-full items-center gap-3 sm:w-80">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name…"
                className="w-full border border-foreground/20 bg-background py-3 pr-4 pl-11 text-sm outline-none transition-colors focus:border-accent"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
            {search
              ? `${filtered.length} result${filtered.length === 1 ? "" : "s"} for "${search}"`
              : ""}
          </p>
          <Link to="/explore" className="text-xs tracking-[0.18em] text-accent uppercase">
            View All →
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-4/5 w-full" />
                <Skeleton className="mt-5 h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="mt-14 text-muted-foreground">
            {search ? `No products found for "${search}".` : "No products published yet."}
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
