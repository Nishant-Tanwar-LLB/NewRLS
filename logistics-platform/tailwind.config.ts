import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--brand-primary)",     // Orange
          secondary: "var(--brand-secondary)", // Light Orange
          dark: "var(--brand-dark)",           // Dark Blue (Slate 900)
          highlight: "var(--brand-highlight)", // Borders
          cream: "var(--brand-cream)",         // App Background
        },
      },
    },
  },
  plugins: [],
};
export default config;