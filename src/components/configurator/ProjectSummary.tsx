import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight, Sparkles, Wallet } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { removeFromCart, clearCart } from "@/lib/quote-storage";
import { formatUSD, productLabel } from "@/lib/pricing";

export function ProjectSummary() {
  const cart = useCart();
  const items = cart.items;

  if (items.length === 0) {
    return (
      <aside className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="px-6 py-5">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Your Project
          </div>
          <div className="mt-1 text-lg font-semibold tracking-tight">
            Start Building Your Project
          </div>
          <ol className="mt-4 space-y-2.5 text-sm">
            {[
              "Configure your first window",
              "Enter approximate dimensions",
              "Add windows to your quote",
              "Get your exact project estimate",
            ].map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-[10px] font-semibold text-muted-foreground tabular-nums">
                  {i + 1}
                </span>
                <span className="text-foreground/80">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    );
  }

  const low = items.reduce((s, i) => s + i.price.low * i.qty, 0);
  const high = items.reduce((s, i) => s + i.price.high * i.qty, 0);
  const mid = items.reduce((s, i) => s + i.price.total * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const monthly = Math.round(mid * 0.0125);

  return (
    <aside className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-baseline justify-between px-6 py-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Your Project
          </div>
          <div className="mt-1 text-sm font-semibold">
            Windows Added: <span className="tabular-nums">{count}</span>
          </div>
        </div>
        <button
          className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
          onClick={() => clearCart()}
        >
          Clear
        </button>
      </div>

      <ul className="divide-y divide-border border-t border-border">
        {items.map((it) => (
          <li key={it.id} className="flex items-center justify-between gap-3 px-6 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {itemTitle(it)}
                {it.qty > 1 && <span className="ml-1 text-muted-foreground">× {it.qty}</span>}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                {it.config.width}″ × {it.config.height}″
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right text-xs tabular-nums">
                <div>{formatUSD(it.price.low * it.qty)}</div>
                <div className="text-muted-foreground">{formatUSD(it.price.high * it.qty)}</div>
              </div>
              <button
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove"
                onClick={() => removeFromCart(it.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-border px-6 py-5">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Estimated Project Total
        </div>
        <div className="mt-1 text-2xl font-semibold tabular-nums">
          {formatUSD(low)} – {formatUSD(high)}
        </div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          Midpoint {formatUSD(mid)} · Installed
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
          <Wallet className="h-4 w-4 flex-shrink-0 text-foreground/70" />
          <div className="min-w-0">
            <div className="text-[13px] font-medium">
              Est. <span className="tabular-nums">{formatUSD(monthly)}</span>/mo
            </div>
            <div className="text-[11px] text-muted-foreground">
              Financing options available. Ask about payment options during your quote review.
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-foreground/[0.02] px-6 py-5">
        <Button
          asChild
          className="h-12 w-full rounded-full text-sm font-semibold tracking-wide shadow-[var(--shadow-elegant)]"
        >
          <Link to="/quote">
            <Sparkles className="mr-1 h-4 w-4" /> GET MY EXACT QUOTE
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Takes less than 60 seconds.
        </p>
      </div>
    </aside>
  );
}

function itemTitle(it: ReturnType<typeof useCart>["items"][number]): string {
  const parts: string[] = [];
  if (it.location) parts.push(it.location);
  if (it.productType === "window") {
    const cfg = it.config as { windowStyle?: string; productLine?: string };
    if (cfg.windowStyle) parts.push(`${cfg.windowStyle} Window`);
    else parts.push(productLabel(it.productType));
    if (cfg.productLine) {
      const line = cfg.productLine.split("—").pop()?.trim() ?? cfg.productLine;
      parts.push(line);
    }
  } else {
    parts.push(productLabel(it.productType));
  }
  return parts.join(" — ");
}
