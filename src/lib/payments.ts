/**
 * Payment abstraction layer.
 *
 * Currently uses a mock provider for the $150 measurement deposit.
 * Swap `mockProvider` for a real Stripe / Paddle implementation later
 * without changing any UI code.
 */

export const MEASUREMENT_DEPOSIT_USD = 150;

export type DepositPayload = {
  amount: number;
  currency: "USD";
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  metadata?: Record<string, string>;
};

export type DepositResult = {
  ok: true;
  transactionId: string;
  provider: string;
  amount: number;
} | {
  ok: false;
  error: string;
};

export interface PaymentProvider {
  name: string;
  chargeDeposit(payload: DepositPayload): Promise<DepositResult>;
}

/** Mock provider — simulates a successful charge after a short delay. */
const mockProvider: PaymentProvider = {
  name: "mock",
  async chargeDeposit(payload) {
    await new Promise((r) => setTimeout(r, 900));
    console.log("[mock-payment] charged", payload);
    return {
      ok: true,
      provider: "mock",
      amount: payload.amount,
      transactionId: `mock_${Date.now().toString(36)}`,
    };
  },
};

/**
 * Single export consumed by the UI. Replace the assignment below to wire up
 * a real provider (e.g. Stripe Checkout / Paddle) without touching callers.
 */
export const paymentProvider: PaymentProvider = mockProvider;

export async function chargeMeasurementDeposit(
  customer: DepositPayload["customer"],
  metadata?: Record<string, string>,
): Promise<DepositResult> {
  return paymentProvider.chargeDeposit({
    amount: MEASUREMENT_DEPOSIT_USD,
    currency: "USD",
    customer,
    metadata,
  });
}