import type { PriceBreakdown, ProductType, AnyConfig } from "@/lib/pricing";
import { formatUSD, productLabel } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { addToCart } from "@/lib/quote-storage";
import { ArrowRight, Plus } from "lucide-react";
import { toast } from "sonner";

type Props = {
  productType: ProductType;
  config: AnyConfig;
  price: PriceBreakdown;
  valid: boolean;
};

export function PriceSummary({ productType, config, price, valid }: Props) {
  const navigate = useNavigate();

  const handleAdd = (goToQuote: boolean) => {
    addToCart({ productType, config, price });
    if (goToQuote) {
      navigate({ to: "/quote" });
    } else {
      toast.success(`${productLabel(productType)} added to your quote`);
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
            {valid && ` · ${price.squareFeet.toFixed(1)} sq ft`}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            Includes labor, hardware &amp; warranty · midpoint {formatUSD(price.total)}
          </div>
        </div>

        <div className="border-t border-border px-6 py-5 text-[13px]">
          <SectionLabel>Cost Breakdown</SectionLabel>
          <Row label="Product & materials" value={formatUSD(price.basePrice)} />
          <Row label="Installation & labor" value={formatUSD(price.laborPrice)} />
          {price.addonItems.length > 0 && (
            <>
              <Row label={`Add-ons (${price.addonItems.length})`} value={formatUSD(price.addonsPrice)} />
              <div className="ml-3 mt-1 space-y-0.5">
                {price.addonItems.map((a) => (
                  <Row key={a.label} label={`· ${a.label}`} value={formatUSD(a.amount)} muted />
                ))}
              </div>
            </>
          )}
          <div className="my-3 border-t border-border" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold">Estimated Total</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatUSD(price.total)}
            </span>
          </div>
        </div>

        <div className="border-t border-border px-6 py-5">
          <div className="space-y-2">
            <Button
              className="h-12 w-full rounded-full text-sm font-semibold"
              disabled={!valid}
              onClick={() => handleAdd(false)}
            >
              <Plus className="mr-1 h-4 w-4" /> Add to Quote
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full rounded-full text-sm font-medium"
              disabled={!valid}
              onClick={() => handleAdd(true)}
            >
              Add &amp; Review Quote <ArrowRight className="ml-1 h-4 w-4" />
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 mt-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground first:mt-0">
      {children}
    </div>
  );
}
