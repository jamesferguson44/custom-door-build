import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { loadCurrentQuote, saveCurrentQuote, clearCurrentQuote, type StoredQuote } from "@/lib/quote-storage";
import { formatUSD, productLabel, sendToShopifyCheckout } from "@/lib/pricing";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "Your Quote — Utah Window & Door" },
      { name: "description", content: "Review your configuration and request installation." },
    ],
  }),
  component: QuotePage,
});

const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().trim().min(7, "Valid phone required").max(30),
  email: z.string().trim().email("Valid email required").max(255),
  address: z.string().trim().min(5, "Address is required").max(255),
  notes: z.string().trim().max(1000).optional(),
});

function QuotePage() {
  const [quote, setQuote] = useState<StoredQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    setQuote(loadCurrentQuote());
  }, []);

  if (!quote) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold">No active quote</h1>
          <p className="mt-2 text-muted-foreground">Start by configuring a product.</p>
          <Button asChild className="mt-6">
            <Link to="/configure/$type" params={{ type: "window" }}>Start Configuring</Link>
          </Button>
        </div>
      </div>
    );
  }

  const submit = async (mode: "save" | "install" | "checkout") => {
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please fill the form");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("quotes")
        .insert({
          product_type: quote.productType,
          configuration: quote.config as never,
          width_inches: quote.config.width,
          height_inches: quote.config.height,
          base_price: Math.round(quote.price.basePrice),
          addons_price: quote.price.addonsPrice,
          labor_price: quote.price.laborPrice,
          total_price: quote.price.total,
          customer_name: parsed.data.name,
          customer_phone: parsed.data.phone,
          customer_email: parsed.data.email,
          customer_address: parsed.data.address,
          project_notes: parsed.data.notes || null,
        })
        .select("id")
        .single();

      if (error) throw error;

      saveCurrentQuote({
        ...quote,
        id: data.id,
        customer: { ...parsed.data, notes: parsed.data.notes },
      });

      if (mode === "checkout") {
        await sendToShopifyCheckout({
          productType: quote.productType,
          config: quote.config,
          price: quote.price,
          customer: {
            name: parsed.data.name,
            email: parsed.data.email,
            phone: parsed.data.phone,
            address: parsed.data.address,
          },
        });
        toast.success("Quote saved. Checkout will open once Shopify is connected.");
      } else if (mode === "install") {
        toast.success("Installation request submitted! We'll be in touch shortly.");
      } else {
        toast.success("Quote saved. Confirmation sent to your email.");
      }

      clearCurrentQuote();
      navigate({ to: "/quote/success", search: { id: data.id } });
    } catch (e) {
      console.error(e);
      toast.error("Could not submit quote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cfg = quote.config as Record<string, unknown>;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Your Quote</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your configuration, then submit your request.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Configuration</h2>
                <Link
                  to="/configure/$type"
                  params={{ type: quote.productType }}
                  className="text-sm font-medium underline-offset-4 hover:underline"
                >
                  Edit
                </Link>
              </div>
              <Separator className="my-4" />
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <Detail k="Product" v={productLabel(quote.productType)} />
                <Detail k="Dimensions" v={`${quote.config.width}″ × ${quote.config.height}″`} />
                {Object.entries(cfg)
                  .filter(([k]) => !["width", "height"].includes(k))
                  .map(([k, v]) => (
                    <Detail key={k} k={prettyKey(k)} v={String(v)} />
                  ))}
              </dl>
            </section>

            <section className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-lg font-semibold">Your Information</h2>
              <Separator className="my-4" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" id="name">
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
                <Field label="Phone" id="phone">
                  <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </Field>
                <Field label="Email" id="email" full>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Field>
                <Field label="Project Address" id="address" full>
                  <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </Field>
                <Field label="Project Notes (optional)" id="notes" full>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </Field>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)]">
              <div className="border-b bg-muted/40 px-6 py-5">
                <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Estimated Total
                </div>
                <div className="mt-2 text-4xl font-bold tracking-tight tabular-nums">
                  {formatUSD(quote.price.total)}
                </div>
              </div>
              <div className="space-y-2 px-6 py-5 text-sm">
                <Row k="Base price" v={formatUSD(quote.price.basePrice)} />
                <Row k="Add-ons" v={formatUSD(quote.price.addonsPrice)} />
                <Row k="Labor" v={formatUSD(quote.price.laborPrice)} />
                <Separator />
                <Row k="Total" v={formatUSD(quote.price.total)} bold />
              </div>
              <div className="space-y-2 border-t bg-muted/30 p-6">
                <Button className="w-full" disabled={loading} onClick={() => submit("install")}>
                  Request Installation
                </Button>
                <Button variant="outline" className="w-full" disabled={loading} onClick={() => submit("save")}>
                  Save Quote
                </Button>
                <Button variant="ghost" className="w-full" disabled={loading} onClick={() => submit("checkout")}>
                  Proceed to Checkout
                </Button>
                <p className="pt-2 text-center text-[11px] text-muted-foreground">
                  Final price subject to measurement verification
                </p>
              </div>
            </div>
          </aside>
        </div>
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

function Detail({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-semibold" : "text-muted-foreground"}`}>
      <span>{k}</span>
      <span className="tabular-nums text-foreground">{v}</span>
    </div>
  );
}

function prettyKey(k: string): string {
  return k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}
