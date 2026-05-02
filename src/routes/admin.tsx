import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatUSD, productLabel } from "@/lib/pricing";
import type { Database } from "@/integrations/supabase/types";

type Quote = Database["public"]["Tables"]["quotes"]["Row"];
type QuoteStatus = Database["public"]["Enums"]["quote_status"];

const STATUSES: QuoteStatus[] = ["new", "contacted", "scheduled", "completed"];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Utah Window & Door" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
      setAuthLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [userId]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Loading…
        </div>
      </div>
    );
  }

  if (!userId) return <SignIn />;
  if (!isAdmin) return <NotAuthorized />;

  return <Dashboard />;
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Account created. You may need an admin to grant you access.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border bg-card p-8 shadow-[var(--shadow-card)]">
          <h1 className="text-2xl font-bold tracking-tight">Admin Sign In</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage incoming quotes and customer requests.
          </p>
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pw">Password</Label>
              <Input
                id="pw"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
            <button
              type="button"
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin"
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function NotAuthorized() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Access pending</h1>
        <p className="mt-2 text-muted-foreground">
          Your account is signed in but not yet granted admin access. Ask an existing admin to add
          you to the <code className="rounded bg-muted px-1.5 py-0.5 text-xs">user_roles</code>{" "}
          table with the <code className="rounded bg-muted px-1.5 py-0.5 text-xs">admin</code>{" "}
          role.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => supabase.auth.signOut()}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}

function Dashboard() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filter, setFilter] = useState<QuoteStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Quote | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setQuotes(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? quotes : quotes.filter((q) => q.status === filter)),
    [quotes, filter]
  );

  const updateStatus = async (id: string, status: QuoteStatus) => {
    const { error } = await supabase.from("quotes").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
    if (selected?.id === id) setSelected({ ...selected, status });
    toast.success("Status updated");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quote Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">{quotes.length} total quotes</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => supabase.auth.signOut()}>
              Sign out
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)]">
            {loading ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Loading quotes…</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No quotes match this filter.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Customer</th>
                    <th className="px-4 py-3 text-left font-medium">Product</th>
                    <th className="px-4 py-3 text-left font-medium">Total</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((q) => (
                    <tr
                      key={q.id}
                      onClick={() => setSelected(q)}
                      className={`cursor-pointer transition hover:bg-muted/40 ${
                        selected?.id === q.id ? "bg-muted/60" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{q.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{q.customer_email}</div>
                      </td>
                      <td className="px-4 py-3">{productLabel(q.product_type)}</td>
                      <td className="px-4 py-3 font-medium tabular-nums">
                        {formatUSD(Number(q.total_price))}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(q.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            {selected ? (
              <QuoteDetail
                quote={selected}
                onUpdateStatus={(s) => updateStatus(selected.id, s)}
              />
            ) : (
              <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                Select a quote to view details
              </div>
            )}
          </aside>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}

function QuoteDetail({ quote, onUpdateStatus }: { quote: Quote; onUpdateStatus: (s: QuoteStatus) => void }) {
  const cfg = quote.configuration as Record<string, unknown>;
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)]">
      <div className="border-b bg-muted/40 px-6 py-5">
        <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {productLabel(quote.product_type)}
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums">
          {formatUSD(Number(quote.total_price))}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Quote #{quote.id.slice(0, 8)}
        </div>
      </div>
      <div className="space-y-4 px-6 py-5 text-sm">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </div>
          <Select value={quote.status} onValueChange={(v) => onUpdateStatus(v as QuoteStatus)}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Customer
          </div>
          <div className="space-y-1">
            <div className="font-medium">{quote.customer_name}</div>
            <a href={`mailto:${quote.customer_email}`} className="block text-muted-foreground hover:underline">
              {quote.customer_email}
            </a>
            <a href={`tel:${quote.customer_phone}`} className="block text-muted-foreground hover:underline">
              {quote.customer_phone}
            </a>
            <div className="text-muted-foreground">{quote.customer_address}</div>
          </div>
        </div>

        {quote.project_notes && (
          <>
            <Separator />
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Notes
              </div>
              <p className="text-muted-foreground">{quote.project_notes}</p>
            </div>
          </>
        )}

        <Separator />

        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Specification
          </div>
          <dl className="grid grid-cols-2 gap-y-1.5">
            <dt className="text-muted-foreground">Dimensions</dt>
            <dd className="text-right">
              {Number(quote.width_inches)}″ × {Number(quote.height_inches)}″
            </dd>
            {Object.entries(cfg)
              .filter(([k]) => !["width", "height"].includes(k))
              .map(([k, v]) => (
                <DetailRow key={k} k={k} v={String(v)} />
              ))}
          </dl>
        </div>

        <Separator />

        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Pricing
          </div>
          <dl className="grid grid-cols-2 gap-y-1.5 text-muted-foreground">
            <dt>Base</dt>
            <dd className="text-right tabular-nums">{formatUSD(Number(quote.base_price))}</dd>
            <dt>Add-ons</dt>
            <dd className="text-right tabular-nums">{formatUSD(Number(quote.addons_price))}</dd>
            <dt>Labor</dt>
            <dd className="text-right tabular-nums">{formatUSD(Number(quote.labor_price))}</dd>
            <dt className="font-semibold text-foreground">Total</dt>
            <dd className="text-right font-semibold tabular-nums text-foreground">
              {formatUSD(Number(quote.total_price))}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-muted-foreground">
        {k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
      </dt>
      <dd className="text-right">{v}</dd>
    </>
  );
}

function StatusBadge({ status }: { status: QuoteStatus }) {
  const variants: Record<QuoteStatus, string> = {
    new: "bg-foreground text-background",
    contacted: "bg-muted text-foreground border",
    scheduled: "bg-accent text-foreground",
    completed: "bg-muted-foreground/10 text-muted-foreground border",
  };
  return (
    <Badge className={`${variants[status]} font-medium capitalize`} variant="secondary">
      {status}
    </Badge>
  );
}
