import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          black: "#0A0A0B",
          dark: "#141416",
          surface: "#1B1B1E",
          border: "#2A2A2E",
          white: "#FAFAFA",
        },
        brand: {
          red: "#E53935",
          "red-dark": "#B71C1C",
          "red-light": "#FF6B65",
          blue: "#2979FF",
          "blue-dark": "#1A56DB",
          "blue-light": "#5B9CFF",
        },
        gray: {
          50: "#FAFAFA",
          100: "#F1F1F2",
          200: "#E3E3E5",
          300: "#C7C7CB",
          400: "#9A9AA1",
          500: "#6E6E76",
          600: "#505057",
          700: "#38383D",
          800: "#242427",
          900: "#141416",
          950: "#0A0A0B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(229, 57, 53, 0.35)",
        "glow-blue": "0 0 40px -10px rgba(41, 121, 255, 0.35)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-500px 0" },
          "100%": { backgroundPosition: "500px 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite",
        shimmer: "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
