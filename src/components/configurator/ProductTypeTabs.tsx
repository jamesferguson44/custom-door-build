import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { ProductType } from "@/lib/pricing";

const TABS: { type: ProductType; label: string }[] = [
  { type: "window", label: "Windows" },
  { type: "door", label: "Doors" },
  { type: "sliding_door", label: "Sliding" },
];

export function ProductTypeTabs({ active }: { active: ProductType }) {
  return (
    <div className="inline-flex rounded-full border border-border bg-muted/40 p-1">
      {TABS.map((t) => (
        <Link
          key={t.type}
          to="/configure/$type"
          params={{ type: t.type }}
          className={cn(
            "rounded-full px-3 py-1.5 text-[12px] sm:px-4 sm:text-[13px] font-medium transition",
            active === t.type
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
