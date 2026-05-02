import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  width: number;
  height: number;
  onChange: (w: number, h: number) => void;
};

export function SizeInputs({ width, height, onChange }: Props) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Measurements (inches)
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="w" className="mb-1 text-xs text-muted-foreground">
            Width
          </Label>
          <Input
            id="w"
            type="number"
            min={1}
            max={240}
            value={width || ""}
            onChange={(e) => onChange(Number(e.target.value), height)}
            className="h-11"
          />
        </div>
        <div>
          <Label htmlFor="h" className="mb-1 text-xs text-muted-foreground">
            Height
          </Label>
          <Input
            id="h"
            type="number"
            min={1}
            max={240}
            value={height || ""}
            onChange={(e) => onChange(width, Number(e.target.value))}
            className="h-11"
          />
        </div>
      </div>
      {(width <= 0 || height <= 0) && (
        <p className="mt-2 text-xs text-destructive">
          Width and height must be greater than zero.
        </p>
      )}
    </div>
  );
}