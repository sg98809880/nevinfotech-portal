import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f4f6f9",
          100: "#e7ebf1",
          200: "#c9d2e0",
          300: "#9aabc4",
          400: "#6a7fa0",
          500: "#465a7c",
          600: "#324363",
          700: "#243047",
          800: "#162033",
          900: "#0f1b2d",
          950: "#0b1220",
        },
        gold: {
          50: "#fbf6ea",
          100: "#f3e6c4",
          200: "#e8cc8e",
          300: "#dcb35e",
          400: "#cf9c3c",
          500: "#c8932b",
          600: "#a87420",
          700: "#7e571a",
          800: "#5a3e15",
          900: "#3b2a10",
        },
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jbmono)", "monospace"],
      },
      boxShadow: {
        ledger: "inset 3px 0 0 0 var(--tw-shadow-color)",
      },
    },
  },
  plugins: [],
};

export default config;
