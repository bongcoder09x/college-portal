import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dae5ff",
          200: "#bdd0ff",
          300: "#90b0ff",
          400: "#5b85fb",
          500: "#355ff5",
          600: "#203fe9",
          700: "#1a2fd4",
          800: "#1c2aab",
          900: "#1d2b87",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
