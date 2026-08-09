import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Turnstile } from "@/components/Turnstile";
import { loadCart, clearCart, removeFromCart } from "@/lib/quote-storage";
import { formatUSD, productLabel } from "@/lib/pricing";
import { downloadQuotePdf } from "@/lib/quote-pdf";
import { submitQuote } from "@/lib/submit-quote";
import { verifyTurnstile } from "@/lib/turnstile-verify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Loader2,
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

const TIMELINE_OPTIONS = ["ASAP", "Within 1 month", "1–3 months", "3–6 months", "Just researching"];

function summarizeItems(items: ReturnType<typeof loadCart>["items"]): string {
  const counts = new Map<string, number>();
  for (const it of items) {
    const label = productLabel(it.productType);
    counts.set(label, (counts.get(label) ?? 0) + it.qty);
  }
  return Array.from(counts.entries())
    .map(([label, n]) => `${n} ${label}${n > 1 ? "s" : ""}`)
    .join(", ");
}

function QuotePage() {
  const navigate = useNavigate();
  const cart = loadCart();
  const items = cart.items ?? [];
  const isEmpty = items.length === 0;

  const totalLow = items.reduce((sum, item) => sum + item.price.low * item.qty, 0);
  const totalHigh = items.reduce((sum, item) => sum + item.price.high * item.qty, 0);
  const totalMid = items.reduce((sum, item) => sum + item.price.total * item.qty, 0);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [timeline, setTimeline] = useState("");
  const [notes, setNotes] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [, forceUpdate] = useState(0);

  const turnstileConfigured = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);

  const handleRemove = (id: string) => {
    removeFromCart(id);
    forceUpdate((n) => n + 1);
  };

  const missingFields: string[] = [];
  if (!firstName.trim()) missingFields.push("first name");
  if (!lastName.trim()) missingFields.push("last name");
  if (!phone.trim()) missingFields.push("phone");
  if (!email.trim()) missingFields.push("email");
  if (turnstileConfigured && !turnstileToken) missingFields.push("spam check");

  const canSubmit = missingFields.length === 0;

  const handleSubmit = async () => {
    if (submitting) return;
    if (!canSubmit) {
      toast.error(
        missingFields.length === 1
          ? `Please fill in your ${missingFields[0]}.`
          : `Please fill in: ${missingFields.join(", ")}.`,
      );
      return;
    }
    setSubmitting(true);

    // Soft spam check only — never block lead capture if the server fn times out.
    if (turnstileConfigured && turnstileToken) {
      try {
        const result = await Promise.race([
          verifyTurnstile({ data: { token: turnstileToken } }),
          new Promise<{ success: true; reason: "timeout" }>((resolve) =>
            setTimeout(() => resolve({ success: true, reason: "timeout" }), 4000),
          ),
        ]);
        if (!result.success) {
          toast.error("Verification failed. Please try the checkbox again.");
          setSubmitting(false);
          return;
        }
      } catch (err) {
        console.warn("[quote submit] Turnstile verify skipped:", err);
      }
    }

    try {
      const customerName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const referenceId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const rows = items.map((item, index) => ({
        // First row carries the reference id used for success page / notify.
        ...(index === 0 ? { id: referenceId } : {}),
        product_type: item.productType,
        configuration: item.config as unknown as Record<string, unknown>,
        width_inches: item.config.width ?? 0,
        height_inches: item.config.height ?? 0,
        base_price: item.price.basePrice,
        addons_price: item.price.addonsPrice,
        labor_price: item.price.laborPrice,
        total_price: item.price.total,
        customer_name: customerName,
        customer_first_name: firstName.trim(),
        customer_last_name: lastName.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim(),
        customer_city: city.trim() || null,
        customer_zip: zip.trim() || null,
        project_notes: notes.trim() || null,
        project_timeline: timeline || null,
      }));

      // Server path: Supabase and/or email. Succeeds if any channel works
      // (critical while the old Supabase project is offline).
      const result = await submitQuote({
        data: {
          referenceId,
          customerName,
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          itemCount: items.reduce((s, i) => s + i.qty, 0),
          totalLow,
          totalHigh,
          productSummary: summarizeItems(items),
          notes: notes.trim() || undefined,
          rows,
        },
      });

      if (!result.ok) {
        console.error("[quote submit] failed:", result);
        toast.error(result.error);
        setSubmitting(false);
        return;
      }

      try {
        downloadQuotePdf({
          referenceId: result.referenceId,
          customer: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            city: city.trim(),
            zip: zip.trim(),
          },
          timeline: timeline || undefined,
          notes: notes.trim() || undefined,
          items,
          totalLow,
          totalHigh,
          totalMid,
          submittedAt: new Date(),
        });
      } catch (pdfErr) {
        console.error("[quote submit] PDF generation failed (non-blocking):", pdfErr);
      }

      clearCart();
      setSubmitting(false);
      navigate({ to: "/quote/success", search: { id: result.referenceId } });
    } catch (err) {
      console.error("[quote submit] unexpected error:", err);
      toast.error("Something went wrong submitting your request. Please try again or call us at (385) 240-4790.");
      setSubmitting(false);
    }
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
                      className="px-6 py-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">
                            {item.location
                              ? `${item.location}`
                              : productLabel(item.productType)}
                          </div>
                          <div className="mt-0.5 text-sm text-muted-foreground">
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
                            {(item.config as { exterior?: string }).exterior
                              ? ` · ${(item.config as { exterior?: string }).exterior}${
                                  (item.config as { exterior?: string }).exterior === "Stucco" &&
                                  (item.config as { stuccoInstall?: string }).stuccoInstall
                                    ? ` (${(item.config as { stuccoInstall?: string }).stuccoInstall})`
                                    : ""
                                }`
                              : ""}
                          </div>
                          {item.qty > 1 && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              Qty: {item.qty}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-shrink-0 items-start gap-3">
                          <div className="text-right">
                            <div className="font-semibold tabular-nums">
                              {formatUSD(item.price.low * item.qty)}
                            </div>
                            <div className="text-sm text-muted-foreground tabular-nums">
                              – {formatUSD(item.price.high * item.qty)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="mt-0.5 rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName" className="text-xs text-muted-foreground">
                        First name *
                      </Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Jane"
                        className="mt-1.5"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-xs text-muted-foreground">
                        Last name *
                      </Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="mt-1.5"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs text-muted-foreground">
                      Phone number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(385) 240-4790"
                      className="mt-1.5"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs text-muted-foreground">
                      Email address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1.5"
                      disabled={submitting}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city" className="text-xs text-muted-foreground">
                        City (optional)
                      </Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Salt Lake City"
                        className="mt-1.5"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip" className="text-xs text-muted-foreground">
                        Zip (optional)
                      </Label>
                      <Input
                        id="zip"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder="84101"
                        className="mt-1.5"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="timeline" className="text-xs text-muted-foreground">
                      Project timeline (optional)
                    </Label>
                    <Select value={timeline} onValueChange={setTimeline} disabled={submitting}>
                      <SelectTrigger id="timeline" className="mt-1.5">
                        <SelectValue placeholder="When are you hoping to start?" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMELINE_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      disabled={submitting}
                    />
                  </div>
                  {turnstileConfigured && (
                    <Turnstile onVerify={setTurnstileToken} />
                  )}
                  <Button
                    className="h-12 w-full rounded-full text-sm font-semibold"
                    disabled={submitting}
                    onClick={handleSubmit}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
                      </>
                    ) : (
                      "Request Callback & Measurement Appointment"
                    )}
                  </Button>
                  <p className="text-center text-[11px] text-muted-foreground">
                    {!canSubmit
                      ? missingFields.includes("spam check")
                        ? "Complete the security check above, then submit."
                        : "Type your name, phone, and email in the fields above (placeholders don’t count)."
                      : "No commitment required. We'll confirm your project details before scheduling."}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3 w-3" />
                    Final price confirmed after on-site measurement. No
                    surprises.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
