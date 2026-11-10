import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Terms & Conditions — Interior by Veera" },
      { name: "twitter:description", content: "Terms covering estimates, quotations, custom manufacturing and installation." },

      { title: "Terms & Conditions — Interior by Veera" },
      {
        name: "description",
        content: "Terms covering estimates, quotations, custom manufacturing and installation.",
      },
      { property: "og:title", content: "Terms & Conditions — Interior by Veera" },
      { property: "og:description", content: "Terms for estimates, orders and installation." },
    ],
  }),
  component: () => (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-5 pt-32 pb-32 md:px-10 md:pt-44">
        <h1 className="font-display text-4xl">Terms &amp; Conditions</h1>
        <div className="mt-8 space-y-5 text-sm text-muted-foreground">
          <p>
            Prices shown on the website are indicative starting points and estimated ranges. Final
            quotation may vary based on size, design complexity, material, finish, installation and
            location.
          </p>
          <p>
            Every piece is custom manufactured. Timelines, thickness and detailing are confirmed at
            the time of the final quotation.
          </p>
          <p>
            Visualizations shown on the site are artistic previews and are labelled as such. Actual
            installations are labelled separately.
          </p>
        </div>
      </section>
    </SiteShell>
  ),
});
