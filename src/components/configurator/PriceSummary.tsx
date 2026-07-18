import type { PriceBreakdown, ProductType, AnyConfig } from "@/lib/pricing";
import { formatUSD, productLabel } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { addToCart, loadCart } from "@/lib/quote-storage";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

type Props = {
  productType: ProductType;
  config: AnyConfig;
  price: PriceBreakdown;
  valid: boolean;
  completeness?: number;
  location: string;
  locationValid: boolean;
  onAddedToProject?: () => void;
};

/**
 * The entire right-hand rail: image, price, the one CTA, and how far along
 * the current item is. Meant to be wrapped in a single `sticky` container
 * alongside the live preview so the whole thing travels together while
 * scrolling — nothing here competes with it for attention.
 */
export function StickyPriceCard({
  productType,
  config,
  price,
  valid,
  completeness,
  location,
  locationValid,
  onAddedToProject,
}: Props) {
  const canAdd = valid && locationValid;
  const windowStyle =
    productType === "window" ? (config as { windowStyle?: string }).windowStyle : undefined;
  const addLabel = windowStyle ? `Add ${windowStyle} Window` : `Add ${productLabel(productType)}`;

  const handleAdd = () => {
    const room = location.trim();
    addToCart({ productType, config, price, location: room || undefined });
    const count = loadCart().items.reduce((s, i) => s + i.qty, 0);
    toast.success(
      `${room || productLabel(productType)} added. ${count} item${count === 1 ? "" : "s"} currently in your project.`,
    );
    onAddedToProject?.();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card px-6 py-5">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Estimated Installed Price
      </div>
      <div className="mt-2 flex items-baseline gap-2 flex-wrap">
        {valid ? (
          <>
            <span className="text-3xl font-semibold tracking-tight tabular-nums">
              {formatUSD(price.low)}
            </span>
            <span className="text-xl text-muted-foreground">–</span>
            <span className="text-3xl font-semibold tracking-tight tabular-nums">
              {formatUSD(price.high)}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            Choose your options &amp; enter dimensions to see pricing.
          </span>
        )}
      </div>
      {valid && (
        <div className="mt-1 text-xs text-muted-foreground">
          {productLabel(productType)} · {config.width}″ × {config.height}″
        </div>
      )}
      {valid &&
        (price.snappedWidth !== price.rawWidth || price.snappedHeight !== price.rawHeight) && (
          <div className="mt-1 text-[11px] text-muted-foreground">
            Priced as {price.snappedWidth}″ × {price.snappedHeight}″ (next standard size)
          </div>
        )}
      <Button
        className="mt-4 h-12 w-full rounded-full text-sm font-semibold"
        disabled={!canAdd}
        onClick={handleAdd}
      >
        <Plus className="mr-1 h-4 w-4" /> {canAdd ? addLabel : "Add"}
      </Button>
      {!canAdd && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          {!valid
            ? "Complete your selections and dimensions to continue."
            : "Add a room or location to continue."}
        </p>
      )}
      {typeof completeness === "number" && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span>Project Completeness</span>
            <span className="tabular-nums text-foreground/80">
              {Math.round(completeness * 100)}%
            </span>
          </div>
          <Progress value={completeness * 100} className="h-1.5" />
        </div>
      )}
    </div>
  );
}
