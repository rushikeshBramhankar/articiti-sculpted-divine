import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/queries";
import { formatINR } from "@/lib/pricing";

export function ProductCard({ product }: { product: Product }) {
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
        <span className="absolute top-3 left-3 bg-ink/70 px-2 py-1 text-[0.55rem] tracking-[0.18em] text-ink-foreground uppercase">
          AI Visualization
        </span>
      </div>
      <div className="pt-5">
        <h3 className="font-display text-xl">{product.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{product.short_description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs tracking-[0.14em] text-foreground uppercase">
            Starting from {formatINR(product.starting_price)}
          </span>
          <span className="text-xs tracking-[0.14em] text-accent uppercase">View Design →</span>
        </div>
      </div>
    </Link>
  );
}
