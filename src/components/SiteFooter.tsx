import { Link } from "@tanstack/react-router";

/**
 * TODO before launch: replace the placeholder phone number below with your
 * real business line. It's intentionally an obvious placeholder so it can't
 * accidentally look real to a customer if missed.
 */
const PHONE_PLACEHOLDER = "(801) 555-0100";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="text-sm font-semibold tracking-tight">Pane &amp; Simple</div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Transparent window and door replacement for Utah homeowners. No sales pressure —
              just great products and professional installation.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Serving Salt Lake County · Utah County · Davis County
            </p>
          </div>

          {/* Quick links */}
          <div>
            <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Quick Links
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/configure/$type"
                  params={{ type: "window" }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Configure Windows
                </Link>
              </li>
              <li>
                <Link
                  to="/configure/$type"
                  params={{ type: "door" }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Configure Doors
                </Link>
              </li>
              <li>
                <Link to="/quote" className="text-muted-foreground transition-colors hover:text-foreground">
                  Review My Quote
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Contact
            </div>
            <p className="text-sm text-muted-foreground">{PHONE_PLACEHOLDER}</p>
            <p className="mt-1 text-xs text-muted-foreground">Utah-licensed window &amp; door contractor</p>
            <p className="mt-3 text-xs text-muted-foreground">We respond within 1 business day.</p>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Pane &amp; Simple · Utah Window &amp; Door Installation
        </div>
      </div>
    </footer>
  );
}
