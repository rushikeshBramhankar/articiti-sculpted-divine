import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/categories")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Categories — ARTINCITY Admin" },
      { name: "description", content: "Manage deity collections shown on the website." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Categories — ARTINCITY Admin" },
      { property: "og:description", content: "Manage deity collections shown on the website." },
    ],
  }),
  component: () => (
    <AdminShell title="Categories">
      <ResourceManager
        table="categories"
        singular="Category"
        orderBy="display_order"
        columns={[
          {
            key: "cover_image_url",
            label: "Image",
            render: (row) =>
              row["cover_image_url"] ? (
                <img
                  src={String(row["cover_image_url"])}
                  alt=""
                  className="size-12 rounded object-cover"
                />
              ) : (
                "—"
              ),
          },
          { key: "name", label: "Name" },
          { key: "slug", label: "Slug" },
          { key: "status", label: "Status" },
          { key: "display_order", label: "Order" },
        ]}
        defaults={{ status: "published", display_order: 0 }}
        fields={[
          { key: "name", label: "Name", type: "text" },
          { key: "slug", label: "Slug", type: "slug" },
          { key: "subtitle", label: "Subtitle", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "cover_image_url", label: "Cover image", type: "image" },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "published", label: "Published" },
              { value: "draft", label: "Draft" },
              { value: "archived", label: "Archived" },
            ],
          },
          { key: "display_order", label: "Display order", type: "number" },
        ]}
      />
    </AdminShell>
  ),
});
