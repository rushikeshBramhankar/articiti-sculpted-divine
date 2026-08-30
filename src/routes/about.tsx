import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ARTINCITY — Indian Devotion Meets Contemporary Design" },
      {
        name: "description",
        content:
          "ARTINCITY creates custom devotional wall art inspired by India's spiritual and artistic traditions, reinterpreted for contemporary interiors.",
      },
      { property: "og:title", content: "About ARTINCITY" },
      {
        property: "og:description",
        content: "Where Indian devotion meets contemporary design.",
      },
    ],
  }),
  component: AboutPage,
});

const PILLARS = [
  ["Design", "Compositions developed for the proportions of your wall."],
  ["Craft", "Dimensional relief work with architectural detailing."],
  ["Artists", "Hand finishing and painting by skilled artists."],
  ["Materials", "Selected for the design, size and space."],
  ["Installation", "Mounted and aligned by our team."],
];

function AboutPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 pt-32 pb-16 md:px-10 md:pt-44">
        <Link to="/" className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
          ← Home
        </Link>
        <h1 className="font-display mt-6 max-w-3xl text-4xl leading-tight sm:text-6xl">
          Where Indian Devotion Meets Contemporary Design.
        </h1>
        <p className="mt-8 max-w-xl text-muted-foreground">
          ArtInCity creates custom devotional wall art inspired by India's timeless spiritual and
          artistic traditions, reinterpreted for contemporary interiors.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 md:px-10">
        <Reveal>
          <img
            src="/images/artisan-studio.jpg"
            alt="Artist hand-finishing a sculpted devotional panel in the studio"
            loading="lazy"
            width={1600}
            height={1104}
            className="w-full object-cover"
          />
        </Reveal>
        <div className="mt-16 grid gap-px surface-sand sm:grid-cols-2 lg:grid-cols-5">
          {PILLARS.map(([t, d], i) => (
            <Reveal key={t} delay={i * 70} className="bg-background p-8">
              <h2 className="text-sm tracking-[0.16em] uppercase">{t}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
