import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — From Vision to Installation | ARTICITI" },
      {
        name: "description",
        content:
          "Six steps from choosing a devotional wall design to installation in your home — visualize, size, material, finish, quotation, installation.",
      },
      { property: "og:title", content: "How It Works — ARTICITI" },
      {
        property: "og:description",
        content: "From vision to installation in six considered steps.",
      },
    ],
  }),
  component: HowItWorks,
});

const STEPS = [
  ["01", "Choose Your Design", "Browse the collection and pick the composition you love."],
  ["02", "Visualize It In Your Home", "Upload your wall photo and preview the piece in place."],
  ["03", "Choose Your Size", "Share your wall width and height — or an approximate size."],
  ["04", "Select Material & Finish", "We recommend what suits your design and space."],
  ["05", "Receive Your Quotation", "An estimated range first, then a final quotation from our team."],
  ["06", "We Create & Install", "Manufactured, artist finished and installed at your home."],
];

const JOURNEY = [
  ["01", "Concept", "The idea is developed as a design concept."],
  ["02", "Design Development", "Proportions, depth and detailing are refined for your wall."],
  ["03", "Manufacturing", "The piece is built in the selected material."],
  ["04", "Artist Finishing", "Detailing and painting by skilled artists."],
  ["05", "Installation", "Mounted and aligned in your space."],
  ["06", "Real Home", "The finished installation, living in your home."],
];

function HowItWorks() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 pt-32 pb-16 md:px-10 md:pt-44">
        <Link to="/" className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
          ← Home
        </Link>
        <h1 className="font-display mt-6 text-4xl sm:text-6xl">From Vision to Installation.</h1>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 md:px-10">
        <div className="grid gap-px surface-sand md:grid-cols-3">
          {STEPS.map(([n, t, d], i) => (
            <Reveal key={n} delay={i * 80} className="bg-background p-8 md:p-12">
              <p className="font-display text-5xl text-accent">{n}</p>
              <h2 className="mt-6 text-sm tracking-[0.16em] uppercase">{t}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-ink py-24 text-ink-foreground md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal>
            <p className="eyebrow text-ink-foreground/50">Concept to Reality</p>
            <h2 className="font-display mt-4 text-3xl sm:text-5xl">From Concept to Reality.</h2>
            <p className="mt-4 max-w-lg text-ink-foreground/70">
              See how an idea becomes a physical installation.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-10 md:grid-cols-2">
            <Reveal>
              <img
                src="/images/artisan-studio.jpg"
                alt="Artist finishing a sculpted devotional wall panel"
                loading="lazy"
                width={1600}
                height={1104}
                className="w-full object-cover"
              />
            </Reveal>
            <div className="space-y-8">
              {JOURNEY.map(([n, t, d], i) => (
                <Reveal key={n} delay={i * 70} className="flex gap-6">
                  <span className="font-display text-2xl text-accent">{n}</span>
                  <div>
                    <h3 className="text-sm tracking-[0.16em] uppercase">{t}</h3>
                    <p className="mt-2 text-sm text-ink-foreground/65">{d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
