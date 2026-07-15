import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { loadCart, clearCart, removeFromCart } from "@/lib/quote-storage";
import { formatUSD, productLabel } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import {
  CheckCircle2,
  ArrowLeft,
  Phone,
  Calendar,
  Ruler,
  Package,
  Wrench,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "Review Your Project — Pane & Simple" },
      {
        name: "description",
        content:
          "Review your window and door project and schedule a free measurement appointment.",
      },
    ],
  }),
  component: QuotePage,
});

const NEXT_STEPS = [
  {
    icon: Phone,
    title: "We call you within 1 business day",
    description:
      "A Pane & Simple team member will reach out to confirm your project details and answer any questions.",
  },
  {
    icon: Calendar,
    title: "Schedule your measurement appointment",
    description:
      "We'll find a time that works for you — most appointments are available within 3–7 days.",
  },
  {
    icon: Ruler,
    title: "Professional measurement verification",
    description:
      "We verify exact dimensions on-site before anything is ordered. No surprises at installation.",
  },
  {
    icon: Package,
    title: "Your products are ordered",
    description:
      "Once measurements are confirmed and you approve the final price, we place your order.",
  },
  {
    icon: Wrench,
    title: "Professional installation",
    description:
      "Our team handles the full installation. Clean, efficient, and built to last.",
  },
];

function QuotePage() {
  const cart = loadCart();
  const items = cart.items ?? [];
  const isEmpty = items.length === 0;

  const totalLow = items.reduce(
    (sum, item) => sum + item.price.low * item.qty,
    0,
  );
  const totalHigh = items.reduce(
    (sum, item) => sum + item.price.high * item.qty,
    0,
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [, forceUpdate] = useState(0);

  const handleRemove = (id: string) => {
    removeFromCart(id);
    forceUpdate((n) => n + 1);
  };

  const canSubmit =
    name.trim().length > 0 &&
    (phone.trim().length > 0 || email.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    toast.success("Request received! We'll be in touch within 1 business day.");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Page header */}
        <div className="mb-10">
          <Link
            to="/configure/$type"
            params={{ type: "window" }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Configurator
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {isEmpty ? "Your project is empty" : "Review Your Project"}
          </h1>
          {!isEmpty && (
            <p className="mt-2 text-muted-foreground">
              {items.length} item{items.length !== 1 ? "s" : ""} · Estimated
              installed price range below
            </p>
          )}
        </div>

        {isEmpty ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <div className="text-4xl">🪟</div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">
              No items in your project yet
            </h2>
            <p className="mt-2 text-muted-foreground">
              Head to the configurator to build your first window or door.
            </p>
            <Button asChild className="mt-8 h-12 rounded-full px-8">
              <Link to="/configure/$type" params={{ type: "window" }}>
                Start Configuring
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* LEFT — Project breakdown */}
            <div className="space-y-6">
              {/* Line items */}
              <div className="rounded-2xl border border-border bg-card">
                <div className="border-b border-border px-6 py-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Project Items
                  </h2>
                </div>
                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 px-6 py-4"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">
                          {item.location
                            ? item.location
                            : productLabel(item.productType)}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {productLabel(item.productType)}
                          {item.config.width && item.config.height
                            ? ` · ${item.config.width}″ × ${item.config.height}″`
                            : ""}
                          {(
                            item.config as { productLine?: string }
                          ).productLine
                            ? ` · ${(item.config as { productLine?: string }).productLine}`
                            : ""}
                          {(
                            item.config as { glassType?: string }
                          ).glassType
                            ? ` · ${(item.config as { glassType?: string }).glassType}`
                            : ""}
                          {(item.config as { color?: string }).color
                            ? ` · ${(item.config as { color?: string }).color}`
                            : ""}
                          {(
                            item.config as { gridStyle?: string }
                          ).gridStyle &&
                          (item.config as { gridStyle?: string }).gridStyle !==
                            "None"
                            ? ` · ${(item.config as { gridStyle?: string }).gridStyle} grids`
                            : ""}
                        </p>
                        {item.qty > 1 && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            Qty: {item.qty}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatUSD(item.price.low * item.qty)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          – {formatUSD(item.price.high * item.qty)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project total */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Estimated Project Total
                </h2>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight">
                    {formatUSD(totalLow)}
                  </span>
                  <span className="text-lg text-muted-foreground">–</span>
                  <span className="text-3xl font-semibold tracking-tight">
                    {formatUSD(totalHigh)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Installed price estimate. Final pricing confirmed after on-site
                  measurement verification.
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    "Professional installation included",
                    "Measurement verification included",
                    "Workmanship warranty included",
                    "No in-home sales presentation required",
                  ].map((t) => (
                    <div
                      key={t}
                      className="flex items-center gap-2 text-sm text-foreground/85"
                    >
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add more / start over */}
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-full px-6"
                >
                  <Link to="/configure/$type" params={{ type: "window" }}>
                    Add Another Window
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-full px-6"
                >
                  <Link to="/configure/$type" params={{ type: "door" }}>
                    Add a Door
                  </Link>
                </Button>
              </div>
            </div>

            {/* RIGHT — What happens next + callback form */}
            <div className="space-y-6">
              {/* What happens next */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  What Happens Next
                </h2>
                <div className="mt-4 space-y-5">
                  {NEXT_STEPS.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        <step.icon className="h-5 w-5 text-foreground/70" />
                      </div>
                      <div>
                        <p className="font-medium">{step.title}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Callback request form */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Request a Callback
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Leave your info and we'll reach out within 1 business day to
                    confirm your project and schedule your measurement
                    appointment.
                  </p>
                </div>

                {submitted ? (
                  <div className="py-6 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                    <h3 className="mt-3 text-lg font-semibold tracking-tight">
                      Request received!
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We'll be in touch within 1 business day. Check your email
                      for a confirmation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-xs text-muted-foreground"
                      >
                        Your name *
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="First and last name"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="phone"
                        className="text-xs text-muted-foreground"
                      >
                        Phone number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(801) 555-0100"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-xs text-muted-foreground"
                      >
                        Email address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="notes"
                        className="text-xs text-muted-foreground"
                      >
                        Anything else we should know? (optional)
                      </Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Best time to call, access notes, specific questions..."
                        className="mt-1.5 min-h-[80px]"
                      />
                    </div>
                    <Button
                      className="h-12 w-full rounded-full text-sm font-semibold"
                      disabled={!canSubmit}
                      onClick={handleSubmit}
                    >
                      Request Callback & Measurement Appointment
                    </Button>
                    <p className="text-center text-[11px] text-muted-foreground">
                      {!canSubmit
                        ? "Please enter your name and at least a phone number or email."
                        : "No commitment required. We'll confirm your project details before scheduling."}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                      <ShieldCheck className="h-3 w-3" />
                      Final price confirmed after on-site measurement. No
                      surprises.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
