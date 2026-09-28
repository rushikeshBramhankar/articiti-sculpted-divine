import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/queries";
import { usePricing } from "@/lib/pricing";
import { PriceTag } from "./PriceTag";

export function ProductCard({ product }: { product: Product }) {
  const { lowestFor } = usePricing();
  const lowest = lowestFor(product);

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group block"
      aria-label={product.name}
    >
      <div className="relative overflow-hidden bg-muted">
        <img
          src={product.main_image_url ?? ""}
          alt={`${product.name} — 3D devotional wall sculpture`}
          loading="lazy"
          className="aspect-4/5 w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="pt-5">
        <h3 className="font-display text-xl">{product.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{product.short_description}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>{lowest && <PriceTag info={lowest} size="sm" prefix="From " />}</div>
          <span className="shrink-0 text-xs tracking-[0.14em] text-accent uppercase">View Design →</span>
        </div>
      </div>
    </Link>
  );
}
