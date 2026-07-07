"use client";

import { Heart } from "lucide-react";
import { useRef } from "react";

export interface ProductCardProps {
  slug: string;
  name: string;
  price: number; // cents
  image: string;
  colorCount?: number;
}

export function ProductCard({ slug, name, price, image, colorCount = 1 }: ProductCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
  }

  function resetTilt() {
    if (cardRef.current) cardRef.current.style.transform = "";
  }

  return (
    <a
      ref={cardRef}
      href={`/products/${slug}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      className="group relative block overflow-hidden rounded-xl2 bg-zirios-gray-900 transition-shadow duration-300 ease-apple-ease hover:shadow-glow"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <button
        aria-label="Add to wishlist"
        className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-2 opacity-0 backdrop-blur-glass transition-opacity group-hover:opacity-100"
      >
        <Heart size={16} />
      </button>

      <div className="aspect-[3/4] w-full bg-gradient-to-b from-zirios-gray-700 to-zirios-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={name} className="h-full w-full object-cover" loading="lazy" />
      </div>

      <div className="p-4">
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-zirios-gray-300">
          ${(price / 100).toFixed(2)} · {colorCount} colors
        </p>
      </div>
    </a>
  );
}
