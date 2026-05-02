import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ruler, Shield, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Utah Window & Door — Instant Configurator & Quotes" },
      {
        name: "description",
        content:
          "Design your windows and doors, see live pricing, and request installation in minutes.",
      },
    ],
  }),
  component: Home,
});

const products = [
  {
    type: "window" as const,
    title: "Windows",
    desc: "Vinyl, fiberglass & aluminum frames with energy-efficient glass.",
  },
  {
    type: "door" as const,
    title: "Exterior Doors",
    desc: "Wood, fiberglass & steel doors with premium hardware options.",
  },
  {
    type: "sliding_door" as const,
    title: "Sliding Glass Doors",
    desc: "Smooth-glide patio doors that bring the outdoors in.",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b">
        <div className="container mx-auto px-4 py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Instant Pricing
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Configure your windows. <br />
              <span className="text-muted-foreground">Get an honest price.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Build any window or door to your exact specifications and see your installed price
              update in real time. No sales pressure, no surprises.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/configure/$type" params={{ type: "window" }}>
                  Start Configuring <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/configure/$type" params={{ type: "door" }}>
                  Browse Doors
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.type}
              to="/configure/$type"
              params={{ type: p.type }}
              className="group rounded-2xl border bg-card p-8 shadow-[var(--shadow-card)] transition hover:border-foreground/40 hover:shadow-[var(--shadow-elegant)]"
            >
              <h3 className="text-xl font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-6 inline-flex items-center text-sm font-medium">
                Configure <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="container mx-auto grid gap-8 px-4 py-16 md:grid-cols-3">
          <Feature icon={<Zap className="h-5 w-5" />} title="Instant Quotes">
            Real pricing as you configure — no waiting for a sales rep.
          </Feature>
          <Feature icon={<Ruler className="h-5 w-5" />} title="Made to Measure">
            Every product is built to your exact opening dimensions.
          </Feature>
          <Feature icon={<Shield className="h-5 w-5" />} title="Lifetime Workmanship">
            Backed by our installation warranty across the Wasatch Front.
          </Feature>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Utah Window &amp; Door
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
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-card">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
