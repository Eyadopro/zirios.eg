"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductCard } from "../../../components/product/ProductCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface CollectionData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  heroImage: string | null;
  products: { id: string; name: string; slug: string; basePrice: number; media: { url: string }[] }[];
  _count: { products: number };
}

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API}/collections/${slug}`);
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
      <div className="flex h-screen items-center justify-center">
        <p className="text-zirios-gray-300">Collection not found</p>
      </div>
    );
  }

  return (
    <div className="pt-24">
      <div className="relative flex h-64 items-center justify-center overflow-hidden bg-zirios-gray-900 md:h-96">
        {data.heroImage && (
          <img src={data.heroImage} alt={data.name} className="absolute inset-0 h-full w-full object-cover opacity-40" />
        )}
        <div className="relative z-10 text-center">
          <h1 className="font-display text-display">{data.name}</h1>
          {data.description && <p className="mt-4 text-zirios-gray-300">{data.description}</p>}
          <p className="mt-2 text-sm text-zirios-gray-500">{data._count.products} products</p>
        </div>
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
          <p className="py-20 text-center text-zirios-gray-500">No products in this collection yet.</p>
        )}
      </div>
    </div>
  );
}
