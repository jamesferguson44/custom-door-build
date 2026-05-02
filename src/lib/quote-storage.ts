import type { ProductType, AnyConfig, PriceBreakdown } from "./pricing";

const KEY = "uwd_current_quote";

export type StoredQuote = {
  id?: string;
  productType: ProductType;
  config: AnyConfig;
  price: PriceBreakdown;
  customer?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    notes?: string;
  };
};

export function saveCurrentQuote(q: StoredQuote) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function loadCurrentQuote(): StoredQuote | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredQuote;
  } catch {
    return null;
  }
}

export function clearCurrentQuote() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}