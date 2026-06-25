import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        cyan: "hsl(var(--accent-cyan))",
        bronze: "hsl(var(--bronze))",
        silver: "hsl(var(--silver))",
        gold: "hsl(var(--gold))"
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"]
      },
      boxShadow: {
        glow: "0 0 28px hsl(var(--primary) / 0.18)",
        card: "0 20px 70px rgb(0 0 0 / 0.3)"
      },
      backgroundImage: {
        grid: "linear-gradient(hsl(var(--border) / .38) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / .38) 1px, transparent 1px)",
        aurora: "radial-gradient(circle at top left, hsl(var(--primary) / .20), transparent 34%), radial-gradient(circle at top right, hsl(var(--accent-cyan) / .18), transparent 28%)"
      }
    }
  },
  plugins: []
};

export default config;
