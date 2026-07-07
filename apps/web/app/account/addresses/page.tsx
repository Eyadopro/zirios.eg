"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/auth.store";

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

export default function AddressesPage() {
  const { user, accessToken, isLoading } = useAuthStore();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", line1: "", line2: "", city: "", state: "", postal: "", country: "US", phone: "", isDefault: false });

  useEffect(() => {
    if (!user && !isLoading) { router.push("/auth/login"); return; }
    if (!user) return;
    loadAddresses();
  }, [user, isLoading, router]);

  const loadAddresses = async () => {
    try {
      const res = await fetch(`${API}/users/me/addresses`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) setAddresses(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/users/me/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ label: "", line1: "", line2: "", city: "", state: "", postal: "", country: "US", phone: "", isDefault: false });
        loadAddresses();
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API}/users/me/addresses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      loadAddresses();
    } catch {
      // ignore
    }
  };

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-4xl px-gutter py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-display">My Addresses</h1>
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
                  link.href === "/account/addresses" ? "bg-zirios-red/10 text-zirios-red" : "text-zirios-gray-300 bg-white/5"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="btn-primary mb-6">
          {showForm ? "Cancel" : "Add Address"}
        </button>

        {showForm && (
          <div className="glass rounded-xl2 p-6 mb-8">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-zirios-gray-500">Label</label>
                <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm focus:border-zirios-red focus:outline-none" placeholder="Home / Work" required />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-zirios-gray-500">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm focus:border-zirios-red focus:outline-none" required />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs uppercase tracking-wider text-zirios-gray-500">Address Line 1</label>
                <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm focus:border-zirios-red focus:outline-none" required />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs uppercase tracking-wider text-zirios-gray-500">Address Line 2</label>
                <input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm focus:border-zirios-red focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-zirios-gray-500">City</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm focus:border-zirios-red focus:outline-none" required />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-zirios-gray-500">State</label>
                <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm focus:border-zirios-red focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-zirios-gray-500">Postal Code</label>
                <input value={form.postal} onChange={(e) => setForm({ ...form, postal: e.target.value })} className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm focus:border-zirios-red focus:outline-none" required />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-zirios-gray-500">Country</label>
                <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm focus:border-zirios-red focus:outline-none" required />
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="accent-zirios-red" />
                <label className="text-sm">Set as default address</label>
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="btn-primary">Save Address</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zirios-red border-t-transparent" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="glass rounded-xl2 p-12 text-center">
            <p className="text-zirios-gray-300">No addresses saved.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((a) => (
              <div key={a.id} className="glass rounded-xl2 p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{a.label}</p>
                    {a.isDefault && <span className="text-xs text-zirios-red">Default</span>}
                  </div>
                  <button onClick={() => handleDelete(a.id)} className="text-xs text-zirios-gray-500 hover:text-zirios-red">Delete</button>
                </div>
                <p className="text-sm text-zirios-gray-300">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                <p className="text-sm text-zirios-gray-300">{a.city}{a.state ? `, ${a.state}` : ""} {a.postal}</p>
                <p className="text-sm text-zirios-gray-300">{a.country}</p>
                <p className="text-sm text-zirios-gray-500">{a.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
