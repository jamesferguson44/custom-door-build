import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, PencilRuler, DollarSign, ClipboardCheck, Hammer, CheckCircle2, Eye, Ruler, Award, Sparkles, Mountain, Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import heroWindow from "@/assets/hero-window.jpg";
// Cut out to transparent PNGs via scripts/cutout-window-photos.mjs so all four
// starting-point photos sit on one identical card background instead of each
// carrying its own slightly different studio backdrop/vignette.
import windowPicture from "@/assets/window-picture.png";
import windowSliderPopular from "@/assets/window-slider-popular.png";
import windowCasement from "@/assets/window-casement.png";
import windowSingleHung from "@/assets/window-single-hung.png";
// Reusing the configurator's existing door hero photos here rather than
// generating new cutout PNGs — keeps this a same-style banner instead of a
// full new asset pipeline (see /configure/door and /configure/sliding_door).
import heroDoor from "@/assets/hero-door.jpg";
import heroSliding from "@/assets/hero-sliding.jpg";

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
  { id: "most-popular", title: "Most Popular", blurb: "Premium ProVia sliding windows with Low-E glass — the sweet spot.", priceHint: "Typically $800–$1,200 per window installed", image: windowSliderPopular },
  { id: "max-efficiency", title: "Maximum Efficiency", blurb: "Triple pane glass and our highest-performing frames.", priceHint: "Typically $1,100–$1,600 per window installed", image: windowCasement },
  { id: "modern-upgrade", title: "Modern Upgrade", blurb: "Sleek black picture windows for a contemporary look.", priceHint: "Typically $950–$1,500 per window installed", image: windowPicture },
];

function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SiteHeader />

      {/* Hero — SLC mountain view through a window. On sm+ screens the
          container matches the photo's real aspect ratio so the whole frame
          (top sill to bottom sill) always shows with no cropping. That ratio
          is far too short on mobile to hold the text below, so phones get
          their own taller box instead (image crops left/right there, which
          is fine — it's the top/bottom sill cropping that looks bad). */}
      <section className="relative overflow-hidden bg-black">
        <div className="relative h-[72vh] min-h-[540px] w-full sm:aspect-[2400/1254] sm:h-auto sm:min-h-0">
          <img
            src={heroWindow}
            alt="Salt Lake City skyline and Wasatch mountains through a window"
            width={2400}
            height={1254}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          {/* Light touch only — a bottom-anchored fade so the text block stays
              readable without dulling the photo itself. */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/40" />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto max-w-[1400px] px-5 text-center text-white sm:px-6">
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight [text-shadow:0_2px_28px_rgba(0,0,0,0.75),0_1px_6px_rgba(0,0,0,0.6)] sm:text-5xl sm:leading-tight lg:text-6xl">
              Skip the Sales Pitch.<br className="hidden sm:block" /> Design Your Windows and See Pricing Instantly.
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-[13px] leading-snug text-white [text-shadow:0_1px_16px_rgba(0,0,0,0.7)] sm:mt-4 sm:text-lg sm:leading-normal">
              Customize your windows online, see transparent pricing in real time, and let our team handle measurement and installation.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:mt-6 sm:gap-3">
              <Button asChild size="lg" className="h-11 rounded-full bg-white px-6 text-sm font-semibold text-black shadow-lg hover:bg-white/90 sm:h-12 sm:px-8">
                <Link to="/configure/$type" params={{ type: "window" }}>
                  See My Window Price
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 rounded-full border-white/60 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:h-12 sm:px-8"
                onClick={() => {
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                How It Works
              </Button>
            </div>
            <p className="mx-auto mt-4 max-w-xl text-xs text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.6)] sm:mt-5 sm:text-sm">
              Installed replacement windows typically start around <span className="font-semibold">$650 per window</span>.
            </p>
            <div className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-[11px] sm:mt-6 sm:gap-x-3 sm:gap-y-2 sm:text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-semibold text-black shadow-sm sm:px-3">
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> See Pricing Instantly
              </span>
              <span className="inline-flex items-center gap-1.5 text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.6)]">
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> No Sales Appointments
              </span>
              <span className="inline-flex items-center gap-1.5 text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.6)]">
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Professional Installation
              </span>
            </div>
            <p className="mt-2 text-[11px] text-white/90 [text-shadow:0_1px_10px_rgba(0,0,0,0.55)] sm:text-xs">
              Serving Salt Lake County · Utah County · Davis County
            </p>
          </div>
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

      {/* Starter templates */}
      <section id="templates" className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
        <div className="mb-10 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            WHERE TO START
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
              className={`group flex flex-col overflow-hidden rounded-2xl border bg-[#f5f5f5] transition hover:shadow-[var(--shadow-elegant)] ${featured ? "border-2 border-foreground shadow-[var(--shadow-elegant)]" : "border-border"}`}
            >
              <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-[#f5f5f5] p-6">
                {featured && (
                  <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-background">
                    <Sparkles className="h-3 w-3" /> Most Homeowners Choose This
                  </div>
                )}
                <img
                  src={t.image}
                  alt={t.title}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="block h-full w-full object-contain object-center [filter:drop-shadow(0_14px_20px_rgba(15,15,15,0.12))] transition duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="bg-background p-5">
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
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link to="/window-types" className="font-medium text-foreground underline-offset-4 hover:underline">
            Browse all window types
          </Link>
          <span className="hidden text-muted-foreground sm:inline">·</span>
          <Link to="/measure-guide" className="font-medium text-foreground underline-offset-4 hover:underline">
            How to measure for a quote
          </Link>
        </div>
        </div>
      </section>

      {/* Doors CTA — the door and sliding-door configurators have full
          feature/pricing parity with windows, so give them a visible path
          in without touching the window cards above. Uses the existing
          configurator hero photos rather than new cutout assets, styled as
          a simpler banner instead of a full card mirror. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
          <div className="mb-10 text-center">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Also Available
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Need a Door, Too?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Our door and sliding patio door configurators work just like the one above — same transparent pricing, same no sales pressure.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {(
              [
                {
                  type: "door",
                  title: "Entry Doors",
                  blurb: "Design a custom entry door and see transparent installed pricing in minutes.",
                  image: heroDoor,
                  cta: "Configure My Door",
                },
                {
                  type: "sliding_door",
                  title: "Sliding Patio Doors",
                  blurb: "Smooth-glide patio doors, priced the same instant way as everything else.",
                  image: heroSliding,
                  cta: "Configure My Patio Door",
                },
              ] as const
            ).map((d) => (
              <Link
                key={d.type}
                to="/configure/$type"
                params={{ type: d.type }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition hover:shadow-[var(--shadow-elegant)]"
              >
                <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
                  <img
                    src={d.image}
                    alt={d.title}
                    width={1920}
                    height={1080}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="text-lg font-semibold tracking-tight text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.55)]">
                      {d.title}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-muted-foreground">{d.blurb}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                    {d.cta}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
              { label: "Single Window", price: "$650 – $1,500", note: "Installed", description: "Common for single-room upgrades or damage replacement." },
              { label: "5 Window Project", price: "$4,000 – $8,000", note: "Installed", description: "Popular for replacing windows across main living areas." },
              { label: "Whole Home Replacement", price: "$10,000 – $25,000+", note: "Installed", description: "Complete replacement of all windows in a typical Utah home." },
            ].map((p) => (
              <div key={p.label} className="rounded-2xl border border-border bg-card p-8">
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {p.label}
                </div>
                <div className="mt-3 text-4xl font-semibold tracking-tight">{p.price}</div>
                <p className="mt-2 text-sm font-medium text-muted-foreground">{p.note}</p>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-8 flex justify-center">
            <Button asChild size="lg" className="h-12 rounded-full px-8 text-sm font-semibold">
              <Link to="/configure/$type" params={{ type: "window" }}>
                Build My Custom Quote
              </Link>
            </Button>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
            Final pricing depends on size, product line, installation requirements, and project scope.
          </p>
        </div>
      </section>

      {/* Customer Projects placeholder */}
      {false && <section className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
          <div className="mb-10 text-center">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Social Proof
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Customer Projects
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Real homeowner projects and reviews coming soon.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { city: "Salt Lake City, UT", project: "Whole Home Replacement", note: "Review coming soon" },
              { city: "Park City, UT", project: "Kitchen & Living Room", note: "Review coming soon" },
              { city: "Provo, UT", project: "5 Window Project", note: "Review coming soon" },
            ].map((p) => (
              <div key={p.city} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-1 text-foreground/30">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <Quote className="mb-3 h-5 w-5 text-muted-foreground/60" />
                <div className="h-2.5 w-3/4 rounded-full bg-muted" />
                <div className="mt-2 h-2.5 w-full rounded-full bg-muted" />
                <div className="mt-2 h-2.5 w-2/3 rounded-full bg-muted" />
                <div className="mt-6 border-t border-border pt-4">
                  <div className="text-sm font-semibold tracking-tight">{p.project}</div>
                  <div className="text-xs text-muted-foreground">{p.city}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    {p.note}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>}

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
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-8 text-sm font-semibold"
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Have Questions? */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-[1400px] px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Still have questions?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            We&apos;re happy to talk through your project. No pressure, no sales pitch — just answers.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-8 text-sm font-semibold">
              <Link to="/quote">
                Schedule a Quick Call
              </Link>
            </Button>
          </div>
          <p className="mx-auto mt-4 max-w-xl text-xs text-muted-foreground">
            Prefer an in-person visit?{" "}
            <Link to="/quote" className="font-medium text-foreground underline-offset-4 hover:underline">
              Request an in-home consultation
            </Link>{" "}
            and we&apos;ll bring samples and measure on-site — just mention it in the notes.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
