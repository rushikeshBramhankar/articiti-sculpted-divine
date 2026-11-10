import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export const Route = createFileRoute("/admin/products/$id/edit")({
  ssr: false,
  head: () => ({
    meta: [
      { name: "description", content: "Manage products details edit with Interior by Veera." },
      { property: "og:title", content: "Edit Product — Interior by Veera Admin" },
      { property: "og:description", content: "Manage products details edit with Interior by Veera." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Edit Product — Interior by Veera Admin" },
      { name: "twitter:description", content: "Manage products details edit with Interior by Veera." },

      { title: "Edit Product — Interior by Veera Admin" },
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
