import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight, FolderOpen } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { removeFromCart, clearCart } from "@/lib/quote-storage";
import { formatUSD, productLabel } from "@/lib/pricing";

export function ProjectSummary() {
  const cart = useCart();
  const items = cart.items;

  if (items.length === 0) {
    return (
      <aside className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-8 text-center">
        <FolderOpen className="mx-auto h-6 w-6 text-muted-foreground" />
        <div className="mt-2 text-sm font-medium">Your Project is empty</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Configure an item and click “Add to Project” to start building your quote.
        </p>
      </aside>
    );
  }

  const low = items.reduce((s, i) => s + i.price.low * i.qty, 0);
  const high = items.reduce((s, i) => s + i.price.high * i.qty, 0);
  const mid = items.reduce((s, i) => s + i.price.total * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <aside className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-baseline justify-between px-6 py-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Project Summary
          </div>
          <div className="mt-1 text-sm font-semibold">
            {count} {count === 1 ? "item" : "items"}
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
                {productLabel(it.productType)}
                {it.qty > 1 && (
                  <span className="ml-1 text-muted-foreground">× {it.qty}</span>
                )}
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

      <div className="border-t border-border px-6 py-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold">Project Total</span>
          <span className="text-base font-semibold tabular-nums">
            {formatUSD(low)} – {formatUSD(high)}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground text-right">
          midpoint {formatUSD(mid)}
        </div>
        <Button asChild className="mt-4 h-11 w-full rounded-full text-sm font-semibold">
          <Link to="/quote">
            Review Full Quote <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </aside>
  );
}