import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { ProductType } from "@/lib/pricing";

const TABS: { type: ProductType; label: string }[] = [
  { type: "window", label: "Windows" },
  { type: "door", label: "Exterior Doors" },
  { type: "sliding_door", label: "Sliding Glass Doors" },
];

export function ProductTypeTabs({ active }: { active: ProductType }) {
  return (
    <div className="inline-flex rounded-xl border bg-muted/50 p-1">
      {TABS.map((t) => (
        <Link
          key={t.type}
          to="/configure/$type"
          params={{ type: t.type }}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition",
            active === t.type
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}