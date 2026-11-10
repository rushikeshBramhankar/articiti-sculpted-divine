import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/categories")({
  ssr: false,
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Categories — Interior by Veera Admin" },
      { name: "twitter:description", content: "Manage deity collections shown on the website." },

      { title: "Categories — Interior by Veera Admin" },
      { name: "description", content: "Manage deity collections shown on the website." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Categories — Interior by Veera Admin" },
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
