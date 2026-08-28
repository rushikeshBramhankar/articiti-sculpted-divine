import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/queries";
import { formatINR } from "@/lib/pricing";

export function ProductCard({ product }: { product: Product }) {
  const hasDiscount =
    product.compare_at_price != null && product.compare_at_price > product.starting_price;

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
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-baseline gap-2 text-xs tracking-[0.14em] text-foreground uppercase">
            Starting from {formatINR(product.starting_price)}
            {hasDiscount && (
              <span className="text-[0.7rem] tracking-normal text-muted-foreground/60 line-through">
                {formatINR(product.compare_at_price as number)}
              </span>
            )}
          </span>
          <span className="text-xs tracking-[0.14em] text-accent uppercase">View Design →</span>
        </div>
      </div>
    </Link>
  );
}
