/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#0f1117",
          800: "#161822",
          700: "#1e2130",
          600: "#2a2d3e",
        },
        accent: {
          DEFAULT: "#818cf8",
          light: "#a5b4fc",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
