"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CartDrawer } from "../components/cart/CartDrawer";
import { Hero } from "../components/hero/Hero";
import { ProductCard } from "../components/product/ProductCard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FEATURED = [
  { slug: "phantom-hoodie", name: "Phantom Hoodie", price: 24000, image: "/products/1.jpg" },
  { slug: "carbon-cargo", name: "Carbon Cargo", price: 19500, image: "/products/2.jpg" },
  { slug: "voltage-tee", name: "Voltage Tee", price: 9500, image: "/products/3.jpg" },
  { slug: "aero-runner", name: "Aero Runner", price: 32000, image: "/products/4.jpg" },
  { slug: "phantom-hoodie-2", name: "Titan Jacket", price: 45000, image: "/products/5.jpg" },
  { slug: "carbon-cargo-2", name: "Circuit Pant", price: 28500, image: "/products/6.jpg" },
  { slug: "voltage-tee-2", name: "Neon Tee", price: 8500, image: "/products/7.jpg" },
  { slug: "aero-runner-2", name: "Vapor Hoodie", price: 22000, image: "/products/8.jpg" },
];

const TESTIMONIALS = [
  { name: "Alex K.", text: "The quality is unreal. Worth every penny.", rating: 5 },
  { name: "Sam T.", text: "ZIRIOS is the future of streetwear. Period.", rating: 5 },
  { name: "Jordan P.", text: "Fast shipping and the fit is impeccable.", rating: 4 },
];

export default function HomePage() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [sliderIndex, setSliderIndex] = useState(0);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  const scrollSlider = (dir: number) => {
    if (!trackRef.current || !sliderRef.current) return;
    const max = trackRef.current.scrollWidth - sliderRef.current.clientWidth;
    const newIndex = Math.max(0, Math.min(Math.floor(max / 320), sliderIndex + dir));
    setSliderIndex(newIndex);
    sliderRef.current.scrollTo({ left: newIndex * 320, behavior: "smooth" });
  };

  return (
    <>
      <Hero />

      {/* Featured Collection */}
      <section className="px-gutter py-section">
        <div className="mb-12 flex items-end justify-between">
          <h2 className="font-display text-display">Featured Collection</h2>
          <a href="/collections/featured" className="btn-ghost flex items-center gap-2 text-sm">
            View all <ArrowRight size={14} />
          </a>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {FEATURED.slice(0, 4).map((p) => (
            <ProductCard key={p.slug} {...p} />
          ))}
        </div>
      </section>

      {/* Video / Brand Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden bg-zirios-carbon">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-zirios-red">Engineered for Impact</p>
            <h2 className="font-display text-[clamp(2rem,6vw,5rem)] uppercase leading-none">
              Born from<br />the machine
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-zirios-gray-300">
              Every stitch, every seam, every detail is precision-crafted at the intersection of
              performance, luxury, and futuristic design.
            </p>
            <a href="/collections/new" className="btn-primary mt-8 inline-flex items-center gap-2">
              Explore <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-zirios-black/60 to-transparent" />
      </section>

      {/* Best Sellers */}
      <section className="px-gutter py-section">
        <div className="mb-12 flex items-end justify-between">
          <h2 className="font-display text-display">Best Sellers</h2>
          <a href="/search?q=" className="text-sm text-zirios-red hover:underline">
            Shop all
          </a>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {FEATURED.slice(4, 8).map((p) => (
            <ProductCard key={p.slug} {...p} slug={p.slug} />
          ))}
        </div>
      </section>

      {/* Interactive Product Slider */}
      <section ref={sliderRef} className="px-gutter py-section overflow-hidden">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-display">Explore Collection</h2>
          <div className="flex gap-3">
            <button onClick={() => scrollSlider(-1)} className="glass flex h-10 w-10 items-center justify-center rounded-full hover:text-zirios-red">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scrollSlider(1)} className="glass flex h-10 w-10 items-center justify-center rounded-full hover:text-zirios-red">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div ref={trackRef} className="flex gap-6" style={{ width: "max-content" }}>
          {[...FEATURED, ...FEATURED].map((p, i) => (
            <div key={i} className="w-72 flex-shrink-0">
              <ProductCard {...p} slug={p.slug} />
            </div>
          ))}
        </div>
      </section>

      {/* Lookbook Section */}
      <section className="px-gutter py-section">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="aspect-[3/4] rounded-xl2 bg-zirios-gray-900 flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-zirios-red">Lookbook Vol.1</p>
              <h3 className="mt-4 font-display text-3xl">The Future of<br />Streetwear</h3>
              <a href="/collections/lookbook" className="btn-ghost mt-6 inline-flex items-center gap-2">
                View Lookbook <ArrowRight size={14} />
              </a>
            </div>
          </div>
          <div className="aspect-[3/4] rounded-xl2 bg-gradient-to-br from-zirios-gray-900 to-zirios-black flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-zirios-red">Limited Edition</p>
              <h3 className="mt-4 font-display text-3xl">Titan Series<br />Drops Soon</h3>
              <a href="/collections/titan" className="btn-ghost mt-6 inline-flex items-center gap-2">
                Notify Me <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-gutter py-section">
        <h2 className="mb-12 font-display text-display text-center">What Our Community Says</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="glass rounded-xl2 p-8 text-center">
              <div className="mb-4 flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className={i < t.rating ? "fill-zirios-red text-zirios-red" : "text-zirios-gray-500"} />
                ))}
              </div>
              <p className="mb-4 italic text-zirios-gray-300">&ldquo;{t.text}&rdquo;</p>
              <p className="text-sm text-zirios-red">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Instagram Section */}
      <section className="px-gutter py-section">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-zirios-red">Follow Us</p>
          <h2 className="mt-2 font-display text-display">@ZIRIOS</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <a
              key={i}
              href="https://instagram.com/zirios"
              target="_blank"
              rel="noreferrer"
              className="aspect-square overflow-hidden rounded-xl bg-zirios-gray-900 group"
            >
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zirios-gray-700 to-zirios-black transition-transform duration-500 group-hover:scale-110">
                <span className="text-2xl opacity-30 group-hover:opacity-60 transition-opacity">📸</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-gutter py-section">
        <div className="glass rounded-xl2 mx-auto max-w-2xl p-12 text-center">
          <h2 className="font-display text-3xl">Stay Connected</h2>
          <p className="mt-4 text-zirios-gray-300">Be the first to know about drops, limited editions, and exclusive access.</p>
          <form className="mx-auto mt-8 flex max-w-md gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 rounded-full border border-white/10 bg-transparent px-6 py-3 text-sm text-zirios-white placeholder:text-zirios-gray-500 focus:border-zirios-red focus:outline-none"
              required
            />
            <button type="submit" className="btn-primary">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <CartDrawer />
    </>
  );
}
