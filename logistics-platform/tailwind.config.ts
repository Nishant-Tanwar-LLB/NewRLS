import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // 1. Check Root Directory (If your files are at the top)
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",

    // 2. Check 'src' Directory (If you selected 'Yes' for src folder during setup)
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Your Custom Saffron Colors 🎨
      colors: {
        brand: {
          primary: "var(--brand-primary)",     // #FF7D29
          secondary: "var(--brand-secondary)", // #FFBF78
          highlight: "var(--brand-highlight)", // #FFEEA9
          cream: "var(--brand-cream)",         // #FEFFD2
        },
      },
    },
  },
  plugins: [],
};
export default config;