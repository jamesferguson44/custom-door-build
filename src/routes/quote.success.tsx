import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/quote/success")({
  validateSearch: z.object({ id: z.string().optional() }),
  head: () => ({
    meta: [{ title: "Quote Submitted — Utah Window & Door" }],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { id } = Route.useSearch();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Quote received</h1>
        <p className="mt-3 text-muted-foreground">
          Thanks! A specialist will reach out within one business day to verify measurements and
          schedule installation.
        </p>
        {id && (
          <p className="mt-2 text-xs text-muted-foreground">
            Reference: <span className="font-mono">{id.slice(0, 8)}</span>
          </p>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/configure/$type" params={{ type: "window" }}>Configure Another</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
