"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 16}px, ${e.clientY - 16}px)`;
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zirios-red shadow-glow"
        style={{ transform: "translate(0, 0)" }}
      />
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] h-8 w-8 rounded-full border border-zirios-red/50 transition-[width,height,border,opacity] duration-300"
        style={{ transform: "translate(0, 0)" }}
      />
    </>
  );
}
