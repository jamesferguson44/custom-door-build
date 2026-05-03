import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Minus, Plus } from "lucide-react";
import { ScheduleMeasurementDialog } from "@/components/ScheduleMeasurementDialog";
import { supabase } from "@/integrations/supabase/client";
import {
  cartTotal,
  clearCart,
  removeFromCart,
  updateQty,
  type CartItem,
} from "@/lib/quote-storage";
import { useCart } from "@/hooks/use-cart";
import { formatUSD, productLabel, sendToShopifyCheckout } from "@/lib/pricing";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "Your Quote — Utah Window & Door" },
      { name: "description", content: "Review your configurations and request installation." },
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
  const cart = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const navigate = useNavigate();

  const total = cartTotal(cart);
  const itemCount = cart.items.reduce((s, i) => s + i.qty, 0);

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Your quote is empty</h1>
          <p className="mt-3 text-muted-foreground">
            Configure a window or door to add it to your quote.
          </p>
          <Button asChild className="mt-8 h-12 rounded-full px-8">
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
      const rows = cart.items.flatMap((item) =>
        Array.from({ length: item.qty }).map(() => ({
          product_type: item.productType,
          configuration: item.config as never,
          width_inches: item.config.width,
          height_inches: item.config.height,
          base_price: Math.round(item.price.basePrice),
          addons_price: item.price.addonsPrice,
          labor_price: item.price.laborPrice,
          total_price: item.price.total,
          customer_name: parsed.data.name,
          customer_phone: parsed.data.phone,
          customer_email: parsed.data.email,
          customer_address: parsed.data.address,
          project_notes: parsed.data.notes || null,
        }))
      );

      const { data, error } = await supabase
        .from("quotes")
        .insert(rows)
        .select("id");

      if (error) throw error;

      if (mode === "checkout") {
        await sendToShopifyCheckout({
          productType: cart.items[0].productType,
          config: cart.items[0].config,
          price: cart.items[0].price,
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

      clearCart();
      navigate({ to: "/quote/success", search: { id: data?.[0]?.id ?? "" } });
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
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Your Quote
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </h1>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/configure/$type" params={{ type: "window" }}>
              <Plus className="mr-1 h-4 w-4" /> Add another
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <LineItem key={item.id} item={item} />
            ))}

            <section className="mt-8 rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold tracking-tight">Your Information</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll use this to confirm your quote and schedule a measurement visit.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
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

          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="px-6 py-6">
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Combined Total
                </div>
                <div className="mt-2 text-5xl font-semibold tracking-tight tabular-nums">
                  {formatUSD(total)}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"} · includes labor &amp; warranty
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
                      Schedule Measurement
                    </Button>
                  }
                />
                <Button variant="outline" className="h-11 w-full rounded-full" disabled={loading} onClick={() => submit("save")}>
                  Save Quote
                </Button>
                <Button variant="ghost" className="h-11 w-full rounded-full" disabled={loading} onClick={() => submit("checkout")}>
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
