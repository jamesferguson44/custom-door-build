/**
 * Centralized pricing configuration for Pane & Simple.
 *
 * Edit this file to update prices, tiers, add-ons, and labor adjustments
 * without touching UI or calculation code. The pricing engine in
 * `src/lib/pricing.ts` consumes these values.
 *
 * Conventions:
 *  - All linear sizes in INCHES.
 *  - Square footage = (width * height) / 144.
 *  - "flat" add-ons = fixed dollars added to subtotal.
 *  - "percent" add-ons = fraction of base price (0.05 = +5%).
 *  - Bucket `maxSqft` is inclusive; the last bucket should be Infinity.
 */

export type ProductKey = "window" | "door" | "sliding_door";
export type BrandTier = "Good" | "Better" | "Best";
export type InstallDifficulty = "Standard" | "Retrofit" | "FullFrame" | "SecondStory";

export type SizeBucket = {
  /** Inclusive upper bound in square feet. Use Infinity for the last bucket. */
  maxSqft: number;
  /** Dollars per square foot for this bucket. */
  pricePerSqft: number;
  /** Optional flat minimum charge for the bucket. */
  minPrice?: number;
};

export type AddOn = {
  id: string;
  label: string;
  /** "flat" = dollars; "percent" = fraction of base price. */
  kind: "flat" | "percent";
  amount: number;
  /** Restricts the add-on to specific products. Omit = all products. */
  appliesTo?: ProductKey[];
};

export type ProductPricing = {
  /** Size-based price-per-sqft buckets, evaluated in order. */
  sizeBuckets: SizeBucket[];
  /** Flat labor cost per unit before difficulty adjustment. */
  baseLabor: number;
};

/* -------------------------------------------------------------------------- */
/*                            Size-based pricing                              */
/* -------------------------------------------------------------------------- */

export const PRODUCT_PRICING: Record<ProductKey, ProductPricing> = {
  window: {
    sizeBuckets: [
      { maxSqft: 6, pricePerSqft: 45, minPrice: 220 },
      { maxSqft: 12, pricePerSqft: 38 },
      { maxSqft: 20, pricePerSqft: 34 },
      { maxSqft: Infinity, pricePerSqft: 30 },
    ],
    baseLabor: 250,
  },
  door: {
    sizeBuckets: [
      { maxSqft: 18, pricePerSqft: 55, minPrice: 850 },
      { maxSqft: 24, pricePerSqft: 48 },
      { maxSqft: Infinity, pricePerSqft: 42 },
    ],
    baseLabor: 400,
  },
  sliding_door: {
    sizeBuckets: [
      { maxSqft: 35, pricePerSqft: 60, minPrice: 1400 },
      { maxSqft: 55, pricePerSqft: 52 },
      { maxSqft: Infinity, pricePerSqft: 46 },
    ],
    baseLabor: 550,
  },
};

/* -------------------------------------------------------------------------- */
/*                            Brand tier multipliers                          */
/* -------------------------------------------------------------------------- */

export const BRAND_TIERS: Record<BrandTier, { multiplier: number; description: string }> = {
  Good: { multiplier: 1.0, description: "Reliable builder-grade quality" },
  Better: { multiplier: 1.25, description: "Energy-efficient mid-tier brands" },
  Best: { multiplier: 1.6, description: "Premium brands with lifetime warranty" },
};

/* -------------------------------------------------------------------------- */
/*                       Installation difficulty adjustments                  */
/* -------------------------------------------------------------------------- */

export const INSTALL_DIFFICULTY: Record<
  InstallDifficulty,
  { laborMultiplier: number; flatSurcharge: number; description: string }
> = {
  Standard:    { laborMultiplier: 1.0, flatSurcharge: 0,   description: "Ground level, easy access" },
  Retrofit:    { laborMultiplier: 1.1, flatSurcharge: 0,   description: "Insert into existing frame" },
  FullFrame:   { laborMultiplier: 1.35, flatSurcharge: 200, description: "Complete tear-out & rebuild" },
  SecondStory: { laborMultiplier: 1.5, flatSurcharge: 150, description: "Upper floor / scaffolding required" },
};

/* -------------------------------------------------------------------------- */
/*                                  Add-ons                                   */
/* -------------------------------------------------------------------------- */

export const ADDONS: AddOn[] = [
  // Windows
  { id: "grid-colonial",   label: "Colonial Grid",      kind: "flat",    amount: 75,   appliesTo: ["window"] },
  { id: "grid-prairie",    label: "Prairie Grid",       kind: "flat",    amount: 95,   appliesTo: ["window"] },
  { id: "low-e",           label: "Low-E Glass",        kind: "percent", amount: 0.12, appliesTo: ["window", "sliding_door"] },
  { id: "triple-pane",     label: "Triple Pane Glass",  kind: "percent", amount: 0.22, appliesTo: ["window", "sliding_door"] },
  { id: "custom-color",    label: "Custom Color",       kind: "flat",    amount: 150 },

  // Doors
  { id: "half-glass",      label: "Half Glass Insert",  kind: "flat",    amount: 180, appliesTo: ["door"] },
  { id: "full-glass",      label: "Full Glass Insert",  kind: "flat",    amount: 320, appliesTo: ["door"] },
  { id: "stained-finish",  label: "Stained Finish",     kind: "flat",    amount: 100, appliesTo: ["door"] },
  { id: "premium-hardware",label: "Premium Hardware",   kind: "flat",    amount: 120, appliesTo: ["door", "sliding_door"] },
  { id: "smart-lock",      label: "Smart Lock",         kind: "flat",    amount: 280, appliesTo: ["door"] },

  // Sliding doors
  { id: "screen-door",     label: "Screen Door",        kind: "flat",    amount: 140, appliesTo: ["sliding_door"] },
  { id: "blinds-between",  label: "Blinds Between Glass", kind: "flat",  amount: 320, appliesTo: ["sliding_door"] },
];

/* -------------------------------------------------------------------------- */
/*                                Global config                               */
/* -------------------------------------------------------------------------- */

export const PRICING_GLOBALS = {
  /** Service & warranty margin applied to subtotal (0.20 = +20%). */
  marginRate: 0.2,
  /** Round final total to nearest dollar increment. */
  roundTo: 1,
  /** Currency for display. */
  currency: "USD" as const,
};

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

export function getSqftPrice(product: ProductKey, sqft: number): number {
  const buckets = PRODUCT_PRICING[product].sizeBuckets;
  const bucket = buckets.find((b) => sqft <= b.maxSqft) ?? buckets[buckets.length - 1];
  const price = sqft * bucket.pricePerSqft;
  return bucket.minPrice ? Math.max(price, bucket.minPrice) : price;
}

export function getAddonsFor(product: ProductKey): AddOn[] {
  return ADDONS.filter((a) => !a.appliesTo || a.appliesTo.includes(product));
}