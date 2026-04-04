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
        bg: {
          primary: "#0a0a0a",
          secondary: "#0f0f0f",
          card: "#111111",
          glass: "rgba(255,255,255,0.03)",
        },
        accent: {
          blue: "#0052FF",
          "blue-light": "#3378FF",
          "blue-dim": "rgba(0,82,255,0.15)",
          green: "#00FF41",
          "green-dim": "rgba(0,255,65,0.12)",
          red: "#FF3131",
          "red-dim": "rgba(255,49,49,0.15)",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.07)",
          glow: "rgba(0,82,255,0.4)",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,82,255,0.15), transparent)",
        "card-glow":
          "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,82,255,0.08), transparent)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan-line": "scanLine 3s linear infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        "blue-glow": "0 0 30px rgba(0,82,255,0.3), 0 0 60px rgba(0,82,255,0.1)",
        "green-glow": "0 0 20px rgba(0,255,65,0.3)",
        "red-glow": "0 0 20px rgba(255,49,49,0.4)",
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
