import { Link } from "@tanstack/react-router";
import { useCart } from "@/hooks/use-cart";
import { cartCount } from "@/lib/quote-storage";
import { ShoppingCart } from "lucide-react";

export function SiteHeader() {
  const cart = useCart();
  const count = cartCount(cart);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
            <span className="text-[11px] font-bold tracking-tight">P&amp;S</span>
          </div>
          <span className="text-[13px] font-semibold tracking-tight">
            Pane &amp; Simple
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-[13px]">
          <NavItem to="/">Home</NavItem>
          <Link
            to="/configure/$type"
            params={{ type: "window" }}
            className="rounded-full px-4 py-1.5 text-muted-foreground transition hover:text-foreground"
            activeProps={{ className: "rounded-full px-4 py-1.5 text-foreground font-medium" }}
          >
            Configure
          </Link>
          <NavItem to="/admin">Admin</NavItem>
          <Link
            to="/quote"
            className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-muted-foreground transition hover:border-foreground hover:text-foreground"
            activeProps={{ className: "ml-1 inline-flex items-center gap-1.5 rounded-full border border-foreground bg-foreground text-background px-3 py-1.5 font-medium" }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="tabular-nums">{count}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function NavItem({ to, children }: { to: "/" | "/admin"; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-full px-4 py-1.5 text-muted-foreground transition hover:text-foreground"
      activeOptions={to === "/" ? { exact: true } : undefined}
      activeProps={{ className: "rounded-full px-4 py-1.5 text-foreground font-medium" }}
    >
      {children}
    </Link>
  );
}
