import { Input } from "@/components/ui/input";
import { ShieldCheck } from "lucide-react";

type Props = {
  width: number | null;
  height: number | null;
  onChange: (w: number | null, h: number | null) => void;
};

export function SizeInputs({ width, height, onChange }: Props) {
  const invalid = width != null && height != null && (width <= 0 || height <= 0);
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-base font-semibold tracking-tight">Dimensions</h3>
        <span className="text-xs text-muted-foreground">inches</span>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Approximate measurements are completely fine for quoting — you don't need to be exact.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Width" value={width} onChange={(v) => onChange(v, height)} />
        <NumberField label="Height" value={height} onChange={(v) => onChange(width, v)} />
      </div>
      {invalid && (
        <p className="mt-2 text-xs text-destructive">
          Width and height must be greater than zero.
        </p>
      )}
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-foreground/70" />
        <span>
          We professionally verify every measurement before anything is ordered. Your quote
          adjusts automatically if dimensions change.
        </span>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
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
          value={value ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(raw === "" ? null : Number(raw));
          }}
          className="h-8 border-0 bg-transparent p-0 text-2xl font-semibold tabular-nums shadow-none focus-visible:ring-0 md:text-2xl"
        />
        <span className="text-sm text-muted-foreground">in</span>
      </div>
    </label>
  );
}
