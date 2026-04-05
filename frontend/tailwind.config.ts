import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: { primary: "#0a0a0a", secondary: "#0f0f0f", card: "#111111" },
        accent: {
          blue:   "#0052FF", "blue-light": "#3378FF",
          green:  "#00FF41",
          red:    "#FF3131",
          purple: "#A855F7",
        },
      },
      fontFamily: {
        mono:    ["'JetBrains Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: { grid: "40px 40px" },
      boxShadow: {
        "blue-glow":   "0 0 30px rgba(0,82,255,0.3), 0 0 60px rgba(0,82,255,0.1)",
        "green-glow":  "0 0 20px rgba(0,255,65,0.3)",
        "red-glow":    "0 0 20px rgba(255,49,49,0.4)",
        "purple-glow": "0 0 20px rgba(168,85,247,0.4)",
        "glass":       "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
