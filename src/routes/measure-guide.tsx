import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Ruler, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/measure-guide")({
  head: () => ({
    meta: [
      { title: "How to Measure Your Windows — Pane & Simple" },
      {
        name: "description",
        content:
          "DIY guide to take rough window measurements for an online quote. Width, height, tips, and what we verify on-site.",
      },
    ],
  }),
  component: MeasureGuidePage,
});

const steps = [
  {
    title: "Gather what you need",
    body: "A tape measure, a notepad (or your phone), and a few minutes per window. Measure from inside the house — no need to remove trim or the old window.",
  },
  {
    title: "Measure the width",
    body: "Inside the window frame (jamb to jamb), measure the width at the top, middle, and bottom. Write down all three. Use the smallest number — that’s your rough width for the configurator.",
  },
  {
    title: "Measure the height",
    body: "Measure from the top of the sill up to the head jamb on the left, center, and right. Again, use the smallest number as your rough height.",
  },
  {
    title: "Round to the nearest inch",
    body: "For an online quote, whole inches are fine. If you’re between inches, round down slightly so your estimate stays conservative. We’ll take exact measurements later.",
  },
  {
    title: "Enter sizes in the configurator",
    body: "Pick your window style, then enter width and height in inches. You’ll see pricing update as you go. Add each window to your quote with a room name if you want (Kitchen, Master Bedroom, etc.).",
  },
];

function MeasureGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
        <div className="mt-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            DIY Measure Guide
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Rough measurements are enough to get started
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            You don’t need perfect numbers to design and price windows online. Take a few rough
            measurements, plug them into the configurator, and we’ll verify everything on-site
            before anything is built.
          </p>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3.5 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-foreground/70" />
          <p>
            Your online quote is a starting point. A professional confirms exact sizes at your home,
            and pricing updates if anything changes — no surprises after the fact.
          </p>
        </div>

        {/* Simple diagrams */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <DiagramCard
            title="Width"
            caption="Jamb to jamb — top, middle, and bottom. Use the smallest."
          >
            <WidthDiagram />
          </DiagramCard>
          <DiagramCard
            title="Height"
            caption="Sill to head — left, center, and right. Use the smallest."
          >
            <HeightDiagram />
          </DiagramCard>
        </div>

        <ol className="mt-12 space-y-8">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-foreground bg-foreground text-sm font-semibold text-background">
                {i + 1}
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight">{step.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-12 rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            <h2 className="text-base font-semibold tracking-tight">Quick tips</h2>
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {[
              "Measure each window separately — sizes often differ room to room.",
              "Don’t include the exterior trim or brickmold in your numbers.",
              "If the opening is out of square, still use the smallest width and height.",
              "Snap a quick phone photo of each opening if you want us to double-check later.",
              "When in doubt, estimate a little smaller rather than larger for the online quote.",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-foreground/70" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 border-t border-border pt-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Ready to price your windows?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Enter your rough width and height in the configurator — pricing updates as you design.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="rounded-full px-6">
              <Link to="/configure/$type" params={{ type: "window" }}>
                Open configurator
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link to="/window-types">Browse window types</Link>
            </Button>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function DiagramCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-5">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </div>
      <div className="mt-4 flex justify-center">{children}</div>
      <p className="mt-4 text-center text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}

function WidthDiagram() {
  return (
    <svg viewBox="0 0 200 140" className="h-36 w-full max-w-[220px]" aria-hidden>
      <rect x="24" y="20" width="152" height="100" fill="none" stroke="currentColor" strokeWidth="3" className="text-foreground/80" />
      <rect x="36" y="32" width="128" height="76" fill="currentColor" className="text-foreground/10" />
      <line x1="36" y1="70" x2="164" y2="70" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" className="text-foreground" />
      <polygon points="36,70 44,66 44,74" fill="currentColor" className="text-foreground" />
      <polygon points="164,70 156,66 156,74" fill="currentColor" className="text-foreground" />
      <text x="100" y="64" textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
        Width
      </text>
    </svg>
  );
}

function HeightDiagram() {
  return (
    <svg viewBox="0 0 200 140" className="h-36 w-full max-w-[220px]" aria-hidden>
      <rect x="50" y="16" width="100" height="108" fill="none" stroke="currentColor" strokeWidth="3" className="text-foreground/80" />
      <rect x="62" y="28" width="76" height="84" fill="currentColor" className="text-foreground/10" />
      <line x1="100" y1="28" x2="100" y2="112" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" className="text-foreground" />
      <polygon points="100,28 96,36 104,36" fill="currentColor" className="text-foreground" />
      <polygon points="100,112 96,104 104,104" fill="currentColor" className="text-foreground" />
      <text x="118" y="74" className="fill-foreground text-[11px] font-semibold">
        Height
      </text>
    </svg>
  );
}
