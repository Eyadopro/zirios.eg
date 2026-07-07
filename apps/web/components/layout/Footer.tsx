"use client";

import { Instagram, Mail, Twitter, Youtube } from "lucide-react";

const SOCIAL = [
  { icon: Instagram, href: "https://instagram.com/zirios", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com/zirios", label: "X / Twitter" },
  { icon: Youtube, href: "https://youtube.com/@zirios", label: "YouTube" },
  { icon: Mail, href: "mailto:eyadopro88@gmail.com", label: "Email" },
];

const LINKS = {
  Shop: ["Shoes", "Women", "Men", "Home", "Collections"],
  Support: ["Size Guide", "Shipping", "Returns", "FAQ", "Contact"],
  Company: ["About", "Careers", "Sustainability", "Press"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-zirios-black">
      <div className="mx-auto max-w-7xl px-gutter py-section">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <a href="/" className="font-display text-2xl font-bold tracking-[0.15em] text-zirios-red">
              ZIRIOS
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-zirios-gray-300">
              Engineered at the intersection of performance, luxury, and machine precision.
              Futuristic streetwear for those who demand more.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="glass flex h-10 w-10 items-center justify-center rounded-full text-zirios-gray-300 transition-colors hover:text-zirios-red hover:shadow-glow"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-zirios-gray-500">
                {heading}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href={`/${link.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-sm text-zirios-gray-300 transition-colors hover:text-zirios-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-white/5 pt-8 text-center text-xs text-zirios-gray-500">
          &copy; {new Date().getFullYear()} ZIRIOS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
