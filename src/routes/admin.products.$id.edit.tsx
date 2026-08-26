import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export const Route = createFileRoute("/admin/products/$id/edit")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Edit Product — ARTICITI Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditProductPage,
});

function EditProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  return (
    <AdminShell title="Edit Product">
      <div className="max-w-4xl">
        <ProductForm
          productId={id}
          onSuccess={() => {
            navigate({ to: "/admin/products" });
          }}
        />
      </div>
    </AdminShell>
  );
}
