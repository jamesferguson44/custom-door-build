import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const verifyInput = z.object({ token: z.string() });

/**
 * Verifies a Cloudflare Turnstile token server-side. If TURNSTILE_SECRET_KEY
 * isn't configured yet, verification is treated as passed so the form still
 * works before Turnstile is set up — this is a spam deterrent, not a hard
 * requirement for launch.
 */
export const verifyTurnstile = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof verifyInput>) => verifyInput.parse(input))
  .handler(async ({ data }) => {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return { success: true as const, reason: "not_configured" as const };

    try {
      const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: data.token }),
      });
      const result = (await res.json()) as { success: boolean };
      return { success: result.success };
    } catch (err) {
      console.error("[turnstile-verify] Verification request failed:", err);
      return { success: false as const, reason: "verify_failed" as const };
    }
  });
