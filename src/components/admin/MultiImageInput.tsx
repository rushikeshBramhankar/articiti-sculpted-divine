import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { uploadMedia } from "@/lib/admin";

export function MultiImageInput({
  label,
  value,
  onChange,
  folder = "uploads",
}: {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
}) {
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push(await uploadMedia(f, folder));
      onChange([...value, ...urls]);
      toast.success(`Uploaded ${urls.length} image${urls.length > 1 ? "s" : ""}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  function move(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div key={url + i} className="relative">
            <img src={url} alt={`Image ${i + 1}`} className="size-24 rounded-md border border-border object-cover" />
            {i === 0 && (
              <span className="bg-background absolute bottom-1 left-1 rounded px-1 text-[10px]">Main</span>
            )}
            <button type="button" aria-label="Remove image" onClick={() => onChange(value.filter((_, k) => k !== i))}
              className="bg-background absolute -top-2 -right-2 rounded-full border border-border p-1">
              <X className="size-3" />
            </button>
            <div className="mt-1 flex justify-between">
              <button type="button" aria-label="Move left" onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-30"><ArrowLeft className="size-3" /></button>
              <button type="button" aria-label="Move right" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="disabled:opacity-30"><ArrowRight className="size-3" /></button>
            </div>
          </div>
        ))}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => void handleFiles(e.target.files)} />
      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => ref.current?.click()}>
        {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
        Upload images
      </Button>
    </div>
  );
}
