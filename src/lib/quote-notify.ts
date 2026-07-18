import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const notifyInput = z.object({
  quoteId: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  customerPhone: z.string(),
  itemCount: z.number(),
  totalLow: z.number(),
  totalHigh: z.number(),
  productSummary: z.string(),
  notes: z.string().optional(),
});

/**
 * Emails the business when a new quote comes in. No-ops (logs and returns)
 * if RESEND_API_KEY isn't configured yet — the quote itself still saves to
 * Supabase either way, this is just the "someone should look at this" ping.
 */
export const notifyNewQuote = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof notifyInput>) => notifyInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.NOTIFY_TO_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !toEmail || !fromEmail) {
      console.warn(
        "[quote-notify] Skipping email notification — RESEND_API_KEY, NOTIFY_TO_EMAIL, or RESEND_FROM_EMAIL not configured.",
      );
      return { sent: false, reason: "not_configured" as const };
    }

    const money = (n: number) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="margin: 0 0 16px;">New Quote Request</h2>
        <p style="margin: 0 0 4px;"><strong>${escapeHtml(data.customerName)}</strong></p>
        <p style="margin: 0 0 4px;">
          <a href="mailto:${escapeHtml(data.customerEmail)}">${escapeHtml(data.customerEmail)}</a> ·
          <a href="tel:${escapeHtml(data.customerPhone)}">${escapeHtml(data.customerPhone)}</a>
        </p>
        <p style="margin: 16px 0 4px;">${escapeHtml(data.productSummary)}</p>
        <p style="margin: 0 0 16px; font-size: 20px; font-weight: 600;">
          ${money(data.totalLow)} – ${money(data.totalHigh)}
        </p>
        ${data.notes ? `<p style="margin: 0 0 16px; color: #555;">"${escapeHtml(data.notes)}"</p>` : ""}
        <p style="margin: 24px 0 0; font-size: 12px; color: #888;">Quote #${data.quoteId.slice(0, 8).toUpperCase()}</p>
      </div>
    `.trim();

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmail,
          reply_to: data.customerEmail,
          subject: `New quote: ${data.customerName} — ${data.productSummary}`,
          html,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error("[quote-notify] Resend API error:", res.status, body);
        return { sent: false, reason: "send_failed" as const };
      }
      return { sent: true as const };
    } catch (err) {
      console.error("[quote-notify] Failed to send notification email:", err);
      return { sent: false, reason: "send_failed" as const };
    }
  });

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
