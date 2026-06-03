import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, PencilRuler, DollarSign, ClipboardCheck, Hammer, CheckCircle2, Eye, Ruler, Award, Sparkles, Mountain, Star, Quote } from "lucide-react";
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
          className="h-[80vh] w-full object-cover"
        />
        {/* Strong overlay for guaranteed contrast */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-background" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto max-w-[1400px] px-6 text-center text-white">
          <h1 className="text-4xl font-semibold tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-6xl lg:text-7xl">
            Skip the Sales Pitch.<br className="hidden sm:block" /> Design Your Windows and See Pricing Instantly.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)] sm:text-lg">
            Customize your windows online, see transparent pricing in real time, and let our team handle measurement and installation.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full bg-white px-8 text-sm font-semibold text-black shadow-lg hover:bg-white/90">
              <Link to="/configure/$type" params={{ type: "window" }}>
                See My Window Price
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/40 bg-white/10 px-8 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 hover:text-white"
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              How It Works
            </Button>
          </div>
          <p className="mx-auto mt-6 max-w-xl text-xs text-white/80 sm:text-sm">
            Installed replacement windows typically start around <span className="font-semibold text-white">$650 per window</span>.
          </p>
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/90 sm:text-sm">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> See Pricing Instantly</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> No Sales Appointments</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Professional Installation</span>
          </div>
        </div>
      </section>

      {/* Why homeowners choose us */}
      <section className="mx-auto max-w-[1400px] px-6 py-20">
        <div className="mb-12 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            A Better Way
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Why Homeowners Prefer This Process
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Most window companies require phone calls, in-home sales presentations, and high-pressure quotes. Pane &amp; Simple lets homeowners explore options and see pricing online before committing to anything.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: <DollarSign className="h-5 w-5" />, title: "Transparent Pricing", body: "See pricing as you build." },
            { icon: <Eye className="h-5 w-5" />, title: "No Sales Presentations", body: "No pressure, no lengthy appointments." },
            { icon: <Ruler className="h-5 w-5" />, title: "Verified Measurements", body: "Every opening is professionally verified before ordering." },
            { icon: <Hammer className="h-5 w-5" />, title: "Professional Installation", body: "Experienced installers handle the entire project." },
            { icon: <Award className="h-5 w-5" />, title: "Workmanship Warranty", body: "Installation backed by our workmanship guarantee." },
            { icon: <Mountain className="h-5 w-5" />, title: "Built For Utah Homes", body: "Products selected for Utah weather and efficiency." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
        <div className="mb-12 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            How It Works
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Four steps. That&apos;s it.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            From estimate to installation, we&apos;ve simplified the process.
          </p>
        </div>
        <ol className="grid gap-6 md:grid-cols-4">
          {[
            { icon: <PencilRuler className="h-5 w-5" />, title: "Design Your Windows", body: "Pick style, glass, and finish in our online configurator.", emphasis: false },
            { icon: <DollarSign className="h-5 w-5" />, title: "Get Instant Pricing", body: "See your price instantly as you design — no waiting, no calls.", emphasis: false },
            { icon: <ClipboardCheck className="h-5 w-5" />, title: "We Verify Measurements", body: "A professional confirms every dimension on-site before production begins.", emphasis: true },
            { icon: <Hammer className="h-5 w-5" />, title: "Professional Installation", body: "Experienced installers handle the entire project — backed by our workmanship warranty.", emphasis: true },
          ].map((s, i) => (
            <li
              key={s.title}
              className={cn(
                "rounded-2xl border p-6 transition",
                s.emphasis
                  ? "border-foreground/20 bg-background shadow-[var(--shadow-elegant)] ring-1 ring-foreground/5"
                  : "border-border bg-background",
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border",
                    s.emphasis ? "border-foreground bg-foreground text-background" : "border-border bg-background",
                  )}
                >
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
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Built around accuracy and craftsmanship.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
              We focus on accurate pricing, verified measurements, and professional installation so there are no surprises when your project moves forward.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[
              "Measurements verified before production",
              "Installed by experienced professionals",
              "Final fit guarantee",
              "Workmanship warranty included",
              "Transparent pricing from day one",
            ].map((t) => (
              <div key={t} className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-foreground" />
                <span className="text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Starter templates */}
      <section id="templates" className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
        <div className="mb-10 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Starter Templates
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Popular Starting Points
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Most homeowners start with one of these proven configurations and customize from there.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t) => {
            const featured = t.id === "most-popular";
            return (
            <Link
              key={t.id}
              to="/configure/$type"
              params={{ type: "window" }}
              search={{ template: t.id }}
              className={`group relative overflow-hidden rounded-2xl border bg-background transition hover:shadow-[var(--shadow-elegant)] ${featured ? "border-foreground ring-2 ring-foreground/10 shadow-[var(--shadow-elegant)]" : "border-border"}`}
            >
              {featured && (
                <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-background">
                  <Sparkles className="h-3 w-3" /> Most Homeowners Choose This
                </div>
              )}
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
            );
          })}
        </div>
        </div>
      </section>

      {/* Typical project pricing */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
          <div className="mb-10 text-center">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Project Costs
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Typical Project Costs
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Every home is different, but these ranges help set expectations.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { label: "Single Window", price: "$650 – $1,500", note: "Installed" },
              { label: "5 Window Project", price: "$4,000 – $8,000", note: "Installed" },
              { label: "Whole Home Replacement", price: "$10,000 – $25,000+", note: "Installed" },
            ].map((p) => (
              <div key={p.label} className="rounded-2xl border border-border bg-card p-8">
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {p.label}
                </div>
                <div className="mt-3 text-4xl font-semibold tracking-tight">{p.price}</div>
                <p className="mt-3 text-sm text-muted-foreground">{p.note}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
            Final pricing depends on size, product line, installation requirements, and project scope. Use the configurator for personalized pricing.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-[1400px] px-6 py-24 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Ready to See Your Price?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Design your windows, explore options, and get transparent pricing in minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-8 text-sm font-semibold">
              <Link to="/configure/$type" params={{ type: "window" }}>
                See My Window Price
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-8 text-sm font-semibold">
              <Link to="/configure/$type" params={{ type: "window" }}>Build My Project</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Pane &amp; Simple
      </footer>
    </div>
  );
}
