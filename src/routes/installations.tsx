import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { installationsQuery } from "@/lib/queries";

export const Route = createFileRoute("/installations")({
  head: () => ({
    meta: [
      { title: "Real Installations — Made For Real Homes | ARTINCITY" },
      {
        name: "description",
        content:
          "Actual ARTINCITY devotional wall sculpture installations in real Indian homes — location, design, size and material.",
      },
      { property: "og:title", content: "Real Installations — ARTINCITY" },
      { property: "og:description", content: "Actual installations in real Indian homes." },
    ],
  }),
  component: InstallationsPage,
});

function InstallationsPage() {
  const { data: installations = [] } = useQuery(installationsQuery);

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 pt-32 pb-14 md:px-10 md:pt-44">
        <Link to="/" className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
          ← Home
        </Link>
        <h1 className="font-display mt-6 text-4xl sm:text-6xl">Made For Real Homes.</h1>
        <p className="mt-5 max-w-lg text-muted-foreground">
          Photographs of completed installations. No AI visualizations on this page.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-28 md:px-10">
        <div className="grid gap-12 md:grid-cols-2">
          {installations.map((inst, i) => (
            <Reveal key={inst.id} delay={(i % 2) * 90}>
              <div className="grid grid-cols-2 gap-2">
                <figure>
                  <img
                    src={inst.before_image_url ?? ""}
                    alt={`${inst.project_name} before`}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                  <figcaption className="mt-2 text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase">
                    Before
                  </figcaption>
                </figure>
                <figure>
                  <img
                    src={inst.final_image_url ?? inst.after_image_url ?? ""}
                    alt={`${inst.project_name} after`}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                  <figcaption className="mt-2 text-[0.6rem] tracking-[0.18em] text-accent uppercase">
                    Actual Installation
                  </figcaption>
                </figure>
              </div>
              <h2 className="font-display mt-6 text-2xl">{inst.project_name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {[inst.city, inst.size_label, inst.material_label, inst.finish_label]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            </Reveal>
          ))}
        </div>
        {installations.length === 0 && (
          <p className="text-muted-foreground">Installation photography is being added shortly.</p>
        )}
      </section>
    </SiteShell>
  );
}
