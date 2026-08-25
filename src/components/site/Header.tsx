import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { settingsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/explore", label: "Explore" },
  { to: "/collections", label: "Collections" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/visualize", label: "Visualize Your Wall" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { data: settings } = useQuery(settingsQuery);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-700",
        scrolled ? "bg-background/92 border-b border-border backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-10">
        <Link
          to="/"
          className={cn(
            "font-display text-xl tracking-[0.38em] transition-colors md:text-2xl",
            scrolled ? "text-foreground" : "text-ink-foreground",
          )}
        >
          {settings?.["brand_name"] ?? "ARTICITI"}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "text-[0.72rem] tracking-[0.18em] uppercase transition-colors",
                scrolled
                  ? "text-muted-foreground hover:text-accent"
                  : "text-ink-foreground/80 hover:text-accent",
              )}
              activeProps={{ className: "text-accent" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/quote"
            className="hidden border border-accent px-5 py-2.5 text-[0.68rem] tracking-[0.22em] text-accent uppercase transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-block"
          >
            Get a Quote
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className={cn("p-2 lg:hidden", scrolled ? "text-foreground" : "text-ink-foreground")}
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] bg-ink text-ink-foreground sm:w-80">
              <SheetTitle className="font-display px-6 pt-6 text-lg tracking-[0.32em] text-ink-foreground">
                ARTICITI
              </SheetTitle>
              <nav className="mt-8 flex flex-col gap-1 px-6">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="border-b border-sidebar-border py-4 text-sm tracking-[0.16em] uppercase"
                >
                  Home
                </Link>
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="border-b border-sidebar-border py-4 text-sm tracking-[0.16em] uppercase"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/quote"
                  onClick={() => setOpen(false)}
                  className="mt-6 bg-accent px-5 py-4 text-center text-xs tracking-[0.22em] text-accent-foreground uppercase"
                >
                  Get a Quote
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
