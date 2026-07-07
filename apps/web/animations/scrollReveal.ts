import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Fade + rise reveal for any section as it enters the viewport. */
export function revealOnScroll(selector: string, options?: { stagger?: number }) {
  const els = gsap.utils.toArray<HTMLElement>(selector);
  els.forEach((el) => {
    gsap.fromTo(
      el,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        stagger: options?.stagger ?? 0.1,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
        },
      }
    );
  });
}

/** Horizontal scroll-jacked product slider, pinned within its container. */
export function horizontalScroll(containerSelector: string, trackSelector: string) {
  const container = document.querySelector<HTMLElement>(containerSelector);
  const track = document.querySelector<HTMLElement>(trackSelector);
  if (!container || !track) return;

  const scrollDistance = track.scrollWidth - container.clientWidth;

  gsap.to(track, {
    x: -scrollDistance,
    ease: "none",
    scrollTrigger: {
      trigger: container,
      start: "top top",
      end: () => `+=${scrollDistance}`,
      scrub: 1,
      pin: true,
    },
  });
}
