"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ProductCard } from "../../components/product/ProductCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface ProductHit {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  media: { url: string }[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [input, setInput] = useState(query);
  const [results, setResults] = useState<ProductHit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`${API}/products?search=${encodeURIComponent(query)}&limit=48`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(() => {
        // ignore
      })
      .finally(() => setLoading(false));
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      router.push(`/search?q=${encodeURIComponent(input.trim())}`);
    }
  };

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-7xl px-gutter py-8">
        <h1 className="mb-8 font-display text-display">Search</h1>

        <form onSubmit={handleSearch} className="mb-12">
          <div className="glass mx-auto flex max-w-2xl items-center gap-4 rounded-full px-6 py-4">
            <Search size={20} className="text-zirios-gray-300" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent text-lg text-zirios-white placeholder:text-zirios-gray-500 focus:outline-none"
              autoFocus
            />
            <button type="submit" className="btn-primary text-sm">
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zirios-red border-t-transparent" />
          </div>
        ) : query ? (
          <>
            <p className="mb-6 text-sm text-zirios-gray-500">
              {total} result{total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
            </p>
            {results.length === 0 ? (
              <p className="py-20 text-center text-zirios-gray-300">No products found.</p>
            ) : (
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {results.map((p) => (
                  <ProductCard
                    key={p.id}
                    slug={p.slug}
                    name={p.name}
                    price={p.basePrice}
                    image={p.media?.[0]?.url || ""}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="py-20 text-center text-zirios-gray-500">Enter a search term to find products.</p>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-zirios-red border-t-transparent" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
