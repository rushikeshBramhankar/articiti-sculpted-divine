import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { whatsappHref } from "./brand";
import { settingsQuery, logEvent } from "@/lib/queries";

export function SiteShell({ children }: { children: ReactNode }) {
  const { data: settings } = useQuery(settingsQuery);
  const whatsapp = settings?.["whatsapp_number"] ?? "8010129969";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />

      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <a
          href={whatsappHref(whatsapp)}
          target="_blank"
          rel="noreferrer"
          onClick={() => logEvent("whatsapp_click", { source: "mobile_bar" })}
          className="flex items-center justify-center gap-2 py-4 text-[0.68rem] tracking-[0.2em] uppercase"
        >
          <MessageCircle className="size-4" /> WhatsApp
        </a>
        <Link
          to="/quote"
          className="flex items-center justify-center bg-accent py-4 text-[0.68rem] tracking-[0.2em] text-accent-foreground uppercase"
        >
          Get Quote
        </Link>
      </div>
    </div>
  );
}
