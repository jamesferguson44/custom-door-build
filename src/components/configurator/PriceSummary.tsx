import type { PriceBreakdown, ProductType, AnyConfig } from "@/lib/pricing";
import { formatUSD, productLabel } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { addToCart, loadCart } from "@/lib/quote-storage";
import { ArrowRight, Plus, ShieldCheck, CheckCircle2 } from "lucide-react";
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

export function PriceSummary({ productType, config, price, valid, completeness, location, locationValid, onAddedToProject }: Props) {
  const navigate = useNavigate();
  const canAdd = valid && locationValid;
  const windowStyle =
    productType === "window"
      ? (config as { windowStyle?: string }).windowStyle
      : undefined;
  const addLabel = windowStyle
    ? `Add ${windowStyle} Window`
    : `Add ${productLabel(productType)}`;
  const monthly = valid
    ? Math.round(((price.low + price.high) / 2) * 0.0125)
    : 0;

  const handleAdd = (goToQuote: boolean) => {
    const room = location.trim();
    addToCart({ productType, config, price, location: room || undefined });
    if (goToQuote) {
      navigate({ to: "/quote" });
    } else {
      const count = loadCart().items.reduce((s, i) => s + i.qty, 0);
      toast.success(
        `${room} window added. ${count} window${count === 1 ? "" : "s"} currently in your project.`,
      );
      onAddedToProject?.();
    }
  };

  const trustItems: { t: string; emph?: boolean }[] = [
{ t: "Professional installation included" },
  { t: "Measurement verification included" },
  { t: "Workmanship warranty" },
  { t: "Built for Utah weather" },
  { t: "No in-home sales presentation", emph: true },
];

  return (
    <aside>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* 1. Estimated Price */}
        <div className="px-6 py-6">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Estimated Installed Price Range
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
              <div className="space-y-1.5 text-sm">
                {[
                  "Choose your options",
                  "Enter approximate dimensions",
                  "Instantly see pricing",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-foreground/40" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {valid && (
            <div className="mt-2 text-xs text-muted-foreground">
              {productLabel(productType)} · {config.width}″ × {config.height}″
            </div>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Instant online estimate based on your selections.
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Final pricing is confirmed after measurement verification.
          </p>
        </div>

        {/* 2. Financing */}
        {valid && (
          <div className="border-t border-border px-6 py-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Financing
            </div>
 <div className="mt-1 text-sm space-y-0.5">
  <div>Financing Available</div>
  <div>Estimated payments from approximately:{" "}
    <span className="font-semibold tabular-nums">{formatUSD(monthly)}</span>/mo
  </div>
</div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Qualified homeowners may be eligible for financing options.
            </p>
          </div>
        )}

        {/* 3. Included Services / Trust */}
        <div className="border-t border-border bg-muted/20 px-6 py-4">
          <ul className="space-y-2 text-[12px] text-muted-foreground">
            {trustItems.map(({ t, emph }) => (
              <li
                key={t}
                className={
                  emph
                    ? "flex items-start gap-2 rounded-lg border border-emerald-600/25 bg-emerald-600/[0.06] px-2.5 py-2 text-[12.5px] font-medium text-foreground"
                    : "flex items-start gap-2"
                }
              >
                <CheckCircle2
                  className={
                    emph
                      ? "mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600"
                      : "mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-foreground/60"
                  }
                />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

{/* 6. Action Buttons */}
        <div className="border-t border-border px-6 py-5">
          {typeof completeness === "number" && (
            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <span>Project Completeness</span>
                <span className="tabular-nums text-foreground/80">
                  {Math.round(completeness * 100)}%
                </span>
              </div>
              <Progress value={completeness * 100} className="h-1.5" />
            </div>
          )}
          <div className="space-y-2">
            <Button
              className="h-12 w-full rounded-full text-sm font-semibold"
              disabled={!canAdd}
              onClick={() => handleAdd(false)}
            >
              <Plus className="mr-1 h-4 w-4" /> {addLabel}
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              {!valid
                ? "Complete your selections and dimensions to continue."
                : !locationValid
                  ? "Add a room or location to continue."
                  : "Building a multi-window project? Add each window to your quote."}
            </p>
            <Button
              variant="outline"
              className="mt-3 h-11 w-full rounded-full text-sm font-medium"
              disabled={!canAdd}
              onClick={() => handleAdd(true)}
            >
              Review Project &amp; Schedule Measurement <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 flex flex-col items-center gap-1 text-center text-[11px] text-muted-foreground">
            <p className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Final price confirmed after on-site measurement.
            </p>
            <p>Most projects can be measured within 3–7 days.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
