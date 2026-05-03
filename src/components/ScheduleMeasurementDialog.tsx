import { useState } from "react";
import { z } from "zod";
import { CalendarCheck, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  chargeMeasurementDeposit,
  MEASUREMENT_DEPOSIT_USD,
} from "@/lib/payments";
import { formatUSD } from "@/lib/pricing";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().trim().min(7, "Valid phone required").max(30),
  email: z.string().trim().email("Valid email required").max(255),
  address: z.string().trim().min(5, "Address is required").max(255),
});

type FormState = z.infer<typeof schema>;

type Props = {
  trigger?: React.ReactNode;
  /** Optional metadata sent to the payment provider (e.g. quote id). */
  metadata?: Record<string, string>;
};

export function ScheduleMeasurementDialog({ trigger, metadata }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ id: string } | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const reset = () => {
    setForm({ name: "", phone: "", email: "", address: "" });
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please complete the form");
      return;
    }
    setLoading(true);
    try {
      const result = await chargeMeasurementDeposit(parsed.data, metadata);
      if (!result.ok) {
        toast.error(result.error || "Payment failed. Please try again.");
        return;
      }
      setSuccess({ id: result.transactionId });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setTimeout(reset, 200);
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="h-12 rounded-full px-6 text-sm font-semibold">
            <CalendarCheck className="mr-2 h-4 w-4" />
            Schedule Measurement
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {success ? (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              Measurement Scheduled
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Your {formatUSD(MEASUREMENT_DEPOSIT_USD)} deposit was received.
              We'll reach out within one business day to confirm a time.
            </p>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Confirmation: <span className="font-mono">{success.id}</span>
            </p>
            <Button
              className="mt-6 h-11 w-full rounded-full"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Schedule a Measurement</DialogTitle>
              <DialogDescription>
                A certified installer will visit your home to take exact
                measurements. A refundable {formatUSD(MEASUREMENT_DEPOSIT_USD)}{" "}
                deposit secures your appointment and applies to your final
                quote.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 grid gap-4">
              <Field id="m-name" label="Full Name">
                <Input
                  id="m-name"
                  value={form.name}
                  maxLength={120}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field id="m-phone" label="Phone">
                <Input
                  id="m-phone"
                  type="tel"
                  value={form.phone}
                  maxLength={30}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <Field id="m-email" label="Email">
                <Input
                  id="m-email"
                  type="email"
                  value={form.email}
                  maxLength={255}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field id="m-address" label="Project Address">
                <Input
                  id="m-address"
                  value={form.address}
                  maxLength={255}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </Field>
            </div>

            <div className="mt-5 rounded-xl border border-border bg-muted/40 px-4 py-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm">Measurement Deposit</span>
                <span className="text-base font-semibold tabular-nums">
                  {formatUSD(MEASUREMENT_DEPOSIT_USD)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Mock payment — no card will be charged.
              </p>
            </div>

            <DialogFooter className="mt-5">
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-full text-sm font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>Pay {formatUSD(MEASUREMENT_DEPOSIT_USD)} & Schedule</>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1 text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}