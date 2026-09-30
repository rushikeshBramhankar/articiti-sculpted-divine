import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Plus, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { db, slugify, formatINR, formatDate, SUITABLE_FOR_OPTIONS } from "@/lib/admin";
import { ImageInput } from "./ImageInput";
import { MultiImageInput } from "./MultiImageInput";
import { THICKNESS_OPTIONS, usePricing, formatINR as fmtPrice } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ProductFormProps {
  productId?: string;
  onSuccess?: () => void;
}

interface ProductData {
  id?: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  height_ft: number | null;
  width_ft: number | null;
  thickness_options: number[];
  main_image_url: string;
  images: string[];
  side_view_url: string;
  closeup_url: string;
  installation_image_url: string;
  ai_visualization_url: string;
  video_url: string;
  suitable_for: string[];
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  display_order: number;
}

export function ProductForm({ productId, onSuccess }: ProductFormProps) {
  const qc = useQueryClient();
  const pricing = usePricing();
  const [form, setForm] = useState<ProductData>({
    category_id: null,
    name: "",
    slug: "",
    short_description: "",
    long_description: "",
    height_ft: null,
    width_ft: null,
    thickness_options: [],
    main_image_url: "",
    images: [],
    side_view_url: "",
    closeup_url: "",
    installation_image_url: "",
    ai_visualization_url: "",
    video_url: "",
    suitable_for: [],
    status: "draft",
    is_featured: false,
    display_order: 0,
  });
  const sizeSqft = (Number(form.height_ft) || 0) * (Number(form.width_ft) || 0);

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    images: true,
    materials: true,
    settings: false,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories-options"],
    queryFn: async () => {
      const res = await db.from("categories").select("id,name").order("name");
      return ((res.data ?? []) as { id: string; name: string }[]) || [];
    },
  });

  const { data: materials = [] } = useQuery({
    queryKey: ["admin", "materials-options"],
    queryFn: async () => {
      const res = await db.from("materials").select("id,name").order("name");
      return ((res.data ?? []) as { id: string; name: string }[]) || [];
    },
  });

  const { data: finishes = [] } = useQuery({
    queryKey: ["admin", "finishes-options"],
    queryFn: async () => {
      const res = await db.from("finishes").select("id,name").order("name");
      return ((res.data ?? []) as { id: string; name: string }[]) || [];
    },
  });

  const { data: product } = useQuery({
    queryKey: ["admin", "product", productId],
    queryFn: async () => {
      if (!productId) return null;
      const res = await db.from("products").select("*").eq("id", productId).single();
      if (res.error) throw new Error(res.error.message);
      return res.data as ProductData;
    },
    enabled: !!productId,
  });

  const { data: selectedMaterials = [] } = useQuery({
    queryKey: ["admin", "product-materials", productId],
    queryFn: async () => {
      if (!productId) return [];
      const res = await db.from("product_materials").select("material_id").eq("product_id", productId);
      return ((res.data ?? []) as { material_id: string }[]).map((m) => m.material_id) || [];
    },
    enabled: !!productId,
  });

  const { data: selectedFinishes = [] } = useQuery({
    queryKey: ["admin", "product-finishes", productId],
    queryFn: async () => {
      if (!productId) return [];
      const res = await db.from("product_finishes").select("finish_id").eq("product_id", productId);
      return ((res.data ?? []) as { finish_id: string }[]).map((f) => f.finish_id) || [];
    },
    enabled: !!productId,
  });

  const [checkedMaterials, setCheckedMaterials] = useState<string[]>([]);
  const [checkedFinishes, setCheckedFinishes] = useState<string[]>([]);

  useMemo(() => {
    if (product) {
      setForm({
        ...product,
        thickness_options: product.thickness_options ?? [],
        images: (product.images ?? []).filter((u) => typeof u === "string" && u.trim() !== ""),
      });
      setCheckedMaterials(selectedMaterials);
      setCheckedFinishes(selectedFinishes);
    }
  }, [product, selectedMaterials, selectedFinishes]);

  const [imagesUploading, setImagesUploading] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (status: "draft" | "published") => {
      const images = form.images.filter((u) => typeof u === "string" && u.trim() !== "");
      const payload = { ...form, images, status, main_image_url: images[0] ?? "", closeup_url: images[1] ?? "" };
      delete (payload as any)["id"];
      delete (payload as any)["size_sqft"];
      delete (payload as any)["created_at"];
      delete (payload as any)["updated_at"];

      const id = form.id;
      const res = id
        ? await db.from("products").update(payload).eq("id", id)
        : await db.from("products").insert(payload).select("id").single();

      if (res.error) throw new Error(res.error.message);

      const newProductId = id || (res.data as any)?.id;

      // Sync materials
      if (newProductId) {
        await db.from("product_materials").delete().eq("product_id", newProductId);
        if (checkedMaterials.length > 0) {
          await db.from("product_materials").insert(
            checkedMaterials.map((mid) => ({ product_id: newProductId, material_id: mid }))
          );
        }

        // Sync finishes
        await db.from("product_finishes").delete().eq("product_id", newProductId);
        if (checkedFinishes.length > 0) {
          await db.from("product_finishes").insert(
            checkedFinishes.map((fid) => ({ product_id: newProductId, finish_id: fid }))
          );
        }
      }

      return newProductId;
    },
    onSuccess: () => {
      toast.success(form.id ? "Product updated" : "Product created");
      void qc.invalidateQueries();
      onSuccess?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function setValue(key: keyof ProductData, value: unknown) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !prev.id) {
        next.slug = slugify(String(value ?? ""));
      }
      return next;
    });
  }

  function toggleSuitableFor(option: string) {
    setForm((prev) => ({
      ...prev,
      suitable_for: prev.suitable_for.includes(option)
        ? prev.suitable_for.filter((s) => s !== option)
        : [...prev.suitable_for, option],
    }));
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Collapsible
        open={expandedSections.basic}
        onOpenChange={(open) => setExpandedSections({ ...expandedSections, basic: open })}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="text-base font-semibold">Basic Information</span>
            <ChevronDown className="size-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setValue("name", e.target.value)}
                placeholder="e.g. Krishna Playing Flute"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setValue("slug", e.target.value)}
                placeholder="auto-generated"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={form.category_id || ""} onValueChange={(v) => setValue("category_id", v || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Short Description</Label>
            <Textarea
              value={form.short_description}
              onChange={(e) => setValue("short_description", e.target.value)}
              placeholder="Brief description for collection page"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Long Description</Label>
            <Textarea
              value={form.long_description}
              onChange={(e) => setValue("long_description", e.target.value)}
              placeholder="Detailed description for product page"
              rows={4}
            />
          </div>
          <div className="space-y-3 border-t pt-4">
            <p className="text-base font-semibold">Pricing</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Height (ft) *</Label>
                <Input
                  type="number"
                  value={form.height_ft ?? ""}
                  onChange={(e) => setValue("height_ft", e.target.value ? Number(e.target.value) : null)}
                  placeholder="e.g. 4"
                />
              </div>
              <div className="space-y-2">
                <Label>Width (ft) *</Label>
                <Input
                  type="number"
                  value={form.width_ft ?? ""}
                  onChange={(e) => setValue("width_ft", e.target.value ? Number(e.target.value) : null)}
                  placeholder="e.g. 5"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Size: {sizeSqft > 0 ? `${sizeSqft} sq ft` : "—"}
            </p>
            <Label>Thickness options *</Label>
            <div className="flex flex-wrap gap-4">
              {THICKNESS_OPTIONS.map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.thickness_options.includes(t)}
                    onCheckedChange={(c) =>
                      setValue(
                        "thickness_options",
                        c
                          ? [...form.thickness_options, t].sort((a, b) => a - b)
                          : form.thickness_options.filter((x) => x !== t),
                      )
                    }
                  />
                  {t} mm
                </label>
              ))}
            </div>
            {form.thickness_options.map((t) => {
              const info = pricing.priceFor({ size_sqft: sizeSqft, thickness_options: form.thickness_options }, t);
              return (
                <p key={t} className="text-xs text-muted-foreground">
                  {t} mm: {info ? `${fmtPrice(info.price)} (MRP ${fmtPrice(info.mrp)}, ${info.off}% off)` : "enter size"}
                </p>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Images */}
      <Collapsible
        open={expandedSections.images}
        onOpenChange={(open) => setExpandedSections({ ...expandedSections, images: open })}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="text-base font-semibold">Images</span>
            <ChevronDown className="size-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4">
          <MultiImageInput
            label="Product Images (first image is the main image)"
            value={form.images}
            onChange={(urls) => setValue("images", urls)}
            folder="products"
            onBusyChange={setImagesUploading}
          />
          <ImageInput
            label="Side View"
            value={form.side_view_url}
            onChange={(url) => setValue("side_view_url", url)}
            folder="products"
          />
          <ImageInput
            label="Installation Image"
            value={form.installation_image_url}
            onChange={(url) => setValue("installation_image_url", url)}
            folder="products"
          />
          <p className="-mt-2 text-xs text-muted-foreground">
            The installation image is shown as an extra photo on the product page.
          </p>
          <ImageInput
            label="AI Visualization Image"
            value={form.ai_visualization_url}
            onChange={(url) => setValue("ai_visualization_url", url)}
            folder="products"
          />
          <div className="space-y-2">
            <Label>Product Video URL</Label>
            <Input
              value={form.video_url}
              onChange={(e) => setValue("video_url", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Materials & Finishes */}
      <Collapsible
        open={expandedSections.materials}
        onOpenChange={(open) => setExpandedSections({ ...expandedSections, materials: open })}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="text-base font-semibold">Materials & Finishes</span>
            <ChevronDown className="size-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Available Materials</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {materials.map((m) => (
                <div key={m.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`material-${m.id}`}
                    checked={checkedMaterials.includes(m.id)}
                    onCheckedChange={() => {
                      setCheckedMaterials((prev) =>
                        prev.includes(m.id) ? prev.filter((x) => x !== m.id) : [...prev, m.id]
                      );
                    }}
                  />
                  <Label htmlFor={`material-${m.id}`} className="cursor-pointer font-normal">
                    {m.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Available Finishes</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {finishes.map((f) => (
                <div key={f.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`finish-${f.id}`}
                    checked={checkedFinishes.includes(f.id)}
                    onCheckedChange={() => {
                      setCheckedFinishes((prev) =>
                        prev.includes(f.id) ? prev.filter((x) => x !== f.id) : [...prev, f.id]
                      );
                    }}
                  />
                  <Label htmlFor={`finish-${f.id}`} className="cursor-pointer font-normal">
                    {f.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Suitable For</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {SUITABLE_FOR_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`suitable-${option}`}
                    checked={form.suitable_for.includes(option)}
                    onCheckedChange={() => toggleSuitableFor(option)}
                  />
                  <Label htmlFor={`suitable-${option}`} className="cursor-pointer font-normal">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Settings */}
      <Collapsible
        open={expandedSections.settings}
        onOpenChange={(open) => setExpandedSections({ ...expandedSections, settings: open })}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="text-base font-semibold">Settings</span>
            <ChevronDown className="size-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setValue("status", v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={form.display_order}
                onChange={(e) => setValue("display_order", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <Label>Featured</Label>
            <Switch
              checked={form.is_featured}
              onCheckedChange={(v) => setValue("is_featured", v)}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Actions */}
      <div className="flex gap-3 border-t pt-6">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleSave("draft")}
          disabled={saveMutation.isPending || imagesUploading}
          className="flex-1"
        >
          {imagesUploading ? "Uploading images…" : "Save Draft"}
        </Button>
        <Button
          onClick={() => handleSave("published")}
          disabled={saveMutation.isPending || imagesUploading}
          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {imagesUploading ? "Uploading images…" : "Publish"}
        </Button>
      </div>
    </div>
  );

  function handleSave(status: "draft" | "published") {
    const name = form.name.trim();
    if (!name) {
      toast.error("Product Name is required.");
      return;
    }
    if (!form.category_id) {
      toast.error("Please select a Category.");
      return;
    }
    if (!form.height_ft || form.height_ft <= 0 || !form.width_ft || form.width_ft <= 0) {
      toast.error("Height and Width (ft) must be greater than 0.");
      return;
    }
    if (form.thickness_options.length === 0) {
      toast.error("Select at least one thickness option.");
      return;
    }
    saveMutation.mutate(status);
  }
}
