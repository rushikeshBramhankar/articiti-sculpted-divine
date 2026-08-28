import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { ProductCard } from "@/components/site/ProductCard";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARTICITI — Divinity, Sculpted for Your Space" },
      {
        name: "description",
        content:
          "Custom 3D devotional wall art and sculptural reliefs designed for modern Indian homes. Krishna, Mahadev, Ganpati and Hanuman wall installations.",
      },
      { property: "og:title", content: "ARTICITI — Divinity, Sculpted for Your Space" },
      {
        property: "og:description",
        content: "Custom 3D devotional wall art designed to transform modern Indian homes.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: products = [] } = useQuery(productsQuery());
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByAmount(dir: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Our Collection</p>
            <h1 className="font-display mt-4 text-3xl sm:text-5xl">All Time Best Seller</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/explore"
              className="bg-accent px-6 py-3 text-[0.65rem] tracking-[0.2em] text-accent-foreground uppercase transition-opacity hover:opacity-90"
            >
              View All
            </Link>
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollByAmount(-1)}
              className="hidden size-11 items-center justify-center border border-foreground/20 text-foreground transition-colors hover:border-accent hover:text-accent sm:flex"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollByAmount(1)}
              className="hidden size-11 items-center justify-center border border-foreground/20 text-foreground transition-colors hover:border-accent hover:text-accent sm:flex"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <p className="mt-14 text-muted-foreground">No products published yet.</p>
        ) : (
          <div
            ref={scrollerRef}
            className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((p) => (
              <div key={p.id} className="w-[78vw] shrink-0 snap-start sm:w-[320px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
