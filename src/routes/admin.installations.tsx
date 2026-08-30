import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { db, formatDate } from "@/lib/admin";

export const Route = createFileRoute("/admin/installations")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Installations — ARTINCITY Admin" },
      { name: "description", content: "Manage real completed installation projects." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Installations — ARTINCITY Admin" },
      { property: "og:description", content: "Manage real completed installation projects." },
    ],
  }),
  component: InstallationsPage,
});

function InstallationsPage() {
  const products = useQuery({
    queryKey: ["admin", "product-options"],
    queryFn: async () => {
      const res = await db.from("products").select("id,name").order("name");
      return ((res.data ?? []) as { id: string; name: string }[]).map((p) => ({
        value: p.id,
        label: p.name,
      }));
    },
  });

  return (
    <AdminShell title="Real Installations">
      <ResourceManager
        table="installations"
        singular="Installation"
        orderBy="created_at"
        ascending={false}
        columns={[
          {
            key: "final_image_url",
            label: "Image",
            render: (row) =>
              row["final_image_url"] || row["after_image_url"] ? (
                <img
                  src={String(row["final_image_url"] ?? row["after_image_url"])}
                  alt=""
                  className="size-12 rounded object-cover"
                />
              ) : (
                "—"
              ),
          },
          { key: "project_name", label: "Project" },
          { key: "city", label: "City" },
          {
            key: "installed_on",
            label: "Installed",
            render: (row) => formatDate(row["installed_on"] as string | null),
          },
          {
            key: "is_featured",
            label: "Featured",
            render: (row) => (row["is_featured"] ? "Yes" : "No"),
          },
          { key: "status", label: "Status" },
        ]}
        defaults={{ status: "published", is_featured: false }}
        fields={[
          { key: "project_name", label: "Project name", type: "text" },
          { key: "city", label: "City", type: "text" },
          { key: "product_id", label: "Product", type: "select", options: products.data ?? [] },
          { key: "size_label", label: "Size", type: "text" },
          { key: "material_label", label: "Material", type: "text" },
          { key: "finish_label", label: "Finish", type: "text" },
          { key: "installed_on", label: "Installed on", type: "date" },
          { key: "before_image_url", label: "Before image", type: "image" },
          { key: "after_image_url", label: "After image", type: "image" },
          { key: "final_image_url", label: "Final image", type: "image" },
          { key: "video_url", label: "Video URL", type: "text" },
          { key: "is_featured", label: "Featured", type: "switch" },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "published", label: "Published" },
              { value: "draft", label: "Draft" },
            ],
          },
        ]}
      />
    </AdminShell>
  );
}
