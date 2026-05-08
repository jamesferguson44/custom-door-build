import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, PencilRuler, DollarSign, ClipboardCheck, Hammer, CheckCircle2, Ruler } from "lucide-react";
import heroWindow from "@/assets/hero-window.jpg";
import windowPicture from "@/assets/window-picture.jpg";
import windowDoubleHung from "@/assets/window-double-hung.jpg";
import windowCasement from "@/assets/window-casement.jpg";
import windowSingleHung from "@/assets/window-single-hung.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Design & Price Your Windows Online — Pane & Simple" },
      {
        name: "description",
        content:
          "Design and price replacement windows online in minutes. No sales reps. We handle measurement and installation.",
      },
    ],
  }),
  component: Home,
});

const templates: {
  id: "best-value" | "most-popular" | "max-efficiency" | "modern-upgrade";
  title: string;
  blurb: string;
  priceHint: string;
  image: string;
}[] = [
  { id: "best-value", title: "Best Value", blurb: "Energy-efficient vinyl windows at our most accessible price.", priceHint: "Typically $650–$900 per window installed", image: windowSingleHung },
  { id: "most-popular", title: "Most Popular", blurb: "Premium ProVia frames with Low-E glass — the sweet spot.", priceHint: "Typically $800–$1,200 per window installed", image: windowDoubleHung },
  { id: "max-efficiency", title: "Maximum Efficiency", blurb: "Triple pane glass and our highest-performing frames.", priceHint: "Typically $1,100–$1,600 per window installed", image: windowCasement },
  { id: "modern-upgrade", title: "Modern Upgrade", blurb: "Sleek black picture windows for a contemporary look.", priceHint: "Typically $950–$1,500 per window installed", image: windowPicture },
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
          className="h-[88vh] w-full object-cover"
        />
        {/* Strong overlay for guaranteed contrast */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-background" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto max-w-[1400px] px-6 text-center text-white">
          <h1 className="text-4xl font-semibold tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-6xl lg:text-7xl">
            Design &amp; Price Your Windows<br className="hidden sm:block" /> Online in Minutes
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)] sm:text-lg">
            Get real window pricing instantly. We verify your measurements and handle everything from start to finish.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full bg-white px-8 text-sm font-semibold text-black shadow-lg hover:bg-white/90">
              <Link to="/configure/$type" params={{ type: "window" }}>
                Start Designing
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/40 bg-white/10 px-8 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 hover:text-white"
            >
              <a href="#how-it-works">See How It Works</a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-white/80">Takes about 2 minutes. No commitment required.</p>
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/85 sm:text-sm">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> No obligation</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Measurements verified before ordering</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Fully installed by professionals</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-[1400px] px-6 py-20">
        <div className="mb-12 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            How It Works
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Four steps. That&apos;s it.
          </h2>
        </div>
        <ol className="grid gap-6 md:grid-cols-4">
          {[
            { icon: <PencilRuler className="h-5 w-5" />, title: "Design Your Windows", body: "Pick style, glass, and finish in our online configurator." },
            { icon: <DollarSign className="h-5 w-5" />, title: "Get Instant Pricing", body: "See your price instantly as you design — no waiting, no calls." },
            { icon: <ClipboardCheck className="h-5 w-5" />, title: "We Verify Measurements", body: "A pro confirms every dimension before production." },
            { icon: <Hammer className="h-5 w-5" />, title: "We Install", body: "Professional install backed by our workmanship warranty." },
          ].map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
                  {s.icon}
                </div>
                <span className="text-[11px] font-medium tabular-nums uppercase tracking-[0.18em] text-muted-foreground">
                  Step {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-base font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Trust */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-[1400px] px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Built around your peace of mind.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              "No pressure, no obligation quotes",
              "Deposit applied to your order",
              "We verify all measurements before production",
              "Perfect fit guarantee",
              "Final price rarely changes after verification",
            ].map((t) => (
              <div key={t} className="flex items-start gap-3 rounded-xl border border-border bg-background p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-foreground" />
                <span className="text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Starter templates */}
      <section className="mx-auto max-w-[1400px] px-6 py-20">
        <div className="mb-10 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Starter Templates
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Start from a popular setup.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Each template loads the configurator with smart defaults — tweak anything before you check out.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t) => (
            <Link
              key={t.id}
              to="/configure/$type"
              params={{ type: "window" }}
              search={{ template: t.id }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-[var(--shadow-elegant)]"
            >
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={t.image}
                  alt={t.title}
                  width={1200}
                  height={1500}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold tracking-tight">{t.title}</div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{t.blurb}</p>
                <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/80">
                  {t.priceHint}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Example pricing */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
          <div className="mb-10 text-center">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Pricing
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              What Most Customers Pay
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Real ranges based on recent projects. Your exact price updates instantly as you design.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background p-8">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Per window installed
              </div>
              <div className="mt-3 text-4xl font-semibold tracking-tight">$650 – $1,800</div>
              <p className="mt-3 text-sm text-muted-foreground">
                Includes the window, standard materials, and professional installation.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-8">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Typical full project
              </div>
              <div className="mt-3 text-4xl font-semibold tracking-tight">$6,000 – $25,000</div>
              <p className="mt-3 text-sm text-muted-foreground">
                Whole-home replacements typically land in this range depending on size and finishes.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-8">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Estimated monthly payment
              </div>
              <div className="mt-3 text-4xl font-semibold tracking-tight">$75 – $400<span className="text-base font-normal text-muted-foreground"> / mo</span></div>
              <p className="mt-3 text-sm text-muted-foreground">
                Based on typical financing. Final terms vary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Get your exact window pricing in under 2 minutes.
        </h2>
        <div className="mt-8">
          <Button asChild size="lg" className="h-12 rounded-full px-8 text-sm font-semibold">
            <Link to="/configure/$type" params={{ type: "window" }}>
              Start Designing
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-20 md:grid-cols-3">
          <Feature icon={<Zap className="h-5 w-5" />} title="Instant Pricing">
            See real pricing as you design — no waiting.
          </Feature>
          <Feature icon={<ClipboardCheck className="h-5 w-5" />} title="We Verify Measurements">
            We double-check everything before ordering.
          </Feature>
          <Feature icon={<Shield className="h-5 w-5" />} title="Professional Installation">
            Installed by experienced professionals.
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
