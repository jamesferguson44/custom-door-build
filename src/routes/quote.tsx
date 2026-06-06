import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
  Sparkles,
  Ruler,
  Hammer,
  Mountain,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { cartTotal, clearCart, type CartItem } from "@/lib/quote-storage";
import { useCart } from "@/hooks/use-cart";
import { formatUSD } from "@/lib/pricing";
import { downloadQuotePdf } from "@/lib/quote-pdf";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "Get Your Exact Quote — Pane & Simple" },
      {
        name: "description",
        content:
          "Submit your window project for a personalized quote. Transparent pricing, no high-pressure sales.",
      },
    ],
  }),
  component: QuotePage,
});

const TIMELINES = [
  "Ready Now",
  "Within 1–3 Months",
  "Within 3–6 Months",
  "Just Researching",
] as const;
type Timeline = (typeof TIMELINES)[number];

const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().min(7, "Valid phone required").max(30),
  city: z.string().trim().min(1, "City is required").max(80),
  zip: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/u, "Enter a valid ZIP code"),
});
type Contact = z.infer<typeof contactSchema>;

function QuotePage() {
  const cart = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState<Contact>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    zip: "",
  });
  const [timeline, setTimeline] = useState<Timeline>("Within 1–3 Months");
  const [notes, setNotes] = useState("");

  const items = cart.items;
  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const totalMid = cartTotal(cart);
  const totalLow = useMemo(
    () => items.reduce((s, i) => s + i.price.low * i.qty, 0),
    [items],
  );
  const totalHigh = useMemo(
    () => items.reduce((s, i) => s + i.price.high * i.qty, 0),
    [items],
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">No project yet</h1>
          <p className="mt-3 text-muted-foreground">
            Design your windows first — then come back to request your exact quote.
          </p>
          <Button asChild className="mt-8 h-12 rounded-full px-8">
            <Link to="/configure/$type" params={{ type: "window" }}>
              See My Window Price
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    const parsed = contactSchema.safeParse(contact);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please fill the form");
      return;
    }
    setContact(parsed.data);
    setStep(2);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const rows = items.flatMap((item) =>
        Array.from({ length: item.qty }).map(() => ({
          product_type: item.productType,
          configuration: item.config as never,
          width_inches: item.config.width ?? 0,
          height_inches: item.config.height ?? 0,
          base_price: Math.round(item.price.basePrice),
          addons_price: item.price.addonsPrice,
          labor_price: item.price.laborPrice,
          total_price: item.price.total,
          customer_name: `${contact.firstName} ${contact.lastName}`.trim(),
          customer_first_name: contact.firstName,
          customer_last_name: contact.lastName,
          customer_phone: contact.phone,
          customer_email: contact.email,
          customer_city: contact.city,
          customer_zip: contact.zip,
          customer_address: null,
          project_timeline: timeline,
          project_notes: notes.trim() || null,
        })),
      );

      const { data, error } = await supabase
        .from("quotes")
        .insert(rows)
        .select("id");

      if (error) throw error;

      const referenceId = data?.[0]?.id ?? "";

      // Generate + download branded project summary PDF
      try {
        downloadQuotePdf(
          {
            referenceId,
            customer: contact,
            timeline,
            notes: notes.trim() || undefined,
            items,
            totalLow,
            totalHigh,
            totalMid,
            submittedAt: new Date(),
          },
          `pane-and-simple-quote-${referenceId.slice(0, 8) || "summary"}.pdf`,
        );
      } catch (pdfErr) {
        console.warn("PDF generation failed", pdfErr);
      }

      toast.success("Quote request received.");
      clearCart();
      navigate({ to: "/quote/success", search: { id: referenceId } });
    } catch (e) {
      console.error(e);
      toast.error("Could not submit quote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        {/* Progress */}
        <div className="mb-10 flex items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-[0.18em]">
          <StepBadge n={1} label="Your Info" active={step === 1} done={step > 1} />
          <div className="h-px w-10 bg-border" />
          <StepBadge n={2} label="Review & Submit" active={step === 2} done={false} />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Get Your Exact Quote
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            We&apos;ll review your project, verify measurements if needed, and provide a
            personalized quote.
          </p>
        </div>

        {step === 1 ? (
          <section className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First Name" id="firstName">
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  value={contact.firstName}
                  onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                />
              </Field>
              <Field label="Last Name" id="lastName">
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  value={contact.lastName}
                  onChange={(e) => setContact({ ...contact, lastName: e.target.value })}
                />
              </Field>
              <Field label="Email Address" id="email" full>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                />
              </Field>
              <Field label="Phone Number" id="phone" full>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                />
              </Field>
              <Field label="City" id="city">
                <Input
                  id="city"
                  autoComplete="address-level2"
                  value={contact.city}
                  onChange={(e) => setContact({ ...contact, city: e.target.value })}
                />
              </Field>
              <Field label="ZIP Code" id="zip">
                <Input
                  id="zip"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={10}
                  value={contact.zip}
                  onChange={(e) => setContact({ ...contact, zip: e.target.value })}
                />
              </Field>
            </div>

            <Button
              onClick={handleContinue}
              className="mt-8 h-12 w-full rounded-full text-sm font-semibold"
            >
              Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Your information stays private. We only contact you about your project.
            </p>
          </section>
        ) : (
          <ReviewStep
            contact={contact}
            items={items}
            itemCount={itemCount}
            totalLow={totalLow}
            totalHigh={totalHigh}
            totalMid={totalMid}
            timeline={timeline}
            setTimeline={setTimeline}
            notes={notes}
            setNotes={setNotes}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

function StepBadge({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
          done && "border-emerald-600 bg-emerald-600 text-background",
          active && "border-foreground bg-foreground text-background",
          !active && !done && "border-border text-muted-foreground",
        )}
      >
        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
      </span>
      <span className={cn(active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
    </div>
  );
}

function ReviewStep(props: {
  contact: Contact;
  items: CartItem[];
  itemCount: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  timeline: Timeline;
  setTimeline: (t: Timeline) => void;
  notes: string;
  setNotes: (s: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const { items, itemCount, totalLow, totalHigh, totalMid } = props;

  const productLines = uniqStrings(
    items.map((i) => (i.config as { productLine?: string }).productLine),
  );
  const glassTypes = uniqStrings(
    items.map((i) => (i.config as { glassType?: string }).glassType),
  );

  return (
    <div className="mt-10 space-y-6">
      {/* Project Summary Card */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Your Project
          </div>
          <div className="mt-1 text-lg font-semibold tracking-tight">
            {itemCount} {itemCount === 1 ? "Window" : "Windows"}
          </div>
        </div>

        <dl className="divide-y divide-border">
          <SummaryRow label="Total Windows" value={String(itemCount)} />
          <SummaryRow
            label="Estimated Project Total"
            value={`${formatUSD(totalLow)} – ${formatUSD(totalHigh)}`}
            sub={`Midpoint ${formatUSD(totalMid)}`}
          />
          <SummaryRow label="Product Lines" value={productLines.join(", ") || "—"} />
          <SummaryRow label="Glass Types" value={glassTypes.join(", ") || "—"} />
          <SummaryRow
            label="Installation"
            value="Included"
            icon={<Hammer className="h-3.5 w-3.5 text-emerald-600" />}
          />
          <SummaryRow
            label="Measurement Verification"
            value="Included"
            icon={<Ruler className="h-3.5 w-3.5 text-emerald-600" />}
          />
        </dl>
      </section>

      {/* Timeline */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold tracking-tight">What&apos;s Your Timeline?</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Helps us prioritize and prepare the right resources.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {TIMELINES.map((t) => {
            const selected = props.timeline === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => props.setTimeline(t)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition",
                  selected
                    ? "border-foreground bg-foreground/5 font-medium"
                    : "border-border hover:border-foreground/40",
                )}
              >
                <span>{t}</span>
                {selected && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <Label htmlFor="notes" className="text-sm font-semibold tracking-tight">
          Optional Notes
        </Label>
        <Textarea
          id="notes"
          rows={4}
          className="mt-3"
          placeholder="Tell us anything you'd like us to know about your project."
          value={props.notes}
          onChange={(e) => props.setNotes(e.target.value.slice(0, 1000))}
        />
      </section>

      {/* Trust */}
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-6">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-foreground/80" />
          <h2 className="text-sm font-semibold tracking-tight">
            Why Homeowners Choose Pane &amp; Simple
          </h2>
        </div>
        <ul className="mt-4 grid gap-2.5 text-[13px] sm:grid-cols-2">
          {[
            { icon: <Eye className="h-3.5 w-3.5" />, text: "Transparent online pricing" },
            { icon: <Sparkles className="h-3.5 w-3.5" />, text: "No high-pressure sales presentations" },
            { icon: <Ruler className="h-3.5 w-3.5" />, text: "Professional measurement verification" },
            { icon: <Hammer className="h-3.5 w-3.5" />, text: "Installation available" },
            { icon: <Mountain className="h-3.5 w-3.5" />, text: "Built for Utah weather" },
          ].map((t) => (
            <li key={t.text} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
              <span className="text-foreground/85">{t.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="space-y-3">
        <Button
          onClick={props.onSubmit}
          disabled={props.loading}
          className="h-12 w-full rounded-full text-sm font-semibold shadow-[var(--shadow-elegant)]"
        >
          {props.loading ? "Submitting…" : "Request My Exact Quote"}
          {!props.loading && <ArrowRight className="ml-1.5 h-4 w-4" />}
        </Button>
        <button
          type="button"
          onClick={props.onBack}
          className="flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Edit my information
        </button>
      </div>
    </div>
  );
}

function SummaryRow({
  label, value, sub, icon,
}: { label: string; value: string; sub?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 py-3.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right">
        <div className="flex items-center justify-end gap-1.5 text-sm font-medium">
          {icon}
          <span>{value}</span>
        </div>
        {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
      </dd>
    </div>
  );
}

function uniqStrings(arr: (string | undefined)[]): string[] {
  return Array.from(new Set(arr.filter((v): v is string => Boolean(v))));
}

function Field({
  label, id, full, children,
}: { label: string; id: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label htmlFor={id} className="mb-1.5 text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

/* legacy exports retained intentionally removed */
          </div>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="px-6 py-6">
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Estimated Project Investment
                </div>
                <div className="mt-2 text-5xl font-semibold tracking-tight tabular-nums">
                  {formatUSD(total)}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"} · includes labor &amp; warranty
                </div>
                <div className="mt-5 border-t border-border pt-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Includes
                  </div>
                  <ul className="mt-2 space-y-1.5 text-[13px]">
                    {[
                      "Professional measurement",
                      "Installation",
                      "Workmanship warranty",
                      "Cleanup and disposal",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-border px-6 py-5 text-[13px]">
                {cart.items.map((i) => (
                  <div key={i.id} className="flex items-baseline justify-between py-1">
                    <span className="truncate pr-2 text-muted-foreground">
                      {productLabel(i.productType)} · {i.config.width}″×{i.config.height}″
                      {i.qty > 1 && ` × ${i.qty}`}
                    </span>
                    <span className="tabular-nums">{formatUSD(i.price.total * i.qty)}</span>
                  </div>
                ))}
                <div className="my-3 border-t border-border" />
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-semibold tabular-nums">{formatUSD(total)}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-border bg-muted/30 px-6 py-5">
                <ScheduleMeasurementDialog
                  trigger={
                    <Button className="h-12 w-full rounded-full text-sm font-semibold">
                      <Ruler className="mr-1.5 h-4 w-4" /> Request Final Measurement
                    </Button>
                  }
                />
                <Button variant="outline" className="h-11 w-full rounded-full" disabled={loading} onClick={() => submit("save")}>
                  <Mail className="mr-1.5 h-4 w-4" /> Email Me My Estimate
                </Button>
                <p className="pt-1 text-center text-[11px] leading-relaxed text-muted-foreground">
                  Your measurements don&apos;t need to be perfect.<br />
                  We verify every opening before ordering your windows.
                </p>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="px-6 py-5">
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  What Happens Next?
                </div>
                <ol className="mt-4 space-y-3">
                  {[
                    { icon: <ClipboardCheck className="h-4 w-4" />, label: "Submit your project" },
                    { icon: <Calendar className="h-4 w-4" />, label: "We schedule a measurement visit" },
                    { icon: <Ruler className="h-4 w-4" />, label: "We verify dimensions and final pricing" },
                    { icon: <Package className="h-4 w-4" />, label: "Your windows are ordered" },
                    { icon: <Hammer className="h-4 w-4" />, label: "Professional installation" },
                  ].map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                        {s.icon}
                      </div>
                      <div className="pt-1 text-sm">{s.label}</div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function LineItem({ item }: { item: CartItem }) {
  const cfg = item.config as Record<string, unknown>;
  const specs = Object.entries(cfg)
    .filter(([k]) => !["width", "height"].includes(k))
    .map(([, v]) => String(v))
    .join(" · ");

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {productLabel(item.productType)}
            </h3>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {item.config.width}″ × {item.config.height}″
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{specs}</p>
        </div>
        <div className="text-right">
          <div className="text-base font-semibold tabular-nums">
            {formatUSD(item.price.total * item.qty)}
          </div>
          {item.qty > 1 && (
            <div className="text-[11px] text-muted-foreground tabular-nums">
              {formatUSD(item.price.total)} ea
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div className="inline-flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => updateQty(item.id, item.qty - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-l-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-medium tabular-nums">{item.qty}</span>
          <button
            type="button"
            onClick={() => updateQty(item.id, item.qty + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-r-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => removeFromCart(item.id)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" /> Remove
        </button>
      </div>
    </div>
  );
}

function Field({ label, id, full, children }: { label: string; id: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label htmlFor={id} className="mb-1 text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
