import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { ImageInput } from "@/components/admin/ImageInput";
import { db } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/admin/settings")({ ssr: false, head: () => ({ meta: [{ title: "Website Settings — ARTINCITY Admin" }, { name: "robots", content: "noindex" }] }), component: SettingsPage });

const SETTING_KEYS = [
  "brand_name",
  "tagline",
  "supporting_line",
  "whatsapp_number",
  "instagram_url",
  "contact_email",
  "footer_text",
  "hero_heading",
  "hero_subheading",
  "hero_note",
  "hero_image_url",
];

const LABELS: Record<string, string> = {
  brand_name: "Brand Name",
  tagline: "Tagline",
  supporting_line: "Supporting Line",
  whatsapp_number: "WhatsApp Number",
  instagram_url: "Instagram URL",
  contact_email: "Contact Email",
  footer_text: "Footer Text",
  hero_heading: "Hero Heading",
  hero_subheading: "Hero Subheading",
  hero_note: "Hero Note",
  hero_image_url: "Hero Image URL",
};

function SettingsPage() {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: settings = [] } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const res = await db.from("website_settings").select("key,value");
      if (res.error) throw new Error(res.error.message);
      return res.data as { key: string; value: string }[];
    },
  });

  useMemo(() => {
    const newValues: Record<string, string> = {};
    settings.forEach((s) => {
      newValues[s.key] = s.value || "";
    });
    setValues(newValues);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Upsert all changed values
      for (const key of SETTING_KEYS) {
        const currentValue = settings.find((s) => s.key === key)?.value || "";
        if (values[key] !== currentValue) {
          const existing = settings.find((s) => s.key === key);
          if (existing) {
            const res = await db.from("website_settings").update({ value: values[key] }).eq("key", key);
            if (res.error) throw new Error(res.error.message);
          } else {
            const res = await db.from("website_settings").insert({ key, value: values[key] });
            if (res.error) throw new Error(res.error.message);
          }
        }
      }
    },
    onSuccess: () => {
      toast.success("Settings saved");
      setHasChanges(false);
      void qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }

  return (
    <AdminShell title="Website Settings">
      <div className="max-w-2xl space-y-6">
        {/* Brand Info */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Brand Information</h2>
          <div className="space-y-3">
            <div>
              <Label>{LABELS["brand_name"]}</Label>
              <Input
                value={values["brand_name"] || ""}
                onChange={(e) => handleChange("brand_name", e.target.value)}
              />
            </div>
            <div>
              <Label>{LABELS["tagline"]}</Label>
              <Input
                value={values["tagline"] || ""}
                onChange={(e) => handleChange("tagline", e.target.value)}
              />
            </div>
            <div>
              <Label>{LABELS["supporting_line"]}</Label>
              <Textarea
                value={values["supporting_line"] || ""}
                onChange={(e) => handleChange("supporting_line", e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Contact Information</h2>
          <div className="space-y-3">
            <div>
              <Label>{LABELS["whatsapp_number"]}</Label>
              <Input
                value={values["whatsapp_number"] || ""}
                onChange={(e) => handleChange("whatsapp_number", e.target.value)}
              />
            </div>
            <div>
              <Label>{LABELS["contact_email"]}</Label>
              <Input
                type="email"
                value={values["contact_email"] || ""}
                onChange={(e) => handleChange("contact_email", e.target.value)}
              />
            </div>
            <div>
              <Label>{LABELS["instagram_url"]}</Label>
              <Input
                value={values["instagram_url"] || ""}
                onChange={(e) => handleChange("instagram_url", e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Hero Section */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Hero Section</h2>
          <div className="space-y-3">
            <div>
              <Label>{LABELS["hero_heading"]}</Label>
              <Input
                value={values["hero_heading"] || ""}
                onChange={(e) => handleChange("hero_heading", e.target.value)}
              />
            </div>
            <div>
              <Label>{LABELS["hero_subheading"]}</Label>
              <Textarea
                value={values["hero_subheading"] || ""}
                onChange={(e) => handleChange("hero_subheading", e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label>{LABELS["hero_note"]}</Label>
              <Input
                value={values["hero_note"] || ""}
                onChange={(e) => handleChange("hero_note", e.target.value)}
              />
            </div>
            <div>
              <ImageInput
                label={LABELS["hero_image_url"] ?? ""}
                value={values["hero_image_url"] || ""}
                onChange={(url) => handleChange("hero_image_url", url)}
                folder="settings"
              />
            </div>
          </div>
        </Card>

        {/* Footer */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Footer</h2>
          <div>
            <Label>{LABELS["footer_text"]}</Label>
            <Textarea
              value={values["footer_text"] || ""}
              onChange={(e) => handleChange("footer_text", e.target.value)}
              rows={3}
            />
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !hasChanges}
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}