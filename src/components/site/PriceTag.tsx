import { formatINR, type PriceInfo } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function PriceTag({
  info,
  size = "lg",
  prefix,
}: {
  info: PriceInfo;
  size?: "sm" | "lg";
  prefix?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-baseline", size === "lg" ? "gap-3" : "gap-2")}>
      <span className={size === "lg" ? "font-display text-4xl" : "text-sm text-foreground"}>
        {prefix}
        {formatINR(info.price)}
      </span>
      <span
        className={cn(
          "text-muted-foreground line-through",
          size === "lg" ? "text-lg" : "text-xs",
        )}
      >
        {formatINR(info.mrp)}
      </span>
      {info.off > 0 && (
        <span
          className={cn(
            "bg-accent text-accent-foreground font-medium",
            size === "lg" ? "px-2 py-1 text-xs" : "px-1.5 py-0.5 text-[0.6rem]",
          )}
        >
          {info.off}% off
        </span>
      )}
    </div>
  );
}
