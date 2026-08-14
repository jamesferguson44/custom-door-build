import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database, Json } from "@/integrations/supabase/types";

const productType = z.enum(["window", "door", "sliding_door"]);

const quoteRow = z.object({
  id: z.string().uuid().optional(),
  product_type: productType,
  configuration: z.any(),
  width_inches: z.number(),
  height_inches: z.number(),
  base_price: z.number(),
  addons_price: z.number(),
  labor_price: z.number(),
  total_price: z.number(),
  customer_name: z.string().min(1),
  customer_first_name: z.string().optional().nullable(),
  customer_last_name: z.string().optional().nullable(),
  customer_phone: z.string().min(1),
  customer_email: z.string().email(),
  customer_city: z.string().optional().nullable(),
  customer_zip: z.string().optional().nullable(),
  project_notes: z.string().optional().nullable(),
  project_timeline: z.string().optional().nullable(),
});

const submitInput = z.object({
  referenceId: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  itemCount: z.number(),
  totalLow: z.number(),
  totalHigh: z.number(),
  productSummary: z.string(),
  notes: z.string().optional(),
  timeline: z.string().optional(),
  preferredDays: z.string().optional(),
  preferredTime: z.string().optional(),
  rows: z.array(quoteRow).min(1),
});

export type SubmitQuoteResult =
  | {
      ok: true;
      referenceId: string;
      saved: boolean;
      emailed: boolean;
      channels: string[];
    }
  | {
      ok: false;
      error: string;
      detail?: string;
    };

/**
 * Captures a quote lead using whatever backends are available:
 * 1) Supabase insert (admin / future reads)
 * 2) Resend email (NOTIFY_TO_EMAIL)
 * 3) FormSubmit email fallback (no API key; uses business inbox)
 *
 * Returns ok if at least one channel succeeds — so a dead Supabase project
 * no longer silently kills lead capture.
 */
export const submitQuote = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof submitInput>) => submitInput.parse(input))
  .handler(async ({ data }): Promise<SubmitQuoteResult> => {
    const channels: string[] = [];
    const failures: string[] = [];

    // --- 1) Supabase (optional; skips cleanly if misconfigured or unreachable)
    const saved = await trySaveToSupabase(data.rows, failures);
    if (saved) channels.push("supabase");

    // --- 2) Resend (optional)
    const emailedResend = await tryResendNotify(data, failures);
    if (emailedResend) channels.push("resend");

    // --- 3) FormSubmit fallback so leads still hit the inbox with no keys
    let emailedForm = false;
    if (!saved && !emailedResend) {
      emailedForm = await tryFormSubmit(data, failures);
      if (emailedForm) channels.push("formsubmit");
    }

    if (channels.length === 0) {
      console.error("[submit-quote] All channels failed:", failures);
      return {
        ok: false,
        error:
          "We couldn't save your request right now. Please call us at (385) 240-4790 and we'll take care of you.",
        detail: failures.join(" | ").slice(0, 500),
      };
    }

    return {
      ok: true,
      referenceId: data.referenceId,
      saved,
      emailed: emailedResend || emailedForm,
      channels,
    };
  });

async function trySaveToSupabase(
  rows: z.infer<typeof quoteRow>[],
  failures: string[],
): Promise<boolean> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    failures.push("supabase: not configured");
    return false;
  }

  // Fail fast on dead/deleted projects (common after free-tier cleanup).
  try {
    const hostname = new URL(url).hostname;
    const dnsOk = await dnsLooksResolvable(hostname);
    if (!dnsOk) {
      failures.push(`supabase: host unreachable (${hostname})`);
      return false;
    }
  } catch {
    failures.push("supabase: invalid URL");
    return false;
  }

  try {
    const supabase = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const payload = rows.map((r) => ({
      ...r,
      configuration: r.configuration as Json,
    }));

    const insertPromise = supabase.from("quotes").insert(payload);
    const timeout = new Promise<{ error: { message: string } }>((resolve) =>
      setTimeout(() => resolve({ error: { message: "insert timed out after 8s" } }), 8000),
    );
    const { error } = await Promise.race([insertPromise, timeout]);
    if (error) {
      failures.push(`supabase: ${error.message}`);
      console.error("[submit-quote] supabase insert failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    failures.push(`supabase: ${msg}`);
    console.error("[submit-quote] supabase exception:", err);
    return false;
  }
}

async function tryResendNotify(
  data: z.infer<typeof submitInput>,
  failures: string[],
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.NOTIFY_TO_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    failures.push("resend: not configured");
    return false;
  }

  const money = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

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
      <p style="margin: 0 0 16px;">
        <strong>Preferred days:</strong> ${escapeHtml(data.preferredDays || "No preference")}<br />
        <strong>Preferred time:</strong> ${escapeHtml(data.preferredTime || "No preference")}<br />
        <strong>Project timeline:</strong> ${escapeHtml(data.timeline || "Not specified")}
      </p>
      ${data.notes ? `<p style="margin: 0 0 16px; color: #555;">"${escapeHtml(data.notes)}"</p>` : ""}
      <p style="margin: 24px 0 0; font-size: 12px; color: #888;">Quote #${data.referenceId.slice(0, 8).toUpperCase()}</p>
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
        subject: `New measurement request: ${data.customerName} — ${data.productSummary}`,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      failures.push(`resend: ${res.status} ${body.slice(0, 120)}`);
      return false;
    }
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    failures.push(`resend: ${msg}`);
    return false;
  }
}

/**
 * Zero-config email path. FormSubmit free plan: first use for an address
 * sends a one-time activation email — after confirm, every lead is delivered.
 */
async function tryFormSubmit(
  data: z.infer<typeof submitInput>,
  failures: string[],
): Promise<boolean> {
  const to =
    process.env.NOTIFY_TO_EMAIL ||
    process.env.LEAD_FALLBACK_EMAIL ||
    "hello@paneandsimplewindows.com";

  const money = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const message = [
    `Name: ${data.customerName}`,
    `Email: ${data.customerEmail}`,
    `Phone: ${data.customerPhone}`,
    `Items: ${data.productSummary}`,
    `Estimate: ${money(data.totalLow)} – ${money(data.totalHigh)}`,
    `Preferred days: ${data.preferredDays || "No preference"}`,
    `Preferred time: ${data.preferredTime || "No preference"}`,
    `Project timeline: ${data.timeline || "Not specified"}`,
    data.notes ? `Notes: ${data.notes}` : null,
    `Reference: ${data.referenceId}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        _subject: `Pane & Simple measurement request: ${data.customerName}`,
        _replyto: data.customerEmail,
        _template: "table",
        message,
        product_summary: data.productSummary,
        estimate: `${money(data.totalLow)} – ${money(data.totalHigh)}`,
        preferred_days: data.preferredDays || "No preference",
        preferred_time: data.preferredTime || "No preference",
        project_timeline: data.timeline || "Not specified",
        reference_id: data.referenceId,
      }),
    });
    const body = await res.text();
    if (!res.ok) {
      failures.push(`formsubmit: ${res.status} ${body.slice(0, 120)}`);
      return false;
    }
    // FormSubmit returns { success: "..." } or { error: "..." }
    try {
      const parsed = JSON.parse(body) as { success?: string; error?: string };
      if (parsed.error) {
        failures.push(`formsubmit: ${parsed.error}`);
        return false;
      }
    } catch {
      // non-JSON success is still ok if status was 200
    }
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    failures.push(`formsubmit: ${msg}`);
    return false;
  }
}

async function dnsLooksResolvable(hostname: string): Promise<boolean> {
  // Deleted Supabase free projects stop resolving in DNS and throw ENOTFOUND.
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 3000);
    await fetch(`https://${hostname}/rest/v1/`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(t);
    // Any HTTP response (incl. 401/404) means the host is live.
    return true;
  } catch {
    return false;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
