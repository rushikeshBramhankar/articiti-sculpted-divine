import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { db, slugify } from "@/lib/admin";
import { ImageInput } from "./ImageInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export type Row = Record<string, unknown>;

export type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "switch" | "image" | "select" | "date" | "slug";
  options?: { value: string; label: string }[];
  from?: string;
  placeholder?: string;
  help?: string;
};

export type Column = {
  key: string;
  label: string;
  render?: (row: Row) => ReactNode;
};

export function ResourceManager({
  table,
  select = "*",
  orderBy = "created_at",
  ascending = true,
  columns,
  fields,
  defaults = {},
  singular,
}: {
  table: string;
  select?: string;
  orderBy?: string;
  ascending?: boolean;
  columns: Column[];
  fields: Field[];
  defaults?: Row;
  singular: string;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});

  const list = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const res = await db.from(table).select(select).order(orderBy, { ascending });
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []) as Row[];
    },
  });

  const save = useMutation({
    mutationFn: async (values: Row) => {
      const payload = { ...values };
      delete payload["id"];
      delete payload["created_at"];
      delete payload["updated_at"];
      const id = values["id"] as string | undefined;
      const res = id
        ? await db.from(table).update(payload).eq("id", id)
        : await db.from(table).insert(payload);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      toast.success(`${singular} saved`);
      setEditing(null);
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await db.from(table).delete().eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      toast.success(`${singular} deleted`);
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(() => list.data ?? [], [list.data]);

  function open(row: Row | null) {
    setEditing(row ?? {});
    setForm(row ? { ...row } : { ...defaults });
  }

  function setValue(key: string, value: unknown) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      const slugField = fields.find((f) => f.type === "slug");
      if (key === "name" && slugField && !prev["id"]) {
        next[slugField.key] = slugify(String(value ?? ""));
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => open(null)}>
          <Plus className="mr-2 size-4" /> Add {singular}
        </Button>
      </div>

      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key}>{c.label}</TableHead>
              ))}
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1}>Loading…</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-muted-foreground">
                  Nothing here yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={String(row["id"])}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className="align-middle">
                      {c.render ? c.render(row) : ((row[c.key] as ReactNode) ?? "—")}
                    </TableCell>
                  ))}
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => open(row)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Delete this ${singular.toLowerCase()}?`))
                          remove.mutate(String(row["id"]));
                      }}
                    >
                      <Trash2 className="text-destructive size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {form["id"] ? `Edit ${singular}` : `New ${singular}`}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const value = form[field.key];
              if (field.type === "image") {
                return (
                  <div key={field.key} className="sm:col-span-2">
                    <ImageInput
                      label={field.label}
                      value={String(value ?? "")}
                      onChange={(url) => setValue(field.key, url)}
                      folder={table}
                    />
                  </div>
                );
              }
              if (field.type === "textarea") {
                return (
                  <div key={field.key} className="space-y-2 sm:col-span-2">
                    <Label>{field.label}</Label>
                    <Textarea
                      value={String(value ?? "")}
                      onChange={(e) => setValue(field.key, e.target.value)}
                    />
                  </div>
                );
              }
              if (field.type === "switch") {
                return (
                  <div key={field.key} className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
                    <Label>{field.label}</Label>
                    <Switch
                      checked={Boolean(value)}
                      onCheckedChange={(v) => setValue(field.key, v)}
                    />
                  </div>
                );
              }
              if (field.type === "select") {
                return (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <Select
                      value={value ? String(value) : "__none"}
                      onValueChange={(v) => setValue(field.key, v === "__none" ? null : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">— None —</SelectItem>
                        {(field.options ?? []).map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }
              return (
                <div key={field.key} className="space-y-2">
                  <Label>{field.label}</Label>
                  <Input
                    type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                    value={value === null || value === undefined ? "" : String(value)}
                    placeholder={field.placeholder ?? ""}
                    onChange={(e) =>
                      setValue(
                        field.key,
                        field.type === "number"
                          ? e.target.value === ""
                            ? null
                            : Number(e.target.value)
                          : e.target.value,
                      )
                    }
                  />
                  {field.help ? (
                    <p className="text-muted-foreground text-xs">{field.help}</p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button disabled={save.isPending} onClick={() => save.mutate(form)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
