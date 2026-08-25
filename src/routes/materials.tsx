import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { materialsQuery } from "@/lib/queries";
import { formatINR } from "@/lib/pricing";

export const Route = createFileRoute("/materials")({
  head: () => ({
    meta: [
      { title: "Materials — Choose What Works For Your Space | ARTICITI" },
      {
        name: "description",
        content:
          "HDHMR, Gypsum/POP, MDF and fibre options for custom devotional wall sculptures — with guidance on what suits your design and space.",
      },
      { property: "og:title", content: "Materials — ARTICITI" },
      {
        property: "og:description",
        content: "Material options for custom devotional wall sculptures.",
      },
    ],
  }),
  component: MaterialsPage,
});

function MaterialsPage() {
  const { data: materials = [] } = useQuery(materialsQuery);

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 pt-32 pb-14 md:px-10 md:pt-44">
        <Link to="/" className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
          ← Home
        </Link>
        <h1 className="font-display mt-6 text-4xl sm:text-6xl">Choose What Works For Your Space.</h1>
        <p className="mt-5 max-w-xl text-muted-foreground">
          Material recommendation depends on design, size, installation conditions and location.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 md:px-10">
        <div className="grid gap-px surface-sand sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((m, i) => (
            <Reveal key={m.id} delay={(i % 3) * 80} className="bg-background p-8 md:p-10">
              <h2 className="text-sm tracking-[0.16em] uppercase">{m.name}</h2>
              <p className="mt-4 text-sm text-muted-foreground">{m.long_description}</p>
              <p className="mt-4 text-xs text-muted-foreground">Suitable for: {m.suitable_for}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                Thickness: {m.thickness_options ?? "Design dependent"}
              </p>
              {m.base_rate > 0 && (
                <p className="mt-5 text-xs tracking-[0.14em] text-accent uppercase">
                  Indicative from {formatINR(m.base_rate)} / sq.ft
                </p>
              )}
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14">
          <Link
            to="/quote"
            className="inline-block bg-accent px-8 py-4 text-[0.66rem] tracking-[0.22em] text-accent-foreground uppercase"
          >
            Not sure? Let our team recommend
          </Link>
        </Reveal>
      </section>
    </SiteShell>
  );
}
