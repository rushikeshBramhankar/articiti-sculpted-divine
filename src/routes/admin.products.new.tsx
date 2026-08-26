import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export const Route = createFileRoute("/admin/products/new")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create Product — ARTICITI Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewProductPage,
});

function NewProductPage() {
  const navigate = useNavigate();

  return (
    <AdminShell title="Create New Product">
      <div className="max-w-4xl">
        <ProductForm
          onSuccess={() => {
            navigate({ to: "/admin/products" });
          }}
        />
      </div>
    </AdminShell>
  );
}
