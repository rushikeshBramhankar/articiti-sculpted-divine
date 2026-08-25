import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatINR } from "@/lib/pricing";
import { logEvent, productImagesQuery, productQuery, settingsQuery } from "@/lib/queries";
import { enquiryMessage, whatsappHref } from "@/components/site/brand";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    const title = `${name} — Custom 3D Devotional Wall Sculpture | ARTICITI`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `${name}: a contemporary 3D devotional wall sculpture by ARTICITI, made to your wall size, material and finish.`,
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: "Contemporary 3D wall sculpture, made to your wall.",
        },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useQuery(productQuery(slug));
  const { data: images = [] } = useQuery(productImagesQuery(product?.id));
  const { data: settings } = useQuery(settingsQuery);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (product) void logEvent("product_view", { product_id: product.id, slug: product.slug });
  }, [product]);

  if (isLoading) {
    return (
      <SiteShell>
        <div className="min-h-[60svh] px-5 pt-40 text-muted-foreground md:px-10">Loading…</div>
      </SiteShell>
    );
  }

  if (!product) {
    return (
      <SiteShell>
        <div className="min-h-[60svh] px-5 pt-40 md:px-10">
          <h1 className="font-display text-3xl">Design not found</h1>
          <Link to="/explore" className="mt-6 inline-block text-sm text-accent uppercase">
            ← Explore designs
          </Link>
        </div>
      </SiteShell>
    );
  }

  const waMessage = enquiryMessage({ product: product.name });

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pt-28 md:grid-cols-[1.15fr_1fr] md:px-10 md:pt-40">
        <div className="relative">
          <img
            src={product.main_image_url ?? ""}
            alt={`${product.name} 3D wall sculpture`}
            className="w-full object-cover"
          />
          <span className="absolute top-4 left-4 bg-ink/70 px-2.5 py-1 text-[0.55rem] tracking-[0.18em] text-ink-foreground uppercase">
            AI Visualization
          </span>
        </div>

        <div className="md:pt-6">
          <nav className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            <Link to="/">Home</Link> <span className="px-2">/</span>{" "}
            <Link to="/explore">Explore</Link> <span className="px-2">/</span>{" "}
            <span className="text-accent">{product.name}</span>
          </nav>
          <h1 className="font-display mt-6 text-4xl sm:text-5xl">{product.name}</h1>
          <p className="mt-3 text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Contemporary 3D Wall Sculpture
          </p>
          <p className="font-display mt-8 text-3xl">
            Starting from {formatINR(product.starting_price)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Final pricing depends on size, material, detailing, finish and installation.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/quote"
              search={{ product: product.slug }}
              className="bg-accent px-7 py-4 text-[0.66rem] tracking-[0.22em] text-accent-foreground uppercase"
            >
              Get Quotation
            </Link>
            <Link
              to="/visualize"
              search={{ product: product.slug }}
              className="border border-foreground/25 px-7 py-4 text-[0.66rem] tracking-[0.22em] uppercase"
            >
              Visualize In My Home
            </Link>
            <a
              href={whatsappHref(settings?.["whatsapp_number"] ?? "8010129969", waMessage)}
              target="_blank"
              rel="noreferrer"
              onClick={() => logEvent("whatsapp_click", { product_id: product.id })}
              className="border border-accent px-7 py-4 text-[0.66rem] tracking-[0.22em] text-accent uppercase"
            >
              WhatsApp Us
            </a>
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <p className="eyebrow">Product Details</p>
            <p className="mt-4 text-sm text-muted-foreground">{product.long_description}</p>
            <p className="mt-6 text-sm">Available in custom dimensions.</p>
            {product.suitable_for.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Suitable for: {product.suitable_for.join(", ")}.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
        <Reveal>
          <p className="eyebrow">Gallery</p>
          <h2 className="font-display mt-4 text-3xl sm:text-4xl">View the craftsmanship.</h2>
        </Reveal>
        <div className="mt-10 flex snap-x gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setLightbox(img.image_url)}
              className="relative w-[78vw] shrink-0 snap-center md:w-auto"
            >
              <img
                src={img.image_url}
                alt={img.caption ?? product.name}
                loading="lazy"
                className="aspect-3/4 w-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-ink/70 px-2 py-1 text-[0.52rem] tracking-[0.16em] text-ink-foreground uppercase">
                {img.source_type === "real_installation" ? "Actual Installation" : "AI Visualization"}
              </span>
              <span className="mt-3 block text-left text-xs tracking-[0.14em] text-muted-foreground uppercase">
                {img.caption}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-ink py-24 text-ink-foreground md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2 md:px-10">
          <img
            src={product.side_view_url ?? "/images/dimension-detail.jpg"}
            alt="Side perspective showing sculptural depth"
            loading="lazy"
            className="w-full object-cover"
          />
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">See the Dimension.</h2>
            <p className="mt-5 text-ink-foreground/70">
              Designed with dimensional depth to create real shadows, highlights and architectural
              presence.
            </p>
            <p className="mt-6 text-sm text-ink-foreground/55">
              Thickness is customized according to the design, size and selected material.
            </p>
          </div>
        </div>
      </section>

      <Dialog open={Boolean(lightbox)} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0">
          {lightbox && <img src={lightbox} alt={product.name} className="w-full object-contain" />}
        </DialogContent>
      </Dialog>
    </SiteShell>
  );
}
