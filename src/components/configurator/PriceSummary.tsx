import type { PriceBreakdown, ProductType, AnyConfig } from "@/lib/pricing";
import { formatUSD, productLabel } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import { saveCurrentQuote } from "@/lib/quote-storage";

type Props = {
  productType: ProductType;
  config: AnyConfig;
  price: PriceBreakdown;
  valid: boolean;
};

export function PriceSummary({ productType, config, price, valid }: Props) {
  const navigate = useNavigate();

  const handleContinue = () => {
    saveCurrentQuote({ productType, config, price });
    navigate({ to: "/quote" });
  };

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)]">
        <div className="border-b bg-muted/40 px-6 py-5">
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Live Estimate
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {productLabel(productType)} · {config.width}″ × {config.height}″
          </div>
          <div className="mt-3 text-4xl font-bold tracking-tight tabular-nums">
            {valid ? formatUSD(price.total) : "—"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {valid ? `${price.squareFeet.toFixed(2)} sq ft · includes labor & margin` : "Enter valid measurements"}
          </div>
        </div>

        <div className="space-y-3 px-6 py-5 text-sm">
          <Row label="Base price" value={formatUSD(price.basePrice)} />
          {price.addonItems.length > 0 && (
            <>
              <div className="pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Add-ons
              </div>
              {price.addonItems.map((a) => (
                <Row key={a.label} label={a.label} value={formatUSD(a.amount)} muted />
              ))}
            </>
          )}
          <Row label="Labor" value={formatUSD(price.laborPrice)} />
          <Separator />
          <Row label="Subtotal" value={formatUSD(price.subtotal)} muted />
          <Row label="Margin (20%)" value={formatUSD(price.margin)} muted />
          <Separator />
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatUSD(price.total)}</span>
          </div>
        </div>

        <div className="border-t bg-muted/30 px-6 py-5">
          <Button
            className="w-full"
            size="lg"
            disabled={!valid}
            onClick={handleContinue}
          >
            Review &amp; Quote
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Final price subject to measurement verification
          </p>
        </div>
      </div>
    </aside>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between ${muted ? "text-muted-foreground" : ""}`}
    >
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}