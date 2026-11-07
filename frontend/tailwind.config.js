
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: "#635BFF",
        dark: "#101114",
        panel: "#191B20"
      }
    }
  },
  plugins: []
};
