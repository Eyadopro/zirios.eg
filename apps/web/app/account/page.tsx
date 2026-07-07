"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/auth.store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default function AccountPage() {
  const { user, accessToken, logout, isLoading } = useAuthStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user && !isLoading) router.push("/auth/login");
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user, isLoading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`${API}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ name, email }),
      });
      if (res.ok) {
        const updated = await res.json();
        useAuthStore.getState().setUser(updated);
        setMsg("Profile updated");
      } else {
        const err = await res.json();
        setMsg(err.error || "Failed to update");
      }
    } catch {
      setMsg("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-4xl px-gutter py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-display">My Account</h1>
          <button onClick={handleLogout} className="text-sm text-zirios-gray-300 hover:text-zirios-red">
            Logout
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          <nav className="space-y-2 md:col-span-1">
            {[
              { href: "/account", label: "Profile" },
              { href: "/account/orders", label: "Orders" },
              { href: "/account/addresses", label: "Addresses" },
              { href: "/account/wishlist", label: "Wishlist" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`block rounded-lg px-4 py-3 text-sm transition-colors ${
                  link.href === "/account" ? "bg-zirios-red/10 text-zirios-red" : "text-zirios-gray-300 hover:bg-white/5"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="md:col-span-3">
            <div className="glass rounded-xl2 p-8">
              <h2 className="mb-6 font-display text-2xl">Profile</h2>

              {msg && (
                <div className={`mb-6 rounded-lg p-4 text-sm ${
                  msg === "Profile updated" ? "bg-green-500/10 text-green-400" : "bg-zirios-red/10 text-zirios-red"
                }`}>
                  {msg}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-5 max-w-md">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wider text-zirios-gray-500">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm focus:border-zirios-red focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wider text-zirios-gray-500">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm focus:border-zirios-red focus:outline-none"
                    required
                  />
                </div>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
