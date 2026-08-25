import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import {
  categoriesQuery,
  featuredProductsQuery,
  installationsQuery,
  settingsQuery,
} from "@/lib/queries";

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

const INTRO = [
  { n: "01", t: "Sculpted", d: "Designed with dimensional depth and architectural detailing." },
  { n: "02", t: "Custom", d: "Made according to your wall size and requirements." },
  {
    n: "03",
    t: "Finished by Artists",
    d: "Detailed finishing and painting by skilled artists.",
  },
];

function Index() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: featured = [] } = useQuery(featuredProductsQuery);
  const { data: installations = [] } = useQuery(installationsQuery);

  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative flex min-h-[92svh] items-end overflow-hidden bg-ink">
        <img
          src={settings?.["hero_image_url"] || "/images/hero-living-room.jpg"}
          alt="Luxury modern Indian living room with a large 3D devotional wall sculpture"
          width={1920}
          height={1088}
          className="animate-slow-zoom absolute inset-0 size-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/25" />
        <img
          src="/images/trishul.png"
          alt=""
          aria-hidden
          loading="lazy"
          className="pointer-events-none absolute -left-10 bottom-0 hidden h-[78%] opacity-70 mix-blend-luminosity lg:block"
        />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-24 md:px-10 md:pb-28">
          <div className="max-w-2xl lg:ml-[16%]">
            <p className="animate-rise eyebrow text-ink-foreground/70">
              {settings?.["supporting_line"] ?? "Custom 3D devotional wall art"}
            </p>
            <h1 className="animate-rise font-display mt-6 text-4xl leading-[1.05] text-ink-foreground sm:text-6xl lg:text-7xl">
              {settings?.["hero_heading"] ?? "DIVINITY, SCULPTED FOR YOUR SPACE."}
            </h1>
            <p className="animate-rise mt-6 max-w-lg text-base text-ink-foreground/75">
              {settings?.["hero_subheading"] ??
                "Custom 3D devotional wall art designed to transform modern Indian homes."}
            </p>
            <div className="animate-rise mt-10 flex flex-wrap gap-4">
              <Link
                to="/explore"
                className="bg-accent px-8 py-4 text-[0.68rem] tracking-[0.24em] text-accent-foreground uppercase transition-opacity hover:opacity-90"
              >
                Explore Designs
              </Link>
              <Link
                to="/visualize"
                className="border border-ink-foreground/40 px-8 py-4 text-[0.68rem] tracking-[0.24em] text-ink-foreground uppercase transition-colors hover:border-accent hover:text-accent"
              >
                Visualize Your Wall
              </Link>
            </div>
            <p className="mt-10 text-[0.68rem] tracking-[0.22em] text-ink-foreground/55 uppercase">
              {settings?.["hero_note"] ?? "Custom Sizes • Multiple Materials • Artist Finished"}
            </p>
          </div>
        </div>

        <p className="absolute right-5 bottom-6 hidden text-[0.62rem] tracking-[0.24em] text-ink-foreground/50 uppercase md:right-10 md:block">
          Explore the collection ↓
        </p>
      </section>

      {/* INTRODUCTION */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-36">
        <Reveal className="max-w-3xl">
          <h2 className="font-display text-3xl leading-tight sm:text-5xl">
            Not just a wall. A statement of devotion.
          </h2>
          <p className="mt-6 max-w-xl text-muted-foreground">
            We transform timeless Indian spirituality into contemporary architectural wall art —
            designed specifically for the spaces you live in.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-px surface-sand md:grid-cols-3">
          {INTRO.map((c, i) => (
            <Reveal key={c.n} delay={i * 120} className="bg-background p-8 md:p-12">
              <p className="font-display text-4xl text-accent">{c.n}</p>
              <h3 className="mt-6 text-lg tracking-[0.12em] uppercase">{c.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{c.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="surface-sand py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal>
            <p className="eyebrow">Collections</p>
            <h2 className="font-display mt-4 text-3xl sm:text-5xl">Choose Your Divine.</h2>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Explore our growing collection of devotional wall installations.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            {categories.map((c, i) => (
              <Reveal key={c.id} delay={i * 90}>
                <Link
                  to="/collections/$slug"
                  params={{ slug: c.slug }}
                  className="group relative block overflow-hidden bg-ink"
                >
                  <img
                    src={c.cover_image_url ?? ""}
                    alt={`${c.name} devotional wall sculpture collection`}
                    loading="lazy"
                    className="aspect-4/5 w-full object-cover opacity-85 transition-transform duration-[1600ms] ease-out group-hover:scale-[1.05] sm:aspect-3/4"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <h3 className="font-display text-3xl text-ink-foreground">{c.name}</h3>
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
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Featured</p>
              <h2 className="font-display mt-4 text-3xl sm:text-5xl">Signature Installations.</h2>
            </div>
            <Link to="/explore" className="text-xs tracking-[0.18em] text-accent uppercase">
              View all designs →
            </Link>
          </Reveal>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* DIMENSION */}
      <section className="bg-ink py-24 text-ink-foreground md:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 md:grid-cols-2 md:px-10">
          <Reveal>
            <img
              src="/images/dimension-detail.jpg"
              alt="Angled view of a layered sculptural wall relief showing its depth"
              loading="lazy"
              width={1600}
              height={1104}
              className="w-full object-cover"
            />
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow text-ink-foreground/50">Dimension</p>
            <h2 className="font-display mt-4 text-3xl sm:text-5xl">See the Dimension.</h2>
            <p className="mt-6 text-ink-foreground/70">
              Designed with dimensional depth to create real shadows, highlights and architectural
              presence.
            </p>
            <ol className="mt-10 space-y-4 text-sm tracking-[0.14em] uppercase">
              {["Wall", "Base", "Relief", "Sculptural Elements"].map((s, i) => (
                <li key={s} className="flex items-center gap-4 text-ink-foreground/80">
                  <span className="text-accent">0{i + 1}</span>
                  <span className="rule-brass w-10" />
                  {s}
                </li>
              ))}
            </ol>
            <p className="mt-10 text-sm text-ink-foreground/55">
              Thickness is customized according to the design, size and selected material.
            </p>
          </Reveal>
        </div>
      </section>

      {/* REAL INSTALLATIONS TEASER */}
      {installations.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
          <Reveal>
            <p className="eyebrow">Actual Installation</p>
            <h2 className="font-display mt-4 text-3xl sm:text-5xl">Made For Real Homes.</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {installations.slice(0, 3).map((inst, i) => (
              <Reveal key={inst.id} delay={i * 90}>
                <div className="relative">
                  <img
                    src={inst.final_image_url ?? inst.after_image_url ?? ""}
                    alt={`${inst.project_name} — actual installation`}
                    loading="lazy"
                    className="aspect-4/3 w-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-accent px-2 py-1 text-[0.55rem] tracking-[0.18em] text-accent-foreground uppercase">
                    Actual Installation
                  </span>
                </div>
                <h3 className="font-display mt-4 text-xl">{inst.project_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {[inst.city, inst.size_label, inst.material_label].filter(Boolean).join(" • ")}
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10">
            <Link to="/installations" className="text-xs tracking-[0.18em] text-accent uppercase">
              See all installations →
            </Link>
          </Reveal>
        </section>
      )}

      {/* CTA */}
      <section className="surface-sand py-24 md:py-32">
        <Reveal className="mx-auto max-w-3xl px-5 text-center md:px-10">
          <h2 className="font-display text-3xl sm:text-5xl">Let's Create Yours.</h2>
          <p className="mt-5 text-muted-foreground">
            Tell us your wall size and we'll share an estimated range within minutes.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/quote"
              className="bg-accent px-8 py-4 text-[0.68rem] tracking-[0.24em] text-accent-foreground uppercase"
            >
              Get Your Quotation
            </Link>
            <Link
              to="/visualize"
              className="border border-foreground/25 px-8 py-4 text-[0.68rem] tracking-[0.24em] uppercase"
            >
              Visualize In Your Home
            </Link>
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}
