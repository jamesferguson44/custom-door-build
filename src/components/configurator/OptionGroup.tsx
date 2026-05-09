import { cn } from "@/lib/utils";

type Props<T extends string> = {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  descriptions?: Partial<Record<T, string>>;
  badges?: Partial<Record<T, string>>;
};

export function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  descriptions,
  badges,
}: Props<T>) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-base font-semibold tracking-tight">{label}</h3>
        <span className="text-xs text-muted-foreground">{value}</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((opt) => {
          const selected = opt === value;
          const badge = badges?.[opt];
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "group relative rounded-xl border bg-card px-4 py-3.5 text-left transition-all",
                "hover:border-foreground/30 hover:shadow-sm",
                selected
                  ? "border-foreground ring-1 ring-foreground/80 shadow-sm"
                  : "border-border"
              )}
            >
              {badge && (
                <span className="absolute -top-2 right-3 rounded-full border border-foreground/15 bg-foreground px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-background shadow-sm">
                  {badge}
                </span>
              )}
              <div className="text-sm font-medium">{opt}</div>
              {descriptions?.[opt] && (
                <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                  {descriptions[opt]}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
