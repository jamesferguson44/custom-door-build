import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { WindowStyle } from "@/lib/pricing";
import windowSlider from "@/assets/window-slider-popular.jpg";
import windowPicture from "@/assets/window-picture.jpg";
import windowDoubleHung from "@/assets/window-double-hung.jpg";
import windowCasement from "@/assets/window-casement.jpg";
import windowAwning from "@/assets/window-awning.jpg";

export const Route = createFileRoute("/window-types")({
  head: () => ({
    meta: [
      { title: "Window Types — Pane & Simple" },
      {
        name: "description",
        content:
          "Compare slider, picture, double hung, casement, and awning windows. Pick a style and get instant pricing online.",
      },
    ],
  }),
  component: WindowTypesPage,
});

const styles: {
  style: WindowStyle;
  title: string;
  blurb: string;
  bestFor: string;
  image: string;
  imageContain?: boolean;
}[] = [
  {
    style: "Slider",
    title: "Slider",
    blurb:
      "One sash slides horizontally past the other. Easy to operate and a strong fit for wider openings.",
    bestFor: "Living rooms, kitchens, and wider wall openings",
    image: windowSlider,
    imageContain: true,
  },
  {
    style: "Picture",
    title: "Picture",
    blurb:
      "A fixed pane with no moving parts — maximum glass, maximum view, and excellent energy performance.",
    bestFor: "Views, feature walls, and pairing with operable windows nearby",
    image: windowPicture,
    imageContain: true,
  },
  {
    style: "Double Hung",
    title: "Double Hung",
    blurb:
      "Upper and lower sashes both move. Classic look, great ventilation, and easy cleaning from inside.",
    bestFor: "Bedrooms, traditional homes, and everyday ventilation",
    image: windowDoubleHung,
  },
  {
    style: "Casement",
    title: "Casement",
    blurb:
      "Cranks open outward like a door. Excellent seal when closed and strong airflow when open.",
    bestFor: "Hard-to-reach spots, bathrooms, and high-efficiency upgrades",
    image: windowCasement,
  },
  {
    style: "Awning",
    title: "Awning",
    blurb:
      "Hinges at the top and opens outward. You can leave it cracked for airflow even when it rains.",
    bestFor: "Above sinks, basements, and smaller ventilation openings",
    image: windowAwning,
  },
];

function WindowTypesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-[1400px] px-6 py-16 sm:py-20">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
          <div className="mt-4 max-w-2xl">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Window Styles
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              Choose the style that fits your home
            </h1>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              Start with a style, enter rough measurements, and see pricing instantly. We verify
              exact sizes on-site before anything is ordered.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-6">
                <Link to="/configure/$type" params={{ type: "window" }}>
                  Start configuring
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-6">
                <Link to="/measure-guide">How to measure</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-14 sm:py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {styles.map((s) => (
            <Link
              key={s.style}
              to="/configure/$type"
              params={{ type: "window" }}
              search={{ style: s.style }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition hover:shadow-[var(--shadow-elegant)]"
            >
              <div
                className={`aspect-[4/5] overflow-hidden ${s.imageContain ? "bg-[#f5f5f5]" : "bg-muted"}`}
              >
                <img
                  src={s.image}
                  alt={`${s.title} window`}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className={`h-full w-full transition duration-700 group-hover:scale-[1.03] ${
                    s.imageContain ? "object-contain" : "object-cover"
                  }`}
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold tracking-tight">{s.title}</h2>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{s.blurb}</p>
                <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/80">
                  Best for: {s.bestFor}
                </p>
                <span className="mt-auto pt-5 text-sm font-medium text-foreground">
                  Configure this style →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-[1400px] px-6 py-14 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Have rough measurements ready?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            A tape measure and five minutes is enough to get a solid online price. We confirm
            everything before production.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="rounded-full px-6">
              <Link to="/measure-guide">Read the measure guide</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link to="/configure/$type" params={{ type: "window" }}>
                Go to configurator
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
