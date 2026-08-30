import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Instagram, MessageCircle } from "lucide-react";
import { settingsQuery } from "@/lib/queries";
import { Logo } from "@/components/site/Logo";
import { whatsappHref } from "./brand";

export function Footer() {
  const { data: settings } = useQuery(settingsQuery);
  const whatsapp = settings?.["whatsapp_number"] ?? "8010129969";

  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo className="text-2xl" />
            <p className="font-display mt-4 max-w-xs text-xl leading-snug text-ink-foreground/70">
              {settings?.["footer_text"] ?? "Divinity, Sculpted for Your Space."}
            </p>
          </div>

          <div>
            <p className="eyebrow text-ink-foreground/50">Navigate</p>
            <ul className="mt-5 space-y-3 text-sm text-ink-foreground/75">
              <li>
                <Link to="/explore">Explore</Link>
              </li>
              <li>
                <Link to="/collections">Collections</Link>
              </li>
              <li>
                <Link to="/visualize">Visualize</Link>
              </li>
              <li>
                <Link to="/how-it-works">How It Works</Link>
              </li>
              <li>
                <Link to="/materials">Materials</Link>
              </li>
              <li>
                <Link to="/installations">Real Installations</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-ink-foreground/50">Connect</p>
            <ul className="mt-5 space-y-3 text-sm text-ink-foreground/75">
              <li>
                <a
                  href={whatsappHref(whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <MessageCircle className="size-4" /> WhatsApp {whatsapp}
                </a>
              </li>
              <li>
                <a
                  href={settings?.["instagram_url"] ?? "https://www.instagram.com/interior_by_veera/"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Instagram className="size-4" /> Instagram
                </a>
              </li>
              <li>
                <a href={`mailto:${settings?.["contact_email"] ?? ""}`}>
                  {settings?.["contact_email"]}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-sidebar-border pt-8 text-xs text-ink-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ARTINCITY. All rights reserved.</p>
          <p className="flex gap-6">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms &amp; Conditions</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
