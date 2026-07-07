"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/auth.store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface Analytics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  ordersByStatus: { status: string; _count: number }[];
  topSelling: { product: { name: string; slug: string; basePrice: number } | null; totalSold: number }[];
  recentOrders: { id: string; orderNumber: string; total: number; status: string; createdAt: string; user: { name: string; email: string }; _count: { items: number } }[];
}

interface InventoryItem {
  id: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  priceDelta: number;
  product: { name: string; slug: string };
}

export default function AdminPage() {
  const { user, accessToken, isLoading } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState<"dashboard" | "inventory">("dashboard");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN"))) {
      router.push("/");
    }
    if (user && (user.role === "ADMIN" || user.role === "SUPERADMIN")) {
      loadData();
    }
  }, [user, isLoading, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, inventoryRes] = await Promise.all([
        fetch(`${API}/admin/analytics`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch(`${API}/admin/inventory`, { headers: { Authorization: `Bearer ${accessToken}` } }),
      ]);
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (inventoryRes.ok) {
        const data = await inventoryRes.json();
        setInventory(data.variants);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id: string, stock: number) => {
    try {
      const res = await fetch(`${API}/admin/inventory/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ stock }),
      });
      if (res.ok) loadData();
    } catch {
      // ignore
    }
  };

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-7xl px-gutter py-8">
        <h1 className="mb-8 font-display text-display">Admin Dashboard</h1>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTab("dashboard")}
            className={`rounded-full px-6 py-2 text-sm transition-colors ${tab === "dashboard" ? "bg-zirios-red text-white" : "border border-white/10 text-zirios-gray-300"}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setTab("inventory")}
            className={`rounded-full px-6 py-2 text-sm transition-colors ${tab === "inventory" ? "bg-zirios-red text-white" : "border border-white/10 text-zirios-gray-300"}`}
          >
            Inventory
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zirios-red border-t-transparent" />
          </div>
        ) : tab === "dashboard" && analytics ? (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="glass rounded-xl2 p-6">
                <p className="text-sm text-zirios-gray-500">Total Revenue</p>
                <p className="mt-2 text-2xl font-bold">${(analytics.totalRevenue / 100).toLocaleString()}</p>
              </div>
              <div className="glass rounded-xl2 p-6">
                <p className="text-sm text-zirios-gray-500">Monthly Revenue</p>
                <p className="mt-2 text-2xl font-bold">${(analytics.monthlyRevenue / 100).toLocaleString()}</p>
              </div>
              <div className="glass rounded-xl2 p-6">
                <p className="text-sm text-zirios-gray-500">Total Orders</p>
                <p className="mt-2 text-2xl font-bold">{analytics.totalOrders}</p>
              </div>
              <div className="glass rounded-xl2 p-6">
                <p className="text-sm text-zirios-gray-500">Total Customers</p>
                <p className="mt-2 text-2xl font-bold">{analytics.totalUsers}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="glass rounded-xl2 p-6">
                <h2 className="mb-4 font-display text-xl">Orders by Status</h2>
                <div className="space-y-3">
                  {analytics.ordersByStatus.map((s) => (
                    <div key={s.status} className="flex items-center justify-between">
                      <span className="text-sm text-zirios-gray-300">{s.status}</span>
                      <span className="font-bold">{s._count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-xl2 p-6">
                <h2 className="mb-4 font-display text-xl">Top Selling Products</h2>
                <div className="space-y-3">
                  {analytics.topSelling.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-zirios-gray-300">
                        {item.product?.name || "Unknown"} — {item.totalSold} sold
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass rounded-xl2 p-6">
              <h2 className="mb-4 font-display text-xl">Recent Orders</h2>
              <div className="space-y-4">
                {analytics.recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{o.orderNumber}</p>
                      <p className="text-xs text-zirios-gray-500">{o.user.name} · {o._count.items} items</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">${(o.total / 100).toFixed(2)}</p>
                      <span className="text-xs text-zirios-gray-500">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : tab === "inventory" ? (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="glass rounded-xl2 p-6">
                <h2 className="mb-2 font-display text-xl">Low Stock ({inventory.filter((v) => v.stock > 0 && v.stock <= 5).length})</h2>
                <p className="text-sm text-zirios-gray-500">Items running low</p>
              </div>
              <div className="glass rounded-xl2 p-6">
                <h2 className="mb-2 font-display text-xl">Out of Stock ({inventory.filter((v) => v.stock === 0).length})</h2>
                <p className="text-sm text-zirios-gray-500">Items needing restock</p>
              </div>
            </div>

            <div className="glass rounded-xl2 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-zirios-gray-500">
                      <th className="p-4 font-medium">Product</th>
                      <th className="p-4 font-medium">SKU</th>
                      <th className="p-4 font-medium">Size</th>
                      <th className="p-4 font-medium">Color</th>
                      <th className="p-4 font-medium">Stock</th>
                      <th className="p-4 font-medium">Price Delta</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((v) => (
                      <tr key={v.id} className="border-b border-white/5 last:border-0">
                        <td className="p-4 font-medium">{v.product.name}</td>
                        <td className="p-4 text-zirios-gray-300">{v.sku}</td>
                        <td className="p-4">{v.size}</td>
                        <td className="p-4">{v.color}</td>
                        <td className={`p-4 font-medium ${v.stock === 0 ? "text-zirios-red" : v.stock <= 5 ? "text-yellow-400" : ""}`}>
                          {v.stock}
                        </td>
                        <td className="p-4 text-zirios-gray-300">${(v.priceDelta / 100).toFixed(2)}</td>
                        <td className="p-4">
                          <input
                            type="number"
                            min={0}
                            defaultValue={v.stock}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value);
                              if (val !== v.stock) updateStock(v.id, val);
                            }}
                            className="w-20 rounded border border-white/10 bg-transparent px-3 py-1 text-center focus:border-zirios-red focus:outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
