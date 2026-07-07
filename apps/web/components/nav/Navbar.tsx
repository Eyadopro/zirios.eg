"use client";

import { Heart, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/auth.store";
import { useCartStore } from "../../store/cart.store";
import { useWishlistStore } from "../../store/wishlist.store";

const LINKS = ["Shoes", "Women", "Men", "Home"];

function CountBadge({ count, label }: { count: number; label: string }) {
  return (
    <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-zirios-red text-[11px] font-bold text-white shadow-glow transition-transform hover:scale-110">
      {count}
    </span>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { user } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/5 transition-all duration-500 ease-apple-ease ${
        scrolled ? "glass py-3" : "bg-black/80 py-4"
      }`}
    >
      <nav className="flex items-center gap-6 px-gutter">
        <div className="flex items-center gap-2">
          <Link href={user ? "/account/wishlist" : "/auth/login"} aria-label="Wishlist">
            <CountBadge count={wishlistCount} label="Wishlist" />
          </Link>
          <button onClick={() => useCartStore.getState().open()} aria-label="Cart">
            <CountBadge count={itemCount} label="Cart" />
          </button>
        </div>

        <ul className="hidden gap-6 md:flex">
          {LINKS.map((link) => (
            <li key={link}>
              <Link
                href={link === "Home" ? "/" : `/${link.toLowerCase()}`}
                className="text-sm font-semibold uppercase tracking-wide text-zirios-white transition-colors hover:text-zirios-red"
              >
                {link}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/collections/featured"
              className="text-sm font-semibold uppercase tracking-wide text-zirios-red transition-colors hover:text-zirios-white"
            >
              Drops
            </Link>
          </li>
        </ul>

        <div className="mx-auto hidden max-w-xl flex-1 md:block">
          <form onSubmit={handleSearch}>
            <div className="glass flex items-center gap-3 rounded-full px-5 py-2.5">
              <Search size={16} className="text-zirios-gray-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH ZIRIOS (e.g. Runner, Hoodie, Titan)"
                className="w-full bg-transparent text-xs uppercase tracking-wide text-zirios-gray-300 placeholder:text-zirios-gray-500 focus:outline-none"
              />
            </div>
          </form>
        </div>

        <div className="ml-auto flex items-center gap-5">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
            className="magnetic hover:text-zirios-red md:hidden"
          >
            <Search size={18} />
          </button>
          <Link
            href={user ? "/account" : "/auth/login"}
            aria-label="Account"
            className="magnetic hover:text-zirios-red"
          >
            <User size={18} />
          </Link>
          <Link
            href="/"
            className="font-display text-2xl font-bold tracking-[0.15em] text-zirios-red"
          >
            ZIRIOS
          </Link>
        </div>
      </nav>

      {searchOpen && (
        <div className="md:hidden px-gutter pt-4">
          <form onSubmit={handleSearch}>
            <div className="glass flex items-center gap-3 rounded-full px-5 py-2.5">
              <Search size={16} className="text-zirios-gray-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-sm text-zirios-white placeholder:text-zirios-gray-500 focus:outline-none"
                autoFocus
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
