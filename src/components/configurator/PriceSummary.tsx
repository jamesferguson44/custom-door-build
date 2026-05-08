import type { PriceBreakdown, ProductType, AnyConfig } from "@/lib/pricing";
import { formatUSD, productLabel } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { addToCart } from "@/lib/quote-storage";
import { ArrowRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

type Props = {
  productType: ProductType;
  config: AnyConfig;
  price: PriceBreakdown;
  valid: boolean;
  onAddedToProject?: () => void;
};

export function PriceSummary({ productType, config, price, valid, onAddedToProject }: Props) {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");

  const handleAdd = (goToQuote: boolean) => {
    addToCart({ productType, config, price, location: location.trim() || undefined });
    if (goToQuote) {
      navigate({ to: "/quote" });
    } else {
      toast.success(`${productLabel(productType)} added to your project`);
      setLocation("");
      onAddedToProject?.();
    }
  };

  return (
    <aside>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="px-6 py-6">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Estimated Price Range
          </div>
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            {valid ? (
              <>
                <span className="text-4xl font-semibold tracking-tight tabular-nums">
                  {formatUSD(price.low)}
                </span>
                <span className="text-2xl text-muted-foreground">–</span>
                <span className="text-4xl font-semibold tracking-tight tabular-nums">
                  {formatUSD(price.high)}
                </span>
              </>
            ) : (
              <span className="text-4xl font-semibold tracking-tight">—</span>
            )}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {productLabel(productType)} · {config.width}″ × {config.height}″
          </div>
        </div>

        <div className="border-t border-border px-6 py-5 text-[13px] space-y-1.5">
          <p className="text-foreground">Includes product, installation, and standard materials</p>
          <p className="text-muted-foreground">Final price confirmed after in-home measurement</p>
          <p className="text-muted-foreground">Most projects fall within 10–15% of this estimate</p>
        </div>

        <div className="border-t border-border px-6 py-5">
          <Label htmlFor="room-location" className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Room / Location
          </Label>
          <Input
            id="room-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Living Room, Master Bedroom"
            className="mt-2"
          />
        </div>

        <div className="border-t border-border px-6 py-5">
          <div className="space-y-2">
            <Button
              className="h-12 w-full rounded-full text-sm font-semibold"
              disabled={!valid}
              onClick={() => handleAdd(false)}
            >
              <Plus className="mr-1 h-4 w-4" /> Add to Project
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full rounded-full text-sm font-medium"
              disabled={!valid}
              onClick={() => handleAdd(true)}
            >
              Review Project &amp; Schedule Measurement <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Final price subject to on-site verification
          </p>
        </div>
      </div>
    </aside>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between py-1 ${muted ? "text-muted-foreground" : ""}`}
    >
      <span className="truncate pr-2">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
