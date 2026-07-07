import type { Config } from "tailwindcss";

// ZIRIOS Design Tokens
// Brand: black / carbon / dark gray / white / neon red — dark mode only.
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        zirios: {
          black: "#050506",     // primary background
          carbon: "#0d0d0f",    // elevated surfaces
          gray: {
            900: "#161618",
            700: "#2a2a2e",
            500: "#6b6b70",
            300: "#a8a8ad",
          },
          white: "#f5f5f7",
          red: {
            DEFAULT: "#ff1a2e", // neon red — primary accent, CTAs, hover glows
            dim: "#7a0f18",
            glow: "rgba(255,26,46,0.45)",
          },
        },
      },
      fontFamily: {
        display: ["'Neue Montreal'", "'Helvetica Neue'", "sans-serif"], // large hero type
        body: ["'Inter'", "sans-serif"],
      },
      fontSize: {
        hero: ["clamp(3rem, 9vw, 9rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        display: ["clamp(2rem, 5vw, 4.5rem)", { lineHeight: "1", letterSpacing: "-0.02em" }],
      },
      spacing: {
        section: "clamp(4rem, 10vw, 10rem)",
        gutter: "clamp(1.25rem, 4vw, 3rem)",
      },
      backdropBlur: {
        glass: "18px",
      },
      boxShadow: {
        glow: "0 0 40px rgba(255,26,46,0.35)",
        card: "0 8px 30px rgba(0,0,0,0.5)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      transitionTimingFunction: {
        "apple-ease": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
