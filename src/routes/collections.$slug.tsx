import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { categoryQuery, productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/collections/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    const title = `${name} Collection — ARTICITI Devotional Wall Sculptures`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Explore ARTICITI ${name} 3D wall sculptures — timeless devotion interpreted through contemporary architectural art.`,
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: `Explore ARTICITI ${name} devotional wall sculptures.`,
        },
      ],
    };
  },
  component: CollectionPage,
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const { data: category, isLoading } = useQuery(categoryQuery(slug));
  const { data: products = [] } = useQuery({
    ...productsQuery(category?.id),
    enabled: Boolean(category?.id),
  });

  return (
    <SiteShell>
      <section className="relative flex min-h-[62svh] items-end overflow-hidden bg-ink">
        {category?.cover_image_url && (
          <img
            src={category.cover_image_url}
            alt={`${category.name} wall sculpture`}
            className="animate-slow-zoom absolute inset-0 size-full object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/30" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pt-32 pb-16 md:px-10 md:pb-24">
          <nav className="text-xs tracking-[0.16em] text-ink-foreground/60 uppercase">
            <Link to="/">Home</Link> <span className="px-2">/</span>{" "}
            <Link to="/collections">Collections</Link> <span className="px-2">/</span>{" "}
            <span className="text-accent">{category?.name ?? slug}</span>
          </nav>
          <h1 className="font-display mt-6 text-4xl text-ink-foreground sm:text-6xl">
            {category ? `${category.name}, Reimagined in Sculpture.` : "Collection"}
          </h1>
          <p className="mt-5 max-w-lg text-ink-foreground/70">
            {category?.description ??
              "Timeless devotion interpreted through contemporary architectural art."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
        <p className="eyebrow">Choose a Design</p>
        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
        {!isLoading && products.length === 0 && (
          <p className="text-muted-foreground">New designs for this collection are coming soon.</p>
        )}
      </section>
    </SiteShell>
  );
}
