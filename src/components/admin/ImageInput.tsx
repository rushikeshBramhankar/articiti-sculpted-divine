import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { uploadMedia } from "@/lib/admin";

export function ImageInput({
  label,
  value,
  onChange,
  folder = "uploads",
  accept = "image/*",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadMedia(file, folder);
      onChange(url);
      toast.success("Uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-3">
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt={label}
              className="size-20 rounded-md border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove image"
              className="bg-background absolute -top-2 -right-2 rounded-full border border-border p-1"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : null}
        <div className="flex-1 space-y-2">
          <Input
            value={value}
            placeholder="Paste an image/video URL or upload"
            onChange={(e) => onChange(e.target.value)}
          />
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Upload className="mr-2 size-4" />
            )}
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
