import {
  calculateQuote,
  type QuoteBreakdown,
} from "./price-calculator";
import type { BrandTier, InstallDifficulty } from "./pricing-config";

export type ProductType = "window" | "door" | "sliding_door";

export const WINDOW_STYLES = [
  "Picture",
  "Single Hung",
  "Double Hung",
  "Slider",
  "Casement",
  "Awning",
  "Specialty",
] as const;
export type WindowStyle = (typeof WINDOW_STYLES)[number];

export const PRODUCT_LINES = [
  "Good — AMSCO",
  "Better — ProVia",
  "Best — ProVia Aeris",
] as const;
export type ProductLine = (typeof PRODUCT_LINES)[number];

export type WindowConfig = {
  width: number | null;
  height: number | null;
  windowStyle: WindowStyle;
  productLine: ProductLine;
  glassType: "Standard" | "Low-E" | "Triple Pane";
  gridStyle: "None" | "Colonial" | "Prairie";
  color: "White" | "Black" | "Custom";
  customRequest?: string;
};

export type DoorConfig = {
  width: number | null;
  height: number | null;
  material: "Wood" | "Fiberglass" | "Steel";
  glassOption: "None" | "Half" | "Full";
  finish: "Painted" | "Stained";
  hardware: "Basic" | "Premium";
};

export type AnyConfig = WindowConfig | DoorConfig;

export const DEFAULT_WINDOW: WindowConfig = {
  width: null,
  height: null,
  windowStyle: "Single Hung",
  productLine: "Better — ProVia",
  glassType: "Standard",
  gridStyle: "None",
  color: "White",
  customRequest: "",
};

export const DEFAULT_DOOR: DoorConfig = {
  width: null,
  height: null,
  material: "Fiberglass",
  glassOption: "None",
  finish: "Painted",
  hardware: "Basic",
};

/* Map UI configurator options onto the centralized pricing system. */

const PRODUCT_LINE_TIER: Record<ProductLine, BrandTier> = {
  "Good — AMSCO": "Good",
  "Better — ProVia": "Better",
  "Best — ProVia Aeris": "Best",
};

const WINDOW_STYLE_MULTIPLIER: Record<WindowStyle, number> = {
  Picture: 0.9,
  "Single Hung": 1.0,
  "Double Hung": 1.1,
  Slider: 1.0,
  Casement: 1.2,
  Awning: 1.15,
  Specialty: 1.35,
};

const WINDOW_GLASS_ADDON: Record<WindowConfig["glassType"], string | null> = {
  Standard: null,
  "Low-E": "low-e",
  "Triple Pane": "triple-pane",
};

const WINDOW_GRID_ADDON: Record<WindowConfig["gridStyle"], string | null> = {
  None: null,
  Colonial: "grid-colonial",
  Prairie: "grid-prairie",
};

const DOOR_MATERIAL_TIER: Record<DoorConfig["material"], BrandTier> = {
  Steel: "Good",
  Fiberglass: "Better",
  Wood: "Best",
};

const DOOR_GLASS_ADDON: Record<DoorConfig["glassOption"], string | null> = {
  None: null,
  Half: "half-glass",
  Full: "full-glass",
};

export type PriceBreakdown = {
  squareFeet: number;
  baseRate: number;
  basePrice: number;
  addonsPrice: number;
  laborPrice: number;
  subtotal: number;
  margin: number;
  total: number;
  /** Low/high range for display (±8%). */
  low: number;
  high: number;
  addonItems: { label: string; amount: number }[];
  multipliers: { label: string; value: number }[];
};

/** Display spread around the calculated total (±8%). */
const RANGE_SPREAD = 0.08;

function toBreakdown(
  q: QuoteBreakdown,
  multipliers: { label: string; value: number }[],
): PriceBreakdown {
  const subtotal = q.tieredBase + q.laborTotal + q.addOnsTotal;
  return {
    squareFeet: q.squareFeet,
    baseRate: q.bucketRate,
    basePrice: q.tieredBase,
    addonsPrice: q.addOnsTotal,
    laborPrice: q.laborTotal,
    subtotal,
    margin: q.unitTotal - subtotal,
    total: q.unitTotal,
    low: Math.round((q.unitTotal * (1 - RANGE_SPREAD)) / 10) * 10,
    high: Math.round((q.unitTotal * (1 + RANGE_SPREAD)) / 10) * 10,
    addonItems: q.addOnItems.map((i) => ({ label: i.label, amount: Math.round(i.amount) })),
    multipliers,
  };
}

export function calculateWindow(c: WindowConfig): PriceBreakdown {
  if (!isValidSize(c.width, c.height)) return EMPTY_PRICE;
  const tier = PRODUCT_LINE_TIER[c.productLine];
  const styleMult = WINDOW_STYLE_MULTIPLIER[c.windowStyle];
  const addOnIds = [
    WINDOW_GLASS_ADDON[c.glassType],
    WINDOW_GRID_ADDON[c.gridStyle],
    c.color === "Custom" ? "custom-color" : null,
  ].filter((x): x is string => Boolean(x));

  const q = calculateQuote({
    productType: "window",
    width: c.width as number,
    height: c.height as number,
    tier,
    installation: "Standard",
    addOnIds,
  });

  const b = toBreakdown(q, [
    { label: `Product Line: ${c.productLine}`, value: q.tierMultiplier },
    { label: `Style: ${c.windowStyle}`, value: styleMult },
  ]);
  return scalePrice(b, styleMult);
}

function scalePrice(b: PriceBreakdown, m: number): PriceBreakdown {
  if (m === 1) return b;
  return {
    ...b,
    basePrice: Math.round(b.basePrice * m),
    addonsPrice: Math.round(b.addonsPrice * m),
    laborPrice: b.laborPrice,
    subtotal: Math.round(b.subtotal * m),
    margin: Math.round(b.margin * m),
    total: Math.round(b.total * m),
    low: Math.round((b.low * m) / 10) * 10,
    high: Math.round((b.high * m) / 10) * 10,
  };
}

export function calculateDoor(c: DoorConfig, isSliding = false): PriceBreakdown {
  if (!isValidSize(c.width, c.height)) return EMPTY_PRICE;
  const tier = DOOR_MATERIAL_TIER[c.material];
  const addOnIds = [
    DOOR_GLASS_ADDON[c.glassOption],
    !isSliding && c.finish === "Stained" ? "stained-finish" : null,
    c.hardware === "Premium" ? "premium-hardware" : null,
  ].filter((x): x is string => Boolean(x));

  const q = calculateQuote({
    productType: isSliding ? "sliding_door" : "door",
    width: c.width as number,
    height: c.height as number,
    tier,
    installation: "Standard",
    addOnIds,
  });

  return toBreakdown(q, [
    { label: `Material: ${c.material} (${tier})`, value: q.tierMultiplier },
  ]);
}

export function calculatePrice(type: ProductType, c: AnyConfig): PriceBreakdown {
  if (type === "window") return calculateWindow(c as WindowConfig);
  return calculateDoor(c as DoorConfig, type === "sliding_door");
}

export function isValidSize(width: number | null, height: number | null): boolean {
  if (width == null || height == null) return false;
  return width > 0 && height > 0 && width <= 240 && height <= 240;
}

const EMPTY_PRICE: PriceBreakdown = {
  squareFeet: 0,
  baseRate: 0,
  basePrice: 0,
  addonsPrice: 0,
  laborPrice: 0,
  subtotal: 0,
  margin: 0,
  total: 0,
  low: 0,
  high: 0,
  addonItems: [],
  multipliers: [],
};

export function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function productLabel(t: ProductType): string {
  return t === "window" ? "Window" : t === "door" ? "Exterior Door" : "Sliding Glass Door";
}

/**
 * Placeholder for future Shopify checkout integration.
 * Will eventually post the configured product + total to Shopify's
 * Storefront API to create a checkout session.
 */
export async function sendToShopifyCheckout(payload: {
  productType: ProductType;
  config: AnyConfig;
  price: PriceBreakdown;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}): Promise<{ checkoutUrl: string }> {
  // TODO: integrate Shopify Storefront API
  console.log("[sendToShopifyCheckout] payload", payload);
  return { checkoutUrl: "#shopify-checkout-pending" };
}