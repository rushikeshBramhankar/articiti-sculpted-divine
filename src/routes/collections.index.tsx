import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesQuery } from "@/lib/queries";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "Collections — Krishna, Mahadev, Ganpati & Hanuman Wall Art | ARTINCITY" },
      {
        name: "description",
        content:
          "Explore ARTINCITY collections of devotional wall sculptures by deity — Shri Krishna, Mahadev, Ganpati Bappa and Bajrang Bali.",
      },
      { property: "og:title", content: "Collections — ARTINCITY" },
      {
        property: "og:description",
        content: "Devotional wall sculpture collections by deity.",
      },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const { data: categories = [], isLoading } = useQuery(categoriesQuery);

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 pt-32 pb-14 md:px-10 md:pt-44">
        <Link to="/" className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
          ← Home
        </Link>
        <h1 className="font-display mt-6 text-4xl sm:text-6xl">Choose Your Divine.</h1>
        <p className="mt-5 max-w-lg text-muted-foreground">
          Explore our growing collection of devotional wall installations.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-28 md:px-10">
        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative overflow-hidden">
                <Skeleton className="aspect-3/4 w-full" />
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="mt-2 h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2">
            {categories.map((c, i) => (
              <Reveal key={c.id} delay={i * 90}>
                <Link
                  to="/collections/$slug"
                  params={{ slug: c.slug }}
                  className="group relative block overflow-hidden bg-ink"
                >
                  <img
                    src={c.cover_image_url ?? ""}
                    alt={`${c.name} collection`}
                    loading="lazy"
                    className="aspect-3/4 w-full object-cover opacity-85 transition-transform duration-[1600ms] group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <h2 className="font-display text-3xl text-ink-foreground">{c.name}</h2>
                    <p className="mt-2 text-xs tracking-[0.2em] text-ink-foreground/70 uppercase">
                      {c.subtitle}
                    </p>
                    <p className="mt-5 text-xs tracking-[0.18em] text-accent uppercase">
                      Explore Designs →
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
