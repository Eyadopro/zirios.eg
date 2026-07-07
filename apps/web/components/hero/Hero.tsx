"use client";

import gsap from "gsap";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { GlitchText } from "./GlitchText";

// 3D canvas is client-only and heavy — load it lazily, off the main bundle.
const HeroScene = dynamic(() => import("./HeroScene").then((m) => m.HeroScene), {
  ssr: false,
});

export function Hero() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current.children,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.15, delay: 0.2 }
    );
  }, []);

  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden">
      <HeroScene />

      <div ref={contentRef} className="relative z-10 px-gutter text-center">
        <GlitchText
          as="h1"
          text="ZIRIOS"
          className="font-display text-hero uppercase leading-none"
        />

        <p className="mt-6 text-lg font-semibold uppercase tracking-[0.25em] text-zirios-red">
          .Style. Perform. Conquer
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <a href="/deals" className="btn-ghost">
            Flash Deals
          </a>
          <a href="/collections/new" className="btn-primary">
            Shop the Drop
          </a>
        </div>
      </div>
    </section>
  );
}
