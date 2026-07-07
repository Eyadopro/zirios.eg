"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/auth.store";
import { useWishlistStore } from "../../../store/wishlist.store";

export default function WishlistPage() {
  const { user, accessToken, isLoading } = useAuthStore();
  const { items, fetch, remove } = useWishlistStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !isLoading) { router.push("/auth/login"); return; }
    if (!user || !accessToken) return;
    fetch(accessToken).then(() => setLoading(false));
  }, [user, accessToken, isLoading, router, fetch]);

  const handleRemove = async (id: string) => {
    if (!accessToken) return;
    await remove(accessToken, id);
  };

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-4xl px-gutter py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-display">My Wishlist</h1>
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
                  link.href === "/account/wishlist" ? "bg-zirios-red/10 text-zirios-red" : "text-zirios-gray-300 bg-white/5"
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
        ) : items.length === 0 ? (
          <div className="glass rounded-xl2 p-12 text-center">
            <p className="text-zirios-gray-300">Your wishlist is empty.</p>
            <a href="/" className="mt-4 btn-primary inline-block">Discover Products</a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="group relative">
                <a href={`/products/${item.product.slug}`} className="block">
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-xl2 bg-zirios-gray-900">
                    <img
                      src={item.product.media?.[0]?.url || ""}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="mt-3">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-zirios-gray-300">${(item.product.basePrice / 100).toFixed(2)}</p>
                  </div>
                </a>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-2 text-zirios-red opacity-0 backdrop-blur-glass transition-opacity group-hover:opacity-100"
                >
                  <Heart size={16} className="fill-zirios-red" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
