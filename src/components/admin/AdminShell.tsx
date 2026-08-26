import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  Bell,
  Boxes,
  Calculator,
  FolderTree,
  Hammer,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Palette,
  Settings as SettingsIcon,
  ShoppingBag,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { db, useAdminSession } from "@/lib/admin";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/materials", label: "Materials", icon: Boxes },
  { to: "/admin/pricing", label: "Pricing Rules", icon: Calculator },
  { to: "/admin/finishes", label: "Finishes", icon: Palette },
  { to: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/media", label: "Media", icon: ImageIcon },
  { to: "/admin/installations", label: "Installations", icon: Hammer },
  { to: "/admin/settings", label: "Website Settings", icon: SettingsIcon },
] as const;

export const unreadEnquiriesQuery = {
  queryKey: ["admin", "unread-enquiries"],
  queryFn: async () => {
    const res = await db
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);
    return res.count ?? 0;
  },
};

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map((item) => {
        const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const session = useAdminSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: unread } = useQuery({ ...unreadEnquiriesQuery, enabled: session.isAdmin });

  if (session.loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase">Loading…</p>
      </div>
    );
  }

  if (!session.userId || !session.isAdmin) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="font-display text-2xl tracking-[0.3em]">ARTICITI</p>
        <p className="text-muted-foreground max-w-sm text-sm">
          {session.userId
            ? "This account does not have admin access."
            : "Please sign in to continue."}
        </p>
        <Button
          onClick={async () => {
            if (session.userId) await supabase.auth.signOut();
            void navigate({ to: "/admin/login" });
          }}
        >
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 flex min-h-screen">
      <aside className="bg-sidebar hidden w-64 shrink-0 flex-col border-r border-sidebar-border py-6 lg:flex">
        <p className="font-display text-sidebar-foreground px-6 pb-6 text-lg tracking-[0.3em]">
          ARTICITI
        </p>
        <NavList />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border px-4 md:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger aria-label="Open menu" className="p-2 lg:hidden">
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="bg-sidebar w-72 p-0">
              <SheetTitle className="font-display text-sidebar-foreground px-6 pt-6 pb-4 text-lg tracking-[0.3em]">
                ARTICITI
              </SheetTitle>
              <NavList onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-[0.62rem] tracking-[0.3em] uppercase">
              ARTICITI Admin
            </p>
            <h1 className="truncate text-base font-medium">{title}</h1>
          </div>

          {actions}

          <Link to="/admin/enquiries" className="relative p-2" aria-label="Enquiry notifications">
            <Bell className="size-5" />
            {unread ? (
              <Badge className="absolute -top-0.5 -right-0.5 h-5 min-w-5 justify-center px-1 text-[0.6rem]">
                {unread}
              </Badge>
            ) : null}
          </Link>

          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium">{session.email}</p>
            <p className="text-muted-foreground text-[0.65rem] tracking-widest uppercase">Admin</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Log out"
            onClick={async () => {
              await supabase.auth.signOut();
              void navigate({ to: "/admin/login" });
            }}
          >
            <LogOut className="size-4" />
          </Button>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
