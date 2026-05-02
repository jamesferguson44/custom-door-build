import { Input } from "@/components/ui/input";

type Props = {
  width: number;
  height: number;
  onChange: (w: number, h: number) => void;
};

export function SizeInputs({ width, height, onChange }: Props) {
  const invalid = width <= 0 || height <= 0;
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-base font-semibold tracking-tight">Dimensions</h3>
        <span className="text-xs text-muted-foreground">inches</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Width" value={width} onChange={(v) => onChange(v, height)} />
        <NumberField label="Height" value={height} onChange={(v) => onChange(width, v)} />
      </div>
      {invalid && (
        <p className="mt-2 text-xs text-destructive">
          Width and height must be greater than zero.
        </p>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block rounded-xl border border-border bg-card px-4 py-3 transition focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground/40">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <Input
          type="number"
          min={1}
          max={240}
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-8 border-0 bg-transparent p-0 text-2xl font-semibold tabular-nums shadow-none focus-visible:ring-0 md:text-2xl"
        />
        <span className="text-sm text-muted-foreground">in</span>
      </div>
    </label>
  );
}
