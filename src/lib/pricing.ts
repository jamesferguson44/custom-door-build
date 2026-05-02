export type ProductType = "window" | "door" | "sliding_door";

export type WindowConfig = {
  width: number;
  height: number;
  frameMaterial: "Vinyl" | "Fiberglass" | "Aluminum";
  glassType: "Standard" | "Low-E" | "Triple Pane";
  gridStyle: "None" | "Colonial" | "Prairie";
  color: "White" | "Black" | "Custom";
  installation: "Retrofit" | "Full Frame";
};

export type DoorConfig = {
  width: number;
  height: number;
  material: "Wood" | "Fiberglass" | "Steel";
  glassOption: "None" | "Half" | "Full";
  finish: "Painted" | "Stained";
  hardware: "Basic" | "Premium";
};

export type AnyConfig = WindowConfig | DoorConfig;

export const DEFAULT_WINDOW: WindowConfig = {
  width: 36,
  height: 48,
  frameMaterial: "Vinyl",
  glassType: "Standard",
  gridStyle: "None",
  color: "White",
  installation: "Retrofit",
};

export const DEFAULT_DOOR: DoorConfig = {
  width: 36,
  height: 80,
  material: "Fiberglass",
  glassOption: "None",
  finish: "Painted",
  hardware: "Basic",
};

const FRAME_MULT: Record<WindowConfig["frameMaterial"], number> = {
  Vinyl: 1.0,
  Fiberglass: 1.25,
  Aluminum: 1.15,
};

const GLASS_MULT: Record<WindowConfig["glassType"], number> = {
  Standard: 1.0,
  "Low-E": 1.2,
  "Triple Pane": 1.4,
};

const DOOR_MATERIAL_MULT: Record<DoorConfig["material"], number> = {
  Wood: 1.2,
  Fiberglass: 1.15,
  Steel: 1.0,
};

export type PriceBreakdown = {
  squareFeet: number;
  basePrice: number;
  addonsPrice: number;
  laborPrice: number;
  subtotal: number;
  margin: number;
  total: number;
  addonItems: { label: string; amount: number }[];
};

export function calculateWindow(c: WindowConfig): PriceBreakdown {
  const sqft = (c.width * c.height) / 144;
  const base = sqft * 35 * FRAME_MULT[c.frameMaterial] * GLASS_MULT[c.glassType];

  const addonItems: { label: string; amount: number }[] = [];
  if (c.gridStyle !== "None") addonItems.push({ label: `Grid: ${c.gridStyle}`, amount: 75 });
  if (c.color === "Custom") addonItems.push({ label: "Custom Color", amount: 150 });
  if (c.installation === "Full Frame")
    addonItems.push({ label: "Full Frame Install", amount: 200 });

  const addonsPrice = addonItems.reduce((s, a) => s + a.amount, 0);
  const laborPrice = 250;
  const subtotal = base + addonsPrice + laborPrice;
  const total = Math.round(subtotal * 1.2);
  return {
    squareFeet: sqft,
    basePrice: base,
    addonsPrice,
    laborPrice,
    subtotal,
    margin: total - subtotal,
    total,
    addonItems,
  };
}

export function calculateDoor(c: DoorConfig, isSliding = false): PriceBreakdown {
  const sqft = (c.width * c.height) / 144;
  const baseRate = isSliding ? 50 : 45;
  const base = sqft * baseRate * DOOR_MATERIAL_MULT[c.material];

  const addonItems: { label: string; amount: number }[] = [];
  if (c.glassOption === "Half") addonItems.push({ label: "Half Glass", amount: 180 });
  if (c.glassOption === "Full") addonItems.push({ label: "Full Glass", amount: 320 });
  if (c.finish === "Stained") addonItems.push({ label: "Stained Finish", amount: 100 });
  if (c.hardware === "Premium") addonItems.push({ label: "Premium Hardware", amount: 120 });

  const addonsPrice = addonItems.reduce((s, a) => s + a.amount, 0);
  const laborPrice = 400;
  const subtotal = base + addonsPrice + laborPrice;
  const total = Math.round(subtotal * 1.2);
  return {
    squareFeet: sqft,
    basePrice: base,
    addonsPrice,
    laborPrice,
    subtotal,
    margin: total - subtotal,
    total,
    addonItems,
  };
}

export function calculatePrice(type: ProductType, c: AnyConfig): PriceBreakdown {
  if (type === "window") return calculateWindow(c as WindowConfig);
  return calculateDoor(c as DoorConfig, type === "sliding_door");
}

export function isValidSize(width: number, height: number): boolean {
  return width > 0 && height > 0 && width <= 240 && height <= 240;
}

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