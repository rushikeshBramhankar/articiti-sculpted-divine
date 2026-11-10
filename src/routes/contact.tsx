import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { logEvent, settingsQuery } from "@/lib/queries";
import { whatsappHref } from "@/components/site/brand";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Contact Interior by Veera — Let's Create Something Extraordinary" },
      { name: "twitter:description", content: "Talk to Interior by Veera on WhatsApp or Instagram about custom devotional wall sculptures, sizes, materials and quotations." },

      { title: "Contact Interior by Veera — Let's Create Something Extraordinary" },
      {
        name: "description",
        content:
          "Talk to Interior by Veera on WhatsApp or Instagram about custom devotional wall sculptures, sizes, materials and quotations.",
      },
      { property: "og:title", content: "Contact Interior by Veera" },
      { property: "og:description", content: "Let's create something extraordinary." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useQuery(settingsQuery);
  const whatsapp = settings?.["whatsapp_number"] ?? "8010129969";

  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-5 pt-32 pb-32 md:px-10 md:pt-44">
        <Link to="/" className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
          ← Home
        </Link>
        <h1 className="font-display mt-6 text-4xl sm:text-6xl">
          Let's Create Something Extraordinary.
        </h1>
        <p className="mt-6 max-w-lg text-muted-foreground">
          Have a design in mind? Want something customized? Need help choosing a material or size?
        </p>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          <a
            href={whatsappHref(whatsapp)}
            target="_blank"
            rel="noreferrer"
            onClick={() => logEvent("whatsapp_click", { source: "contact" })}
            className="bg-accent px-6 py-5 text-center text-[0.66rem] tracking-[0.2em] text-accent-foreground uppercase"
          >
            Chat on WhatsApp
          </a>
          <a
            href={settings?.["instagram_url"] ?? "https://www.instagram.com/interior_by_veera/"}
            target="_blank"
            rel="noreferrer"
            className="border border-foreground/25 px-6 py-5 text-center text-[0.66rem] tracking-[0.2em] uppercase"
          >
            Instagram @interior_by_veera
          </a>
          <Link
            to="/quote"
            className="border border-accent px-6 py-5 text-center text-[0.66rem] tracking-[0.2em] text-accent uppercase"
          >
            Want Customization
          </Link>
        </div>

        <div className="mt-16 space-y-3 text-sm text-muted-foreground">
          <p>WhatsApp: {whatsapp}</p>
          <p>Instagram: @interior_by_veera</p>
          <p>Email: {settings?.["contact_email"]}</p>
        </div>
      </section>
    </SiteShell>
  );
}
