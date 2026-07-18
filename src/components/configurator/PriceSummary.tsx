import type { PriceBreakdown, ProductType, AnyConfig } from "@/lib/pricing";
import { formatUSD, productLabel } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { addToCart, loadCart } from "@/lib/quote-storage";
import { ArrowRight, Plus, ShieldCheck } from "lucide-react";
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
 * Compact price card meant to sit alongside the live preview and stay
 * pinned while scrolling — just the number and the one decision that
 * matters (add it). Secondary details live in `PriceDetails` below.
 */
export function StickyPriceCard({
  productType,
  config,
  price,
  valid,
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
    </div>
  );
}

/**
 * Secondary details shown below the sticky preview/price so they don't
 * compete with it while scrolling: financing, completeness, and the path
 * to review the full project. Intentionally short — the homepage already
 * covers general trust/marketing copy.
 */
export function PriceDetails({
  productType,
  config,
  price,
  valid,
  completeness,
  location,
  locationValid,
}: Props) {
  const navigate = useNavigate();
  const canAdd = valid && locationValid;
  const monthly = valid ? Math.round(((price.low + price.high) / 2) * 0.0125) : 0;

  const handleReview = () => {
    const room = location.trim();
    addToCart({ productType, config, price, location: room || undefined });
    navigate({ to: "/quote" });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {valid && (
        <div className="px-6 py-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Financing available</span> — estimated{" "}
          {formatUSD(monthly)}/mo. Installed, warrantied, and measurement-verified.
        </div>
      )}
      {typeof completeness === "number" && (
        <div className="border-t border-border px-6 py-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span>Project Completeness</span>
            <span className="tabular-nums text-foreground/80">
              {Math.round(completeness * 100)}%
            </span>
          </div>
          <Progress value={completeness * 100} className="h-1.5" />
        </div>
      )}
      <div className="border-t border-border px-6 py-4">
        <Button
          variant="outline"
          className="h-11 w-full rounded-full text-sm font-medium"
          disabled={!canAdd}
          onClick={handleReview}
        >
          Review Project &amp; Schedule Measurement <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
        <p className="mt-3 flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3" /> Final price confirmed after on-site measurement.
        </p>
      </div>
    </div>
  );
}
