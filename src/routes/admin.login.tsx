import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Login — ARTICITI" },
      { name: "description", content: "Secure sign-in for the ARTICITI team." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Login — ARTICITI" },
      { property: "og:description", content: "Secure sign-in for the ARTICITI team." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) void navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("Invalid credentials.");
      return;
    }
    void navigate({ to: "/admin" });
  }

  async function forgotPassword() {
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent if the account exists.");
  }

  return (
    <div className="bg-ink text-ink-foreground flex min-h-screen items-center justify-center px-5">
      <form
        onSubmit={signIn}
        className="bg-background text-foreground w-full max-w-sm space-y-6 rounded-lg p-8 shadow-xl"
      >
        <div className="text-center">
          <p className="font-display text-2xl tracking-[0.34em]">ARTICITI</p>
          <h1 className="font-display mt-3 text-xl">Welcome to Articiti Admin</h1>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign In"}
        </Button>

        <button
          type="button"
          onClick={forgotPassword}
          className="text-muted-foreground hover:text-foreground w-full text-center text-xs"
        >
          Forgot password?
        </button>
      </form>
    </div>
  );
}
