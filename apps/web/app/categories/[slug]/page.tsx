"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductCard } from "../../../components/product/ProductCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
  products: { id: string; name: string; slug: string; basePrice: number; media: { url: string }[] }[];
  _count: { products: number };
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API}/categories/${slug}`);
        if (res.ok) setData(await res.json());
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zirios-red border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pt-24">
        <div className="mx-auto max-w-7xl px-gutter py-8">
          <h1 className="font-display text-display uppercase tracking-tight">{slug?.replace(/-/g, " ") || "Category"}</h1>
          <p className="mt-2 text-sm text-zirios-gray-500">Explore our collection</p>
        </div>
        <div className="mx-auto max-w-7xl px-gutter py-section">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {["phantom-hoodie","carbon-cargo","voltage-tee","aero-runner"].map((s) => (
              <ProductCard key={s} slug={s} name={s.replace(/-/g, " ")} price={19900} image="" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-7xl px-gutter py-8">
        <h1 className="font-display text-display">{data.name}</h1>
        <p className="mt-2 text-sm text-zirios-gray-500">{data._count.products} products</p>

        {data.children.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {data.children.map((child) => (
              <a
                key={child.id}
                href={`/categories/${child.slug}`}
                className="rounded-full border border-white/10 px-5 py-2 text-sm text-zirios-gray-300 transition-colors hover:border-zirios-red hover:text-zirios-red"
              >
                {child.name}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-gutter py-section">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {data.products.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              price={p.basePrice}
              image={p.media?.[0]?.url || ""}
            />
          ))}
        </div>

        {data.products.length === 0 && (
          <p className="py-20 text-center text-zirios-gray-500">No products in this category yet.</p>
        )}
      </div>
    </div>
  );
}
