import type { ProductType, AnyConfig, PriceBreakdown } from "./pricing";

const CART_KEY = "uwd_cart_v1";

export type CartItem = {
  id: string;
  productType: ProductType;
  config: AnyConfig;
  price: PriceBreakdown;
  qty: number;
  addedAt: number;
};

export type Cart = {
  items: CartItem[];
};

export type StoredCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
};

// ---------------- Cart ----------------

function read(): Cart {
  if (typeof window === "undefined") return { items: [] };
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return { items: [] };
  try {
    const parsed = JSON.parse(raw) as Cart;
    return parsed && Array.isArray(parsed.items) ? parsed : { items: [] };
  } catch {
    return { items: [] };
  }
}

function write(cart: Cart) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("uwd:cart"));
}

export function loadCart(): Cart {
  return read();
}

export function addToCart(item: Omit<CartItem, "id" | "addedAt" | "qty"> & { qty?: number }): CartItem {
  const cart = read();
  const newItem: CartItem = {
    id: crypto.randomUUID(),
    addedAt: Date.now(),
    qty: item.qty ?? 1,
    productType: item.productType,
    config: item.config,
    price: item.price,
  };
  cart.items.push(newItem);
  write(cart);
  return newItem;
}

export function updateQty(itemId: string, qty: number) {
  const cart = read();
  const it = cart.items.find((i) => i.id === itemId);
  if (!it) return;
  it.qty = Math.max(1, Math.min(99, Math.round(qty)));
  write(cart);
}

export function removeFromCart(itemId: string) {
  const cart = read();
  cart.items = cart.items.filter((i) => i.id !== itemId);
  write(cart);
}

export function clearCart() {
  write({ items: [] });
}

export function cartTotal(cart: Cart): number {
  return cart.items.reduce((s, i) => s + i.price.total * i.qty, 0);
}

export function cartCount(cart: Cart): number {
  return cart.items.reduce((s, i) => s + i.qty, 0);
}

// ---------------- Backwards-compat: single "current" item used by the configurator step ----------------

const CURRENT_KEY = "uwd_current_quote";

export type StoredQuote = {
  id?: string;
  productType: ProductType;
  config: AnyConfig;
  price: PriceBreakdown;
  customer?: StoredCustomer;
};

export function saveCurrentQuote(q: StoredQuote) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_KEY, JSON.stringify(q));
}

export function loadCurrentQuote(): StoredQuote | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CURRENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredQuote;
  } catch {
    return null;
  }
}

export function clearCurrentQuote() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_KEY);
}
