/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#0a1628',
        'storm-grey': '#1a2a3a',
        'burnt-umber': '#2d1f14',
        'amber-gold': '#f4a623',
        'cream-light': '#ffecd2',
        'warm-white': '#e8e4df',
        'muted-blue-grey': '#8b9eb3',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'body': ['Crimson Text', 'serif'],
      },
    },
  },
  plugins: [],
}
