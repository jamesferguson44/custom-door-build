import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ClipboardCheck, MessageSquare, FileText, Ruler } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/quote/success")({
  validateSearch: z.object({ id: z.string().optional() }),
  head: () => ({
    meta: [{ title: "Thank You — Pane & Simple" }],
  }),
  component: SuccessPage,
});

const STEPS = [
  { icon: ClipboardCheck, text: "We review your project." },
  { icon: MessageSquare, text: "We contact you if measurements need clarification." },
  { icon: FileText, text: "We provide your exact quote." },
  { icon: Ruler, text: "If you move forward, we schedule final measurements and ordering." },
];

function SuccessPage() {
  const { id } = Route.useSearch();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-xl px-6 py-20 sm:py-24">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[var(--shadow-elegant)]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Thank You</h1>
          <p className="mt-3 text-muted-foreground">Your project has been received.</p>
          {id && (
            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Reference <span className="font-mono">{id.slice(0, 8).toUpperCase()}</span>
            </p>
          )}
        </div>

        <section className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            What Happens Next?
          </div>
          <ol className="divide-y divide-border">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={i} className="flex items-start gap-4 px-6 py-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground/70">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="pt-1">
                    <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Step {i + 1}
                    </div>
                    <div className="mt-0.5 text-sm">{s.text}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          A copy of your project summary has been downloaded to your device.
        </p>

        <div className="mt-8 flex justify-center">
          <Button asChild className="h-12 rounded-full px-8">
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
