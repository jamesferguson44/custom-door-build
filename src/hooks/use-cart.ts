import { useEffect, useState } from "react";
import { loadCart, type Cart } from "@/lib/quote-storage";

export function useCart() {
  const [cart, setCart] = useState<Cart>({ items: [] });

  useEffect(() => {
    const sync = () => setCart(loadCart());
    sync();
    window.addEventListener("uwd:cart", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("uwd:cart", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return cart;
}
