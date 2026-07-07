"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/auth.store";
import { useCartStore } from "../../store/cart.store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCartStore();
  const { user, accessToken } = useAuthStore();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"review" | "payment">("review");

  const shipping = subtotal() >= 10000 ? 0 : 1500;
  const total = subtotal() - discount + shipping;

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    if (items.length === 0) { router.push("/"); return; }

    async function loadAddresses() {
      try {
        const res = await fetch(`${API}/users/me/addresses`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAddresses(data);
          const def = data.find((a: Address) => a.isDefault);
          if (def) setSelectedAddress(def.id);
          else if (data.length > 0) setSelectedAddress(data[0].id);
        }
      } catch {
        // ignore
      }
    }
    loadAddresses();
  }, [user, items, accessToken, router]);

  const handleCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await fetch(`${API}/coupons/${couponCode}/validate`);
      if (res.ok) {
        const data = await res.json();
        if (data.coupon.percentOff) {
          setDiscount(Math.floor(subtotal() * (data.coupon.percentOff / 100)));
          setCouponMsg(`${data.coupon.percentOff}% off applied!`);
        } else if (data.coupon.amountOff) {
          setDiscount(data.coupon.amountOff);
          setCouponMsg("Coupon applied!");
        }
      } else {
        const err = await res.json();
        setCouponMsg(err.error || "Invalid coupon");
      }
    } catch {
      setCouponMsg("Failed to validate coupon");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ addressId: selectedAddress, couponCode: couponCode || undefined }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create order");
        return;
      }

      const order = await res.json();
      setStep("payment");

      const piRes = await fetch(`${API}/payments/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (piRes.ok) {
        const { clientSecret } = await piRes.json();
        alert(`Order placed! Order #${order.orderNumber}\n\nPayment would be processed via Stripe.\n\nIn production, this opens the Stripe payment element.`);
        clear();
        router.push(`/account/orders`);
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-5xl px-gutter py-8">
        <h1 className="mb-8 font-display text-display">Checkout</h1>

        <div className="grid gap-12 lg:grid-cols-5">
          <div className="space-y-8 lg:col-span-3">
            <div className="glass rounded-xl2 p-6">
              <h2 className="mb-4 font-display text-xl">Shipping Address</h2>
              {addresses.length === 0 ? (
                <p className="text-sm text-zirios-gray-300">
                  No addresses saved.{" "}
                  <a href="/account/addresses" className="text-zirios-red hover:underline">
                    Add one here
                  </a>
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
                        selectedAddress === a.id ? "border-zirios-red" : "border-white/10"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === a.id}
                        onChange={() => setSelectedAddress(a.id)}
                        className="mt-1 accent-zirios-red"
                      />
                      <div>
                        <p className="font-medium">{a.label}</p>
                        <p className="text-sm text-zirios-gray-300">
                          {a.line1}, {a.city}, {a.state} {a.postal}, {a.country}
                        </p>
                        <p className="text-sm text-zirios-gray-500">{a.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="glass rounded-xl2 p-6">
              <h2 className="mb-4 font-display text-xl">Coupon Code</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm focus:border-zirios-red focus:outline-none"
                />
                <button onClick={handleCoupon} className="btn-primary">
                  Apply
                </button>
              </div>
              {couponMsg && <p className="mt-2 text-sm text-zirios-red">{couponMsg}</p>}
            </div>

            {step === "review" && (
              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress}
                className="btn-primary w-full text-lg py-4"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="glass rounded-xl2 p-6">
              <h2 className="mb-4 font-display text-xl">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-3">
                    <div className="h-16 w-14 flex-shrink-0 rounded-lg bg-zirios-gray-900" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-zirios-gray-300">{item.color} · {item.size} × {item.quantity}</p>
                    </div>
                    <p className="text-sm">${((item.price * item.quantity) / 100).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-white/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zirios-gray-300">Subtotal</span>
                  <span>${(subtotal() / 100).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-zirios-red">
                    <span>Discount</span>
                    <span>-${(discount / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zirios-gray-300">Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `$${(shipping / 100).toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>${(total / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
