"use client";

import { Instagram, Mail, Twitter, Youtube } from "lucide-react";
import { useRef } from "react";

const LINKS = [
  { icon: Instagram, href: "https://instagram.com/zirios", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com/zirios", label: "X / Twitter" },
  { icon: Youtube, href: "https://youtube.com/@zirios", label: "YouTube" },
  { icon: Mail, href: "mailto:eyadopro88@gmail.com", label: "Email us" },
];

/**
 * Fixed vertical dock, bottom-right. Each icon reads the cursor position on
 * every mousemove and translates a few pixels toward it when within range —
 * a classic "magnetic button" micro-interaction.
 */
export function SocialDock() {
  const dockRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const buttons = dockRef.current?.querySelectorAll<HTMLAnchorElement>("[data-magnetic]");
    buttons?.forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = 70;

      if (dist < radius) {
        const strength = (1 - dist / radius) * 10;
        btn.style.transform = `translate(${(dx / dist) * strength}px, ${(dy / dist) * strength}px) scale(1.15)`;
      } else {
        btn.style.transform = "";
      }
    });
  }

  function resetAll() {
    dockRef.current?.querySelectorAll<HTMLAnchorElement>("[data-magnetic]").forEach((btn) => {
      btn.style.transform = "";
    });
  }

  return (
    <div
      ref={dockRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetAll}
      className="fixed bottom-8 right-8 z-40 flex flex-col gap-3"
    >
      {LINKS.map(({ icon: Icon, href, label }) => (
        <a
          key={label}
          data-magnetic
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          aria-label={label}
          className="glass flex h-11 w-11 items-center justify-center rounded-full text-zirios-white transition-[transform,box-shadow] duration-150 ease-out hover:text-zirios-red hover:shadow-glow"
        >
          <Icon size={18} />
        </a>
      ))}
    </div>
  );
}
