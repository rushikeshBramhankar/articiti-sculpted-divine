import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Loosely-typed client for generic admin CRUD across many tables. */
export const db = supabase as unknown as SupabaseClient;

export type AdminSession = {
  loading: boolean;
  email: string | null;
  userId: string | null;
  isAdmin: boolean;
};

export function useAdminSession(): AdminSession {
  const [state, setState] = useState<AdminSession>({
    loading: true,
    email: null,
    userId: null,
    isAdmin: false,
  });

  useEffect(() => {
    let active = true;

    async function load() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        if (active) setState({ loading: false, email: null, userId: null, isAdmin: false });
        return;
      }
      const roles = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");
      if (!active) return;
      setState({
        loading: false,
        email: user.email ?? null,
        userId: user.id,
        isAdmin: (roles.data?.length ?? 0) > 0,
      });
    }

    void load();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") void load();
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Uploads a file to the media bucket and returns a long-lived signed URL. */
export async function uploadMedia(file: File, folder = "uploads") {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("media").upload(path, file, { upsert: false });
  if (up.error) throw new Error(up.error.message);
  const signed = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (signed.error || !signed.data) throw new Error(signed.error?.message ?? "Could not sign URL");
  return signed.data.signedUrl;
}

export function formatINR(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const ENQUIRY_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUOTED",
  "NEGOTIATING",
  "WON",
  "LOST",
] as const;

export const ORDER_STATUSES = [
  "ENQUIRY",
  "QUOTATION SENT",
  "ORDER CONFIRMED",
  "IN PRODUCTION",
  "ARTIST FINISHING",
  "READY",
  "INSTALLATION SCHEDULED",
  "INSTALLED",
  "COMPLETED",
  "CANCELLED",
] as const;

export const SUITABLE_FOR_OPTIONS = [
  "Living Room",
  "Pooja Room",
  "Entrance / Foyer",
  "Bedroom",
  "Office / Reception",
  "Restaurant / Hotel",
] as const;
