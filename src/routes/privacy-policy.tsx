import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Pane & Simple" },
      {
        name: "description",
        content: "How Pane & Simple collects, uses, and protects your information.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

const LAST_UPDATED = "July 2026";

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-base font-semibold tracking-tight">Overview</h2>
            <p className="mt-2 text-muted-foreground">
              Pane &amp; Simple ("we," "us," or "our") respects your privacy. This policy explains
              what information we collect when you use this website and our online configurator,
              how we use it, and how we protect it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold tracking-tight">Information We Collect</h2>
            <p className="mt-2 text-muted-foreground">When you request a quote, we collect:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Your name, phone number, and email address</li>
              <li>City and zip code (optional)</li>
              <li>Project details: product type, dimensions, and selected options</li>
              <li>Any notes you choose to share about your project or timeline</li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              While you use the configurator, your in-progress project selections are stored in
              your browser's local storage so you don't lose your work — this data stays on your
              device until you submit a quote request or clear your browser data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold tracking-tight">How We Use It</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>To contact you about your quote request and schedule a measurement appointment</li>
              <li>To prepare an accurate project estimate</li>
              <li>To improve our products, pricing, and website experience</li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold tracking-tight">How We Store It</h2>
            <p className="mt-2 text-muted-foreground">
              Quote requests are stored securely using Supabase, a third-party database provider.
              Access is restricted to authorized Pane &amp; Simple staff.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold tracking-tight">Your Choices</h2>
            <p className="mt-2 text-muted-foreground">
              You can ask us to access, correct, or delete the personal information we hold about
              you at any time by contacting us using the information below.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold tracking-tight">Contact Us</h2>
            <p className="mt-2 text-muted-foreground">
              Questions about this policy? Reach out using the contact information in the footer
              of this site.
            </p>
          </section>

          <p className="border-t border-border pt-6 text-xs text-muted-foreground">
            This is a general-purpose privacy policy template intended to cover a typical small
            home-services business. It is not a substitute for legal advice — consider having it
            reviewed by an attorney as your business grows.
          </p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
