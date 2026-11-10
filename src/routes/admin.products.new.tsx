import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export const Route = createFileRoute("/admin/products/new")({
  ssr: false,
  head: () => ({
    meta: [
      { name: "description", content: "Manage products new with Interior by Veera." },
      { property: "og:title", content: "Create Product — Interior by Veera Admin" },
      { property: "og:description", content: "Manage products new with Interior by Veera." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Create Product — Interior by Veera Admin" },
      { name: "twitter:description", content: "Manage products new with Interior by Veera." },

      { title: "Create Product — Interior by Veera Admin" },
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
