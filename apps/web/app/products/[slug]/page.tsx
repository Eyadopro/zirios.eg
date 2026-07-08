"use client";

import { Heart, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CartDrawer } from "../../../components/cart/CartDrawer";
import { ProductCard } from "../../../components/product/ProductCard";
import { useAuthStore } from "../../../store/auth.store";
import { useCartStore } from "../../../store/cart.store";
import { useWishlistStore } from "../../../store/wishlist.store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  currency: string;
  tags: string[];
  model3dUrl: string | null;
  isPublished: boolean;
  media: { id: string; url: string; type: string; alt: string | null }[];
  variants: { id: string; size: string; color: string; priceDelta: number; stock: number }[];
  reviews: { id: string; rating: number; title: string | null; body: string | null; createdAt: string; user: { name: string } }[];
  category: { id: string; name: string; slug: string } | null;
  collection: { id: string; name: string; slug: string } | null;
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [related, setRelated] = useState<Product[]>([]);

  const { add, open } = useCartStore();
  const { isInWishlist, add: addWishlist, remove: removeWishlist } = useWishlistStore();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API}/products/${slug}`);
        if (!res.ok) return;
        const data = await res.json();
        setProduct(data);
        if (data.variants?.length > 0) setSelectedVariant(data.variants[0].id);

        const catRes = await fetch(`${API}/categories/${data.category?.slug}`);
        if (catRes.ok) {
          const catData = await catRes.json();
          setRelated(catData.products?.filter((p: Product) => p.slug !== slug).slice(0, 4) || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const variant = product?.variants?.find((v) => v.id === selectedVariant);
  const price = product ? product.basePrice + (variant?.priceDelta || 0) : 0;
  const colors = [...new Set(product?.variants?.map((v) => v.color) || [])];
  const sizes = [...new Set(product?.variants?.map((v) => v.size) || [])];

  const handleAddToCart = () => {
    if (!product || !variant) return;
    add({
      variantId: variant.id,
      productId: product.id,
      name: product.name,
      image: product.media?.[0]?.url || "",
      size: variant.size,
      color: variant.color,
      price,
      quantity,
    });
    open();
  };

  const handleWishlist = async () => {
    if (!product || !accessToken) return;
    if (isInWishlist(product.id)) {
      const item = useWishlistStore.getState().items.find((i) => i.productId === product.id);
      if (item) await removeWishlist(accessToken, item.id);
    } else {
      await addWishlist(accessToken, product.id);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zirios-red border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    const fallback: Record<string, { name: string; price: number; desc: string }> = {
      "phantom-hoodie": { name: "Phantom Hoodie", price: 24000, desc: "A precision-engineered hoodie crafted from aerospace-grade cotton blend. Featuring integrated thermal regulation and a signature red interior pocket." },
      "carbon-cargo": { name: "Carbon Cargo", price: 19500, desc: "Next-generation cargo pants with articulated knee panels and carbon fiber reinforced stitching. Designed for maximum mobility." },
      "voltage-tee": { name: "Voltage Tee", price: 9500, desc: "Essential crewneck tee in heavyweight organic cotton. Voltage red ZIRIOS logo screened at chest. Pre-shrunk and garment-dyed." },
      "aero-runner": { name: "Aero Runner", price: 32000, desc: "Performance runner engineered for the urban landscape. Knit upper with responsive cushioning and reflective accents." },
    };
    const fb = fallback[slug as string] || { name: slug?.replace(/-/g, " ") || "Product", price: 19900, desc: "Engineered for impact. Precision crafted at the intersection of performance and luxury." };
    return (
      <div className="pt-24">
        <div className="mx-auto max-w-7xl px-gutter py-8">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="overflow-hidden rounded-xl2 bg-gradient-to-br from-zirios-gray-900 to-black flex items-center justify-center h-[32rem]">
              <span className="font-display text-6xl text-zirios-gray-700">{fb.name.charAt(0)}</span>
            </div>
            <div className="flex flex-col gap-6">
              <h1 className="font-display text-display">{fb.name}</h1>
              <p className="text-3xl font-bold">${(fb.price / 100).toFixed(2)}</p>
              <p className="leading-relaxed text-zirios-gray-300">{fb.desc}</p>
              <div className="flex items-center gap-4">
                <button className="btn-primary flex-1 gap-2"><ShoppingBag size={16} /> Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const avgRating = product.reviews?.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;

  return (
    <>
      <div className="pt-24">
        <div className="mx-auto max-w-7xl px-gutter py-8">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl2 bg-zirios-gray-900">
                <img
                  src={product.media?.[selectedImage]?.url || "/placeholder.svg"}
                  alt={product.name}
                  className="h-[32rem] w-full object-cover"
                />
              </div>
              {product.media?.length > 1 && (
                <div className="flex gap-3 overflow-x-auto">
                  {product.media.map((m, i) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedImage(i)}
                      className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                        i === selectedImage ? "border-zirios-red" : "border-transparent"
                      }`}
                    >
                      <img src={m.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              {product.category && (
                <a
                  href={`/categories/${product.category.slug}`}
                  className="text-xs uppercase tracking-[0.15em] text-zirios-red"
                >
                  {product.category.name}
                </a>
              )}

              <h1 className="font-display text-display">{product.name}</h1>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.round(avgRating) ? "fill-zirios-red text-zirios-red" : "text-zirios-gray-500"}
                    />
                  ))}
                </div>
                <span className="text-sm text-zirios-gray-300">
                  ({product.reviews?.length || 0} reviews)
                </span>
              </div>

              <p className="text-3xl font-bold">${(price / 100).toFixed(2)}</p>

              <p className="leading-relaxed text-zirios-gray-300">{product.description}</p>

              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-zirios-gray-500">
                  Color: {variant?.color}
                </p>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        const v = product.variants.find((v) => v.color === color && v.size === variant?.size);
                        if (v) setSelectedVariant(v.id);
                      }}
                      className={`rounded-full border-2 px-5 py-2 text-sm transition-colors ${
                        variant?.color === color ? "border-zirios-red bg-zirios-red/10 text-zirios-red" : "border-white/10 text-zirios-gray-300 hover:border-white/30"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-zirios-gray-500">
                  Size: {variant?.size}
                </p>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => {
                    const v = product.variants.find((v) => v.size === size && v.color === variant?.color);
                    const isOut = v ? v.stock === 0 : true;
                    const isSelected = variant?.size === size && v?.id === selectedVariant;
                    return (
                      <button
                        key={size}
                        disabled={isOut}
                        onClick={() => v && setSelectedVariant(v.id)}
                        className={`rounded-full border-2 px-5 py-2 text-sm transition-colors ${
                          isOut ? "cursor-not-allowed opacity-30" : ""
                        } ${
                          isSelected ? "border-zirios-red bg-zirios-red/10 text-zirios-red" : "border-white/10 text-zirios-gray-300 hover:border-white/30"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 rounded-full border border-white/10 px-4 py-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-zirios-red">
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="hover:text-zirios-red">
                    <Plus size={16} />
                  </button>
                </div>

                <button onClick={handleAddToCart} className="btn-primary flex-1 gap-2">
                  <ShoppingBag size={16} />
                  Add to Cart
                </button>

                <button
                  onClick={handleWishlist}
                  className={`glass flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                    isInWishlist(product.id) ? "text-zirios-red" : "hover:text-zirios-red"
                  }`}
                >
                  <Heart size={18} className={isInWishlist(product.id) ? "fill-zirios-red" : ""} />
                </button>
              </div>

              {variant && (
                <p className="text-sm text-zirios-gray-500">
                  {variant.stock > 0 ? `${variant.stock} in stock` : "Out of stock"}
                </p>
              )}

              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-zirios-gray-900 px-3 py-1 text-xs text-zirios-gray-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {product.reviews?.length > 0 && (
            <section className="mt-20">
              <h2 className="mb-8 font-display text-2xl">Customer Reviews</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {product.reviews.map((review) => (
                  <div key={review.id} className="glass rounded-xl2 p-6">
                    <div className="mb-3 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? "fill-zirios-red text-zirios-red" : "text-zirios-gray-500"}
                        />
                      ))}
                    </div>
                    {review.title && <h4 className="mb-1 font-semibold">{review.title}</h4>}
                    {review.body && <p className="text-sm text-zirios-gray-300">{review.body}</p>}
                    <p className="mt-3 text-xs text-zirios-gray-500">— {review.user.name}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-20">
              <h2 className="mb-8 font-display text-2xl">You May Also Like</h2>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {related.map((p) => (
                  <ProductCard
                    key={p.id}
                    slug={p.slug}
                    name={p.name}
                    price={p.basePrice}
                    image={p.media?.[0]?.url || ""}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <CartDrawer />
    </>
  );
}
