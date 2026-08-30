import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/site/Logo";

const NAV = [
  { to: "/explore", label: "Explore" },
  { to: "/collections", label: "Collections" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/visualize", label: "Visualize Your Wall" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/92 backdrop-blur-md transition-all duration-700">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-10">
        <Link to="/" aria-label="ArtInCity home" className="text-foreground transition-colors">
          <Logo className="text-xl md:text-2xl" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[0.72rem] tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-accent"
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
              className="p-2 text-foreground lg:hidden"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] bg-ink text-ink-foreground sm:w-80">
              <SheetTitle className="px-6 pt-6 text-ink-foreground">
                <Logo className="text-lg" />
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
