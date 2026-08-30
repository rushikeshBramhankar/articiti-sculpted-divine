import { cn } from "@/lib/utils";

/**
 * ARTinCITY wordmark — serif caps joined by a script "in" flourish.
 * Inherits color from context (currentColor).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline whitespace-nowrap leading-none",
        className,
      )}
    >
      <span className="font-display uppercase tracking-[0.22em]">ART</span>
      <span
        aria-hidden="true"
        className="lowercase italic"
        style={{
          fontFamily: "var(--font-script)",
          fontSize: "1.4em",
          marginLeft: "0.12em",
          marginRight: "0.08em",
          transform: "translateY(0.12em)",
        }}
      >
        in
      </span>
      <span className="font-display uppercase tracking-[0.22em]">CITY</span>
    </span>
  );
}
