"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useCartStore } from "../../store/cart.store";

export function CartDrawer() {
  const { items, isOpen, close, remove, setQuantity, subtotal } = useCartStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelRef.current) return;
    gsap.to(panelRef.current, {
      x: isOpen ? "0%" : "100%",
      duration: 0.6,
      ease: "power4.out",
    });
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-[60] ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={panelRef}
        className="glass absolute right-0 top-0 flex h-full w-full max-w-md translate-x-full flex-col p-8"
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-2xl">Your Bag</h2>
          <button onClick={close} aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto">
          {items.length === 0 && <p className="text-zirios-gray-300">Your bag is empty.</p>}

          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4">
              <div className="h-24 w-20 flex-shrink-0 rounded-lg bg-zirios-gray-900" />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-zirios-gray-300">
                  {item.color} · {item.size}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => setQuantity(item.variantId, Number(e.target.value))}
                    className="w-14 rounded bg-zirios-gray-900 px-2 py-1 text-center"
                  />
                  <button
                    onClick={() => remove(item.variantId)}
                    className="text-xs text-zirios-gray-300 hover:text-zirios-red"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="font-medium">${((item.price * item.quantity) / 100).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-white/10 pt-6">
          <div className="mb-4 flex justify-between text-lg">
            <span>Subtotal</span>
            <span>${(subtotal() / 100).toFixed(2)}</span>
          </div>
          <a href="/checkout" className="btn-primary w-full">
            Checkout
          </a>
        </div>
      </div>
    </div>
  );
}
