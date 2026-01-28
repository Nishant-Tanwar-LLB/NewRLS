// tailwind.config.js
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#FF4500", // Your Orange
          secondary: "#1E293B", // Slate 800
        }
      },
    },
  },
  plugins: [],
}