import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  enquiryId: z.string(),
  fullName: z.string(),
  phone: z.string(),
  city: z.string().optional().nullable(),
  product: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  finish: z.string().optional().nullable(),
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
      ["Material", data.material],
      ["Finish", data.finish],
      ["Estimate", data.estimate],
      ["Message", data.message],
    ];

    const html = `<h2>New ARTICITI enquiry</h2><table>${rows
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
          from: "ARTICITI <onboarding@resend.dev>",
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
