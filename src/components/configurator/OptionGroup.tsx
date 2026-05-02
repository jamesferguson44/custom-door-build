import { cn } from "@/lib/utils";

type Props<T extends string> = {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
};

export function OptionGroup<T extends string>({ label, value, options, onChange }: Props<T>) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((opt) => {
          const selected = opt === value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "rounded-lg border px-4 py-3 text-sm font-medium transition-all",
                "hover:border-foreground/40",
                selected
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : "border-border bg-card text-foreground"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}