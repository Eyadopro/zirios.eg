"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/auth.store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  items: { quantity: number; price: number; product: { name: string; slug: string }; variant: { size: string; color: string } }[];
  payment: { status: string } | null;
}

export default function OrdersPage() {
  const { user, accessToken, isLoading } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !isLoading) { router.push("/auth/login"); return; }
    if (!user) return;

    async function load() {
      try {
        const res = await fetch(`${API}/orders`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.items);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, accessToken, isLoading, router]);

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-4xl px-gutter py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-display">My Orders</h1>
          <a href="/account" className="text-sm text-zirios-gray-300 hover:text-zirios-red">Back to Account</a>
        </div>

        <div className="md:hidden mb-8">
          <nav className="flex gap-2 overflow-x-auto">
            {[
              { href: "/account", label: "Profile" },
              { href: "/account/orders", label: "Orders" },
              { href: "/account/addresses", label: "Addresses" },
              { href: "/account/wishlist", label: "Wishlist" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm ${
                  link.href === "/account/orders" ? "bg-zirios-red/10 text-zirios-red" : "text-zirios-gray-300 bg-white/5"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zirios-red border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="glass rounded-xl2 p-12 text-center">
            <p className="text-zirios-gray-300">No orders yet.</p>
            <a href="/" className="mt-4 btn-primary inline-block">Start Shopping</a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="glass rounded-xl2 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-zirios-gray-500">Order #{order.orderNumber}</p>
                    <p className="text-xs text-zirios-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      order.status === "DELIVERED" ? "bg-green-500/10 text-green-400" :
                      order.status === "CANCELLED" || order.status === "REFUNDED" ? "bg-red-500/10 text-red-400" :
                      "bg-zirios-red/10 text-zirios-red"
                    }`}>
                      {order.status}
                    </span>
                    <p className="mt-1 font-bold">${(order.total / 100).toFixed(2)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="h-10 w-10 rounded bg-zirios-gray-900" />
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-zirios-gray-500">{item.variant.color} · {item.variant.size} × {item.quantity}</p>
                      </div>
                      <p>${((item.price * item.quantity) / 100).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
