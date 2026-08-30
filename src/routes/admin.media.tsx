import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { db, uploadMedia } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRef } from "react";

export const Route = createFileRoute("/admin/media")({ ssr: false, head: () => ({ meta: [{ title: "Media — ARTINCITY Admin" }, { name: "robots", content: "noindex" }] }), component: MediaPage });

interface MediaItem {
  id: string;
  url: string;
  type: "ai_visualization" | "real_installation";
  title?: string;
  product_id?: string;
}

function MediaPage() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceType, setSourceType] = useState<"ai_visualization" | "real_installation">("ai_visualization");
  const [uploading, setUploading] = useState(false);

  const { data: media = [], isLoading } = useQuery({
    queryKey: ["admin", "media"],
    queryFn: async () => {
      const res = await db.from("media").select("id,url,source_type,title,product_id").order("created_at", { ascending: false });
      if (res.error) throw new Error(res.error.message);
      return ((res.data ?? []) as unknown as { id: string; url: string; source_type: "ai_visualization" | "real_installation"; title?: string; product_id?: string }[]).map(
        (m) => ({ id: m.id, url: m.url, type: m.source_type, title: m.title, product_id: m.product_id })
      ) as MediaItem[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await db.from("media").delete().eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      toast.success("Media deleted");
      void qc.invalidateQueries({ queryKey: ["admin", "media"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file, "media");
      const res = await db.from("media").insert({ url, source_type: sourceType, title: file.name.split(".")[0] });
      if (res.error) throw new Error(res.error.message);
      toast.success("Media uploaded");
      void qc.invalidateQueries({ queryKey: ["admin", "media"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <AdminShell title="Media Library">
      <Card className="p-6 mb-6 space-y-4">
        <div className="space-y-2">
          <Label>Source Type</Label>
          <Select value={sourceType} onValueChange={(v: any) => setSourceType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ai_visualization">AI Visualization</SelectItem>
              <SelectItem value="real_installation">Real Installation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleUpload(e.target.files?.[0])}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="mr-2 size-4" />
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">Loading…</div>
        ) : media.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">No media yet</div>
        ) : (
          media.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="relative aspect-square bg-muted">
                <img src={item.url} alt={item.title} className="size-full object-cover" />
                <Badge
                  className={`absolute top-2 right-2 ${
                    item.type === "ai_visualization"
                      ? "bg-amber-500/80 text-white"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {item.type === "ai_visualization" ? "AI" : "REAL"}
                </Badge>
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteMutation.mutate(item.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="p-3">
                <p className="text-xs text-muted-foreground truncate">{item.title || item.id.slice(0, 8)}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </AdminShell>
  );
}