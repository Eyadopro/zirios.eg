"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { GlitchText } from "../hero/GlitchText";

/**
 * Full-screen entrance played once per session (sessionStorage-gated so
 * repeat page loads within the same visit don't replay it).
 *
 * Sequence: black void -> logo glitches into existence with a rising growl
 * of red light -> screen shake intensifies -> a crack of light splits down
 * the center -> two black "door" panels are torn apart to reveal the site.
 */
export function IntroScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"charging" | "shaking" | "done">("charging");
  const openingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const crackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem("zirios-intro-seen");
    if (alreadySeen) {
      onDone();
      return;
    }

    const counter = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + Math.random() * 14 + 4, 100);
        if (next >= 100) {
          clearInterval(counter);
          setPhase("shaking");
        }
        return next;
      });
    }, 140);

    return () => clearInterval(counter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "shaking" || openingRef.current) return;
    openingRef.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem("zirios-intro-seen", "1");
        setPhase("done");
        onDone();
      },
    });

    tl.to(crackRef.current, { scaleX: 1, duration: 0.6, ease: "power2.in" })
      .to(rootRef.current, { duration: 0.5, onStart: () => rootRef.current?.classList.toggle("screen-shake", true) }, "<")
      .to(leftDoorRef.current, { xPercent: -100, duration: 1.1, ease: "power4.inOut" })
      .to(rightDoorRef.current, { xPercent: 100, duration: 1.1, ease: "power4.inOut" }, "<")
      .to(rootRef.current, { autoAlpha: 0, duration: 0.3 }, "-=0.2");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      ref={rootRef}
      className="scanlines fixed inset-0 z-[100] overflow-hidden"
      style={{ position: "fixed" }}
    >
      {/* Center crack of red light that widens before the doors open */}
      <div
        ref={crackRef}
        className="absolute inset-y-0 left-1/2 w-[2px] origin-center bg-zirios-red"
        style={{ transform: "scaleX(0)", boxShadow: "0 0 60px 10px rgba(255,26,46,0.6)" }}
      />

      {/* Left/right door panels — the actual site is already mounted behind
          this component; these panels just cover it until they tear open. */}
      <div ref={leftDoorRef} className="absolute inset-y-0 left-0 w-1/2 bg-black" />
      <div ref={rightDoorRef} className="absolute inset-y-0 right-0 w-1/2 bg-black" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8">
        <GlitchText
          as="h1"
          text="ZIRIOS"
          className="font-display text-[clamp(3rem,12vw,10rem)] uppercase tracking-tight"
        />

        <div className="flex w-64 flex-col items-center gap-2">
          <div className="h-[2px] w-full overflow-hidden bg-white/10">
            <div
              className="h-full bg-zirios-red transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%`, boxShadow: "0 0 12px rgba(255,26,46,0.8)" }}
            />
          </div>
          <p className="pulse-glow text-xs tracking-[0.3em] text-zirios-red">
            {progress < 100 ? "AWAKENING" : "ENTER"}
          </p>
        </div>
      </div>
    </div>
  );
}
