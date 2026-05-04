import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ruler, Shield, Zap } from "lucide-react";
import heroWindow from "@/assets/hero-window.jpg";
import heroDoor from "@/assets/hero-door.jpg";
import heroSliding from "@/assets/hero-sliding.jpg";
import type { ProductType } from "@/lib/pricing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pane & Simple — Instant Configurator & Quotes" },
      {
        name: "description",
        content:
          "Design your windows and doors, see live pricing, and request installation in minutes.",
      },
    ],
  }),
  component: Home,
});

const products: { type: ProductType; title: string; tag: string; image: string }[] = [
  { type: "window", title: "Windows", tag: "From $35 / sq ft", image: heroWindow },
  { type: "door", title: "Exterior Doors", tag: "From $45 / sq ft", image: heroDoor },
  { type: "sliding_door", title: "Sliding Glass Doors", tag: "From $50 / sq ft", image: heroSliding },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroWindow}
          alt="Floor-to-ceiling window with mountain view"
          width={1920}
          height={1080}
          className="h-[78vh] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/0 to-background" />
        <div className="absolute inset-x-0 top-[18%] mx-auto max-w-[1400px] px-6 text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Design your view.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-foreground/80 sm:text-base">
            Configure windows and doors with Pane &amp; Simple. Instant pricing.
            No sales pressure.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-8 text-sm font-semibold">
              <Link to="/configure/$type" params={{ type: "window" }}>
                Start Configuring
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-foreground/30 bg-background/70 px-8 text-sm font-semibold backdrop-blur"
            >
              <Link to="/configure/$type" params={{ type: "door" }}>
                Browse Doors
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Product cards */}
      <section className="mx-auto max-w-[1400px] px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Product Lineup
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Choose what you want to build.
            </h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.type}
              to="/configure/$type"
              params={{ type: p.type }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-[var(--shadow-elegant)]"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  width={1920}
                  height={1080}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-center justify-between p-6">
                <div>
                  <div className="text-lg font-semibold tracking-tight">{p.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{p.tag}</div>
                </div>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border transition group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-20 md:grid-cols-3">
          <Feature icon={<Zap className="h-5 w-5" />} title="Instant Quotes">
            Real pricing as you configure — no waiting for a sales rep.
          </Feature>
          <Feature icon={<Ruler className="h-5 w-5" />} title="Made to Measure">
            Every product is built to your exact opening dimensions.
          </Feature>
          <Feature icon={<Shield className="h-5 w-5" />} title="Lifetime Workmanship">
            Backed by our installation warranty.
          </Feature>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Pane &amp; Simple
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
        {icon}
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
