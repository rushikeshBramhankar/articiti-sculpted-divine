export function whatsappHref(
  number: string,
  message = "Hi ArtInCity, I'd like to know more about your devotional wall sculptures.",
) {
  const digits = (number || "8010129969").replace(/\D/g, "");
  const withCode = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCode}?text=${encodeURIComponent(message)}`;
}

export function enquiryMessage(parts: {
  product?: string | undefined;
  size?: string | undefined;
  material?: string | undefined;
  finish?: string | undefined;
}) {
  return [
    `Hi ArtInCity, I'm interested in the ${parts.product ?? "wall sculpture"} wall sculpture.`,
    parts.size ? `Size: ${parts.size}` : null,
    parts.material ? `Material: ${parts.material}` : null,
    parts.finish ? `Finish: ${parts.finish}` : null,
    "I'd like to know the final quotation.",
  ]
    .filter(Boolean)
    .join("\n");
}
