import { cn } from "@/lib/utils";

/** Serif wordmark with a script connector, inheriting currentColor. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      aria-label="Interior by Veera"
      className={cn("inline-flex max-w-full items-baseline whitespace-nowrap leading-none", className)}
    >
      <span aria-hidden="true" className="font-display uppercase tracking-[0.08em] sm:tracking-[0.12em]">INTERIOR</span>
      <span aria-hidden="true" className="mx-[0.3em] translate-y-[0.08em] font-[family-name:var(--font-script)] text-[1.3em] lowercase italic">by</span>
      <span aria-hidden="true" className="font-display uppercase tracking-[0.08em] sm:tracking-[0.12em]">VEERA</span>
    </span>
  );
}
