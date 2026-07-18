/**
 * Reusable pricing calculator.
 *
 * Pure functions — no React, no UI, no I/O. Safe to import from any
 * component, server function, or test. All inputs/outputs are typed
 * and the breakdown is fully transparent for debugging or display.
 *
 * Pipeline:
 *   1. Snap width/height up to the nearest standard size increment.
 *   2. Compute square footage from the snapped width × height (inches).
 *   3. Look up the matching size bucket → base price.
 *   4. Apply brand tier multiplier (Good / Better / Best).
 *   5. Apply installation difficulty (labor multiplier + flat surcharge).
 *   6. Add selected add-ons (flat dollars or % of base price).
 *   7. Apply hidden 15% margin buffer to the subtotal.
 *   8. Round to the nearest dollar.
 */

import {
  ADDONS,
  BRAND_TIERS,
  INSTALL_DIFFICULTY,
  PRODUCT_PRICING,
  PRICING_GLOBALS,
  getSqftPrice,
  snapDimension,
  type AddOn,
  type BrandTier,
  type InstallDifficulty,
  type ProductKey,
} from "./pricing-config";

/** Hidden margin buffer applied on top of the subtotal. Not shown to users. */
export const HIDDEN_MARGIN = 0.15;

export type QuoteInput = {
  productType: ProductKey;
  width: number;            // inches
  height: number;           // inches
  tier: BrandTier;
  installation: InstallDifficulty;
  /** Add-on IDs from pricing-config.ADDONS. Unknown IDs are ignored. */
  addOnIds: string[];
  /** Optional quantity multiplier (defaults to 1). */
  quantity?: number;
};

export type LineItem = { label: string; amount: number };

export type QuoteBreakdown = {
  /** Customer-entered dimensions, unmodified. */
  rawWidth: number;
  rawHeight: number;
  /** Dimensions after snapping up to the nearest standard size increment. */
  snappedWidth: number;
  snappedHeight: number;
  squareFeet: number;
  /** Raw price-per-sqft × sqft from the matched bucket. */
  basePrice: number;
  bucketRate: number;
  /** Base price after tier multiplier. */
  tieredBase: number;
  tierMultiplier: number;
  /** Labor after install multiplier + flat surcharge. */
  laborTotal: number;
  baseLabor: number;
  installSurcharge: number;
  installLaborMultiplier: number;
  /** Add-on contributions, itemized. */
  addOnItems: LineItem[];
  addOnsTotal: number;
  /** Sum before the hidden margin buffer. */
  subtotal: number;
  /** Hidden 15% buffer (not displayed to customers). */
  marginBuffer: number;
  /** Per-unit total after rounding. */
  unitTotal: number;
  quantity: number;
  /** Final total = unitTotal × quantity. */
  total: number;
};

/**
 * Calculate a complete price breakdown from user selections.
 * Throws if `width` or `height` are non-positive.
 */
export function calculateQuote(input: QuoteInput): QuoteBreakdown {
  if (input.width <= 0 || input.height <= 0) {
    throw new Error("Width and height must be greater than zero.");
  }

  const product = PRODUCT_PRICING[input.productType];
  const tier = BRAND_TIERS[input.tier];
  const install = INSTALL_DIFFICULTY[input.installation];

  // 1. Snap to standard size increment, then compute square footage
  const snappedWidth = snapDimension(input.width, input.productType);
  const snappedHeight = snapDimension(input.height, input.productType);
  const squareFeet = (snappedWidth * snappedHeight) / 144;

  // 2. Size bucket → base price
  const basePrice = getSqftPrice(input.productType, squareFeet);
  const bucket =
    product.sizeBuckets.find((b) => squareFeet <= b.maxSqft) ??
    product.sizeBuckets[product.sizeBuckets.length - 1];

  // 3. Tier multiplier
  const tieredBase = basePrice * tier.multiplier;

  // 4. Installation adjustments (labor only)
  const baseLabor = product.baseLabor;
  const laborTotal = baseLabor * install.laborMultiplier + install.flatSurcharge;

  // 5. Add-ons (computed against tiered base for percent add-ons)
  const selected = resolveAddOns(input.addOnIds, input.productType);
  const addOnItems: LineItem[] = selected.map((a) => ({
    label: a.label,
    amount: a.kind === "flat" ? a.amount : tieredBase * a.amount,
  }));
  const addOnsTotal = addOnItems.reduce((sum, i) => sum + i.amount, 0);

  // 6. Subtotal + hidden margin
  const subtotal = tieredBase + laborTotal + addOnsTotal;
  const marginBuffer = subtotal * HIDDEN_MARGIN;
  const withMargin = subtotal + marginBuffer;

  // 7. Round per unit, then multiply by quantity
  const round = PRICING_GLOBALS.roundTo || 1;
  const unitTotal = Math.round(withMargin / round) * round;
  const quantity = Math.max(1, input.quantity ?? 1);
  const total = unitTotal * quantity;

  return {
    rawWidth: input.width,
    rawHeight: input.height,
    snappedWidth,
    snappedHeight,
    squareFeet,
    basePrice,
    bucketRate: bucket.pricePerSqft,
    tieredBase,
    tierMultiplier: tier.multiplier,
    laborTotal,
    baseLabor,
    installSurcharge: install.flatSurcharge,
    installLaborMultiplier: install.laborMultiplier,
    addOnItems,
    addOnsTotal,
    subtotal,
    marginBuffer,
    unitTotal,
    quantity,
    total,
  };
}

/** Resolve add-on IDs to AddOn records, filtered to the given product. */
export function resolveAddOns(ids: string[], product: ProductKey): AddOn[] {
  const set = new Set(ids);
  return ADDONS.filter(
    (a) => set.has(a.id) && (!a.appliesTo || a.appliesTo.includes(product)),
  );
}

/** Convenience: just the final dollar amount. */
export function calculateTotal(input: QuoteInput): number {
  return calculateQuote(input).total;
}