import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Privacy Policy — Interior by Veera" },
      { name: "twitter:description", content: "How Interior by Veera collects and uses the information you share through enquiries." },

      { title: "Privacy Policy — Interior by Veera" },
      {
        name: "description",
        content: "How Interior by Veera collects and uses the information you share through enquiries.",
      },
      { property: "og:title", content: "Privacy Policy — Interior by Veera" },
      { property: "og:description", content: "How Interior by Veera handles your information." },
    ],
  }),
  component: () => (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-5 pt-32 pb-32 md:px-10 md:pt-44">
        <h1 className="font-display text-4xl">Privacy Policy</h1>
        <div className="mt-8 space-y-5 text-sm text-muted-foreground">
          <p>
            We collect only the details you share with us in an enquiry — your name, contact number,
            email, city and the design preferences you select.
          </p>
          <p>
            This information is used solely to prepare your quotation and to contact you about your
            enquiry. We do not sell or share it with third parties.
          </p>
          <p>
            Wall photographs you upload for visualization are used only to prepare your artistic
            preview.
          </p>
        </div>
      </section>
    </SiteShell>
  ),
});
