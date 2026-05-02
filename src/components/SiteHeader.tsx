import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-bold">UW</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Utah Window &amp; Door</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Configurator
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            className="rounded-md px-3 py-2 text-muted-foreground transition hover:text-foreground"
            activeOptions={{ exact: true }}
            activeProps={{ className: "rounded-md px-3 py-2 text-foreground font-medium" }}
          >
            Home
          </Link>
          <Link
            to="/configure/$type"
            params={{ type: "window" }}
            className="rounded-md px-3 py-2 text-muted-foreground transition hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 text-foreground font-medium" }}
          >
            Configure
          </Link>
          <Link
            to="/admin"
            className="rounded-md px-3 py-2 text-muted-foreground transition hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 text-foreground font-medium" }}
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}