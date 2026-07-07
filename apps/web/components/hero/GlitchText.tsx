interface GlitchTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "span";
}

/**
 * Three stacked copies of the same text: a solid white base, plus a red and
 * cyan layer that clip/shift on independent animation loops (see the
 * `.glitch-layer-*` keyframes in globals.css). This is the RGB-split effect
 * from the reference screenshot's "ZIRIOS" wordmark.
 */
export function GlitchText({ text, className = "", as = "span" }: GlitchTextProps) {
  const Tag = as;
  return (
    <Tag className={`relative inline-block select-none ${className}`}>
      <span className="relative z-10 text-zirios-white">{text}</span>
      <span aria-hidden className="glitch-layer-red absolute inset-0 z-0">
        {text}
      </span>
      <span aria-hidden className="glitch-layer-cyan absolute inset-0 z-0">
        {text}
      </span>
    </Tag>
  );
}
