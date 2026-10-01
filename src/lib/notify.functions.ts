import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  enquiryId: z.string(),
  fullName: z.string(),
  phone: z.string(),
  city: z.string().optional().nullable(),
  product: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  thickness: z.string().optional().nullable(),
  estimate: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
  adminUrl: z.string(),
});

/** Best-effort email notification for a new enquiry. */
export const notifyNewEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) return { sent: false, reason: "email_not_configured" as const };

    const rows: [string, string | null | undefined][] = [
      ["Name", data.fullName],
      ["Phone", data.phone],
      ["City", data.city],
      ["Product", data.product],
      ["Size", data.size],
      ["Thickness", data.thickness],
      ["Price", data.estimate],
      ["Message", data.message],
    ];

    const html = `<h2>New ARTINCITY enquiry</h2><table>${rows
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${v}</td></tr>`)
      .join("")}</table><p><a href="${data.adminUrl}">Open in admin dashboard</a></p>`;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ARTINCITY <onboarding@resend.dev>",
          to: ["rushikeshbramhankar.dev@gmail.com"],
          subject: `New enquiry — ${data.fullName}`,
          html,
        }),
      });
      if (!res.ok) return { sent: false, reason: "send_failed" as const };
      return { sent: true, reason: null };
    } catch {
      return { sent: false, reason: "send_failed" as const };
    }
  });

const customSchema = z.object({
  name: z.string().max(200),
  phone: z.string().max(40),
  email: z.string().max(255).optional().nullable(),
  size: z.string().max(60).optional().nullable(),
  imageUrl: z.string().max(2000),
  adminUrl: z.string().max(500),
});

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Best-effort email notification for a new custom design request. */
export const notifyCustomRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => customSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) return { sent: false, reason: "email_not_configured" as const };
    const rows: [string, string | null | undefined][] = [
      ["Name", data.name],
      ["Phone", data.phone],
      ["Email", data.email],
      ["Size", data.size],
    ];
    const html = `<h2>New Custom Design Request</h2><table>${rows
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v!)}</td></tr>`)
      .join("")}</table><p><a href="${esc(data.imageUrl)}">View uploaded design image</a></p><p><a href="${esc(data.adminUrl)}">Open in admin dashboard</a></p>`;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "ARTINCITY <onboarding@resend.dev>",
          to: ["rushikeshbramhankar.dev@gmail.com"],
          subject: `New Custom Design Request — ${data.name}`,
          html,
        }),
      });
      return { sent: res.ok, reason: res.ok ? null : ("send_failed" as const) };
    } catch {
      return { sent: false, reason: "send_failed" as const };
    }
  });
