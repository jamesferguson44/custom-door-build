import type { PriceBreakdown, ProductType, AnyConfig } from "@/lib/pricing";
import { formatUSD, productLabel } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { addToCart } from "@/lib/quote-storage";
import { ArrowRight, Plus, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

type Props = {
  productType: ProductType;
  config: AnyConfig;
  price: PriceBreakdown;
  valid: boolean;
  completeness?: number;
  onAddedToProject?: () => void;
};

export function PriceSummary({ productType, config, price, valid, completeness, onAddedToProject }: Props) {
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
          <p className="mb-3 text-[12px] leading-relaxed text-muted-foreground">
            Most homeowners spend between <span className="font-medium text-foreground">$800–$1,500 per window</span> installed, depending on size and options.
          </p>
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
          {valid && (
            <div className="mt-3 text-xs text-muted-foreground">
              Estimated payment ~
              <span className="font-medium text-foreground/80 tabular-nums">
                {formatUSD(Math.round(((price.low + price.high) / 2) * 0.0125))}
              </span>
              /mo with financing
            </div>
          )}
          <p className="mt-3 text-[11px] text-muted-foreground">
            Final pricing is verified after measurements.
          </p>
        </div>

        <div className="border-t border-border bg-muted/20 px-6 py-4">
          <ul className="space-y-2 text-[12px] text-muted-foreground">
            {[
              "Fully installed pricing",
              "Professional measurement included",
              "Final fit guarantee",
              "Workmanship warranty",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-foreground/60" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
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
          {typeof completeness === "number" && (
            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <span>Project Completeness</span>
                <span className="tabular-nums text-foreground/80">{Math.round(completeness * 100)}%</span>
              </div>
              <Progress value={completeness * 100} className="h-1.5" />
            </div>
          )}
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
          <p className="mt-3 flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3" /> Final price confirmed after on-site measurement.
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
