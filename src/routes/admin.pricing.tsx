import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { db } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  THICKNESS_OPTIONS,
  computePrice,
  formatINR,
  thicknessRatesQuery,
  usePricing,
  type PriceInfo,
  type ThicknessRate,
} from "@/lib/pricing";

export const Route = createFileRoute("/admin/pricing")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Pricing — ARTINCITY Admin" },
      { name: "description", content: "Thickness rates, MRP markup and product sizes." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Pricing — ARTINCITY Admin" },
      { property: "og:description", content: "Thickness rates, MRP markup and product sizes." },
    ],
  }),
  component: PricingPage,
});

type Row = { height: string; width: string; thicknesses: number[] };
type P = { id: string; name: string; height_ft: number | null; width_ft: number | null; thickness_options: number[] | null };

function PricingPage() {
  const qc = useQueryClient();
  const { rates, markup } = usePricing();

  // Thickness rates
  const [rateEdits, setRateEdits] = useState<Record<string, string>>({});
  useEffect(() => {
    setRateEdits(Object.fromEntries(rates.map((r) => [r.id, String(r.rate_per_sqft)])));
  }, [rates]);
  const liveRates: ThicknessRate[] = rates.map((r) => ({
    ...r,
    rate_per_sqft: Number(rateEdits[r.id] ?? r.rate_per_sqft) || 0,
  }));

  async function saveRates() {
    for (const r of rates) {
      const v = Number(rateEdits[r.id]);
      if (!Number.isFinite(v) || v < 0) { toast.error(`Invalid rate for ${r.thickness_mm} mm`); return; }
    }
    const results = await Promise.all(
      rates.map((r) =>
        db.from("thickness_rates").update({ rate_per_sqft: Number(rateEdits[r.id]) }).eq("id", r.id),
      ),
    );
    if (results.some((x) => x.error)) { toast.error("Could not save rates"); return; }
    await qc.invalidateQueries({ queryKey: thicknessRatesQuery.queryKey });
    toast.success("Thickness rates saved");
  }

  // Markup
  const [markupEdit, setMarkupEdit] = useState("");
  useEffect(() => setMarkupEdit(String(markup)), [markup]);
  const liveMarkup = Number(markupEdit);
  const effMarkup = Number.isFinite(liveMarkup) && markupEdit !== "" ? liveMarkup : markup;

  async function saveMarkup() {
    const v = Number(markupEdit);
    if (!Number.isFinite(v) || v < 0) { toast.error("Invalid markup"); return; }
    const existing = await db.from("website_settings").select("id").eq("key", "mrp_markup_pct").maybeSingle();
    const res = existing.data
      ? await db.from("website_settings").update({ value: String(v) }).eq("key", "mrp_markup_pct")
      : await db.from("website_settings").insert({ key: "mrp_markup_pct", value: String(v) });
    if (res.error) { toast.error("Could not save markup"); return; }
    await qc.invalidateQueries({ queryKey: ["settings"] });
    toast.success("Markup saved");
  }

  // Products
  const products = useQuery({
    queryKey: ["admin", "pricing-products"],
    queryFn: async () => {
      const res = await db.from("products").select("id,name,height_ft,width_ft,thickness_options").order("name");
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []) as P[];
    },
  });
  const [rows, setRows] = useState<Record<string, Row>>({});
  useEffect(() => {
    if (!products.data) return;
    setRows(
      Object.fromEntries(
        products.data.map((p) => [
          p.id,
          { height: p.height_ft != null ? String(p.height_ft) : "", width: p.width_ft != null ? String(p.width_ft) : "", thicknesses: p.thickness_options ?? [] },
        ]),
      ),
    );
  }, [products.data]);
  const sorted = useMemo(
    () => [...(products.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [products.data],
  );
  const [saving, setSaving] = useState(false);

  function lowest(row: Row | undefined): PriceInfo | null {
    if (!row) return null;
    const size = Number(row.height) * Number(row.width);
    return (
      row.thicknesses
        .map((t) => computePrice(size, t, liveRates, effMarkup))
        .filter((x): x is PriceInfo => x != null)
        .sort((a, b) => a.price - b.price)[0] ?? null
    );
  }

  async function saveAll() {
    setSaving(true);
    const results = await Promise.all(
      sorted.map((p) => {
        const r = rows[p.id];
        const num = (v?: string) => {
          const n = v && v.trim() !== "" ? Number(v) : NaN;
          return Number.isFinite(n) && n > 0 ? n : null;
        };
        return db
          .from("products")
          .update({
            height_ft: num(r?.height),
            width_ft: num(r?.width),
            thickness_options: [...(r?.thicknesses ?? [])].sort((a, b) => a - b),
          })
          .eq("id", p.id);
      }),
    );
    setSaving(false);
    if (results.some((x) => x.error)) { toast.error("Some products failed to save"); return; }
    await qc.invalidateQueries({ queryKey: ["admin", "pricing-products"] });
    await qc.invalidateQueries({ queryKey: ["products"] });
    await qc.invalidateQueries({ queryKey: ["product"] });
    toast.success("Product pricing saved");
  }

  return (
    <AdminShell title="Pricing">
      <div className="space-y-8">
        <Card className="p-6">
          <h2 className="font-display text-xl">Thickness rates</h2>
          <p className="mt-1 text-sm text-muted-foreground">All-inclusive final price per sq ft.</p>
          <Table className="mt-4 max-w-md">
            <TableHeader>
              <TableRow>
                <TableHead>Thickness</TableHead>
                <TableHead>Rate per sq ft (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.thickness_mm} mm</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      value={rateEdits[r.id] ?? ""}
                      onChange={(e) => setRateEdits((s) => ({ ...s, [r.id]: e.target.value }))}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button className="mt-4" onClick={saveRates}>Save rates</Button>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-xl">MRP markup %</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Used to compute the crossed-out MRP shown above the final price.
          </p>
          <div className="mt-4 flex max-w-xs items-center gap-3">
            <Input type="number" min={0} value={markupEdit} onChange={(e) => setMarkupEdit(e.target.value)} />
            <Button onClick={saveMarkup}>Save</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-xl">Product pricing</h2>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Height (ft)</TableHead>
                  <TableHead>Width (ft)</TableHead>
                  <TableHead>Sq ft</TableHead>
                  {THICKNESS_OPTIONS.map((t) => (
                    <TableHead key={t}>{t} mm</TableHead>
                  ))}
                  <TableHead>Lowest price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((p) => {
                  const r = rows[p.id];
                  const low = lowest(r);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          className="w-20"
                          aria-label={`Height for ${p.name}`}
                          value={r?.height ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setRows((s) => ({ ...s, [p.id]: { ...(s[p.id] ?? { height: "", width: "", thicknesses: [] }), height: v } }));
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          className="w-20"
                          aria-label={`Width for ${p.name}`}
                          value={r?.width ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setRows((s) => ({ ...s, [p.id]: { ...(s[p.id] ?? { height: "", width: "", thicknesses: [] }), width: v } }));
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r && Number(r.height) * Number(r.width) > 0 ? Number(r.height) * Number(r.width) : "—"}
                      </TableCell>
                      {THICKNESS_OPTIONS.map((t) => (
                        <TableCell key={t}>
                          <input
                            type="checkbox"
                            aria-label={`${p.name} ${t} mm`}
                            checked={r?.thicknesses.includes(t) ?? false}
                            onChange={(e) => {
                              const on = e.target.checked;
                              setRows((s) => {
                                const cur = s[p.id] ?? { height: "", width: "", thicknesses: [] };
                                const th = on
                                  ? [...new Set([...cur.thicknesses, t])]
                                  : cur.thicknesses.filter((x) => x !== t);
                                return { ...s, [p.id]: { ...cur, thicknesses: th } };
                              });
                            }}
                          />
                        </TableCell>
                      ))}
                      <TableCell>
                        {low ? formatINR(low.price) : <Badge variant="secondary">Pricing not set</Badge>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <Button className="mt-6" onClick={saveAll} disabled={saving || !products.data}>
            {saving ? "Saving…" : "Save all"}
          </Button>
        </Card>
      </div>
    </AdminShell>
  );
}
