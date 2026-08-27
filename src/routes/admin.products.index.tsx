import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Eye, Copy, Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { db, formatINR, formatDate } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export const Route = createFileRoute("/admin/products/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Products — ARTICITI Admin" },
      { name: "description", content: "Manage all devotional wall sculpture products." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Products — ARTICITI Admin" },
      { property: "og:description", content: "Manage all devotional wall sculpture products." },
    ],
  }),
  component: ProductsPage,
});

interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  starting_price: number | null;
  status: string;
  is_featured: boolean;
  main_image_url: string;
  updated_at: string;
  category?: { name: string };
}

function ProductsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const res = await db
        .from("products")
        .select("*, category:categories(name)")
        .order("updated_at", { ascending: false });
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []) as Product[];
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (productId: string) => {
      const product = products.find((p) => p.id === productId);
      if (!product) throw new Error("Product not found");

      // Create new product with -copy suffix
      const newProduct = { ...product };
      delete (newProduct as any).id;
      delete (newProduct as any).created_at;
      delete (newProduct as any).updated_at;
      delete (newProduct as any).category;
      newProduct.slug = `${product.slug}-copy`;
      newProduct.name = `Copy of ${product.name}`;
      newProduct.status = "draft";

      const insertRes = await db
        .from("products")
        .insert(newProduct)
        .select("id")
        .single();

      if (insertRes.error) throw new Error(insertRes.error.message);

      const newId = (insertRes.data as any).id;

      // Copy product_materials
      const materials = await db
        .from("product_materials")
        .select("material_id")
        .eq("product_id", productId);

      if (materials.data && materials.data.length > 0) {
        await db.from("product_materials").insert(
          materials.data.map((m: any) => ({
            product_id: newId,
            material_id: m.material_id,
          }))
        );
      }

      // Copy product_finishes
      const finishes = await db
        .from("product_finishes")
        .select("finish_id")
        .eq("product_id", productId);

      if (finishes.data && finishes.data.length > 0) {
        await db.from("product_finishes").insert(
          finishes.data.map((f: any) => ({
            product_id: newId,
            finish_id: f.finish_id,
          }))
        );
      }

      return newId;
    },
    onSuccess: () => {
      toast.success("Product duplicated");
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archiveMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await db
        .from("products")
        .update({ status: "archived" })
        .eq("id", productId);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      toast.success("Product archived");
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      // Delete related records first
      await db.from("product_materials").delete().eq("product_id", productId);
      await db.from("product_finishes").delete().eq("product_id", productId);
      await db.from("product_images").delete().eq("product_id", productId);

      const res = await db.from("products").delete().eq("id", productId);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      toast.success("Product deleted");
      setDeleteId(null);
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell
      title="Products"
      actions={
        <Button onClick={() => navigate({ to: "/admin/products/new" })}>
          <Plus className="mr-2 size-4" /> Add Product
        </Button>
      }
    >
      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Starting Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8}>Loading…</TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground text-center py-8">
                  No products yet. Create your first product!
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.main_image_url ? (
                      <img
                        src={product.main_image_url}
                        alt={product.name}
                        className="size-12 rounded object-cover"
                      />
                    ) : (
                      <div className="size-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category?.name || "—"}</TableCell>
                  <TableCell>{formatINR(product.starting_price)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      product.status === "published" 
                        ? "bg-green-100 text-green-800" 
                        : product.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{product.is_featured ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(product.updated_at)}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit"
                      onClick={() =>
                        navigate({
                          to: `/admin/products/${product.id}/edit`,
                        })
                      }
                    >
                      <Plus className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Duplicate"
                      onClick={() => duplicateMutation.mutate(product.id)}
                      disabled={duplicateMutation.isPending}
                    >
                      <Copy className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Preview"
                      onClick={() => window.open(`/products/${product.slug}`, "_blank")}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Archive"
                      onClick={() => archiveMutation.mutate(product.id)}
                      disabled={archiveMutation.isPending}
                    >
                      <Archive className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete"
                      onClick={() => setDeleteId(product.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product and all related data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}
