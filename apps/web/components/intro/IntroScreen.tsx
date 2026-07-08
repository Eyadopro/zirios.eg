"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { GlitchText } from "../hero/GlitchText";

export function IntroScreen({ onDone }: { onDone: () => void }) {
  const [done, setDone] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (sessionStorage.getItem("zirios-intro-seen")) {
      onDone();
      setDone(true);
      return;
    }

    const bar = document.getElementById("intro-bar");
    const label = document.getElementById("intro-label");
    const crack = document.getElementById("intro-crack");
    const root = document.getElementById("intro-root");
    const left = document.getElementById("intro-left");
    const right = document.getElementById("intro-right");

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem("zirios-intro-seen", "1");
        setDone(true);
        onDone();
      },
    });

    tl.to(bar, { width: "100%", duration: 2.5, ease: "power2.out", onUpdate: () => {
      if (bar && label) label.textContent = parseFloat(bar.style.width || "0") >= 100 ? "ENTER" : "AWAKENING";
    }})
      .to(crack, { scaleX: 1, duration: 0.6, ease: "power2.in" })
      .to(root, { duration: 0.5, onStart: () => root?.classList.toggle("screen-shake", true) }, "<")
      .to(left, { xPercent: -100, duration: 1.1, ease: "power4.inOut" })
      .to(right, { xPercent: 100, duration: 1.1, ease: "power4.inOut" }, "<")
      .to(root, { autoAlpha: 0, duration: 0.3 }, "-=0.2");

    setTimeout(() => { tl.progress(1); }, 12000);
  }, [onDone]);

  if (done) return null;

  return (
    <div id="intro-root" className="scanlines fixed inset-0 z-[100] overflow-hidden bg-black">
      <div id="intro-crack" className="absolute inset-y-0 left-1/2 w-[2px] origin-center bg-zirios-red" style={{ transform: "scaleX(0)", boxShadow: "0 0 60px 10px rgba(255,26,46,0.6)" }} />
      <div id="intro-left" className="absolute inset-y-0 left-0 w-1/2 bg-black" />
      <div id="intro-right" className="absolute inset-y-0 right-0 w-1/2 bg-black" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8">
        <GlitchText as="h1" text="ZIRIOS" className="font-display text-[clamp(3rem,12vw,10rem)] uppercase tracking-tight" />
        <div className="flex w-64 flex-col items-center gap-2">
          <div className="h-[2px] w-full overflow-hidden bg-white/10">
            <div id="intro-bar" className="h-full bg-zirios-red" style={{ width: "0%", boxShadow: "0 0 12px rgba(255,26,46,0.8)" }} />
          </div>
          <p id="intro-label" className="pulse-glow text-xs tracking-[0.3em] text-zirios-red">AWAKENING</p>
        </div>
      </div>
    </div>
  );
}
