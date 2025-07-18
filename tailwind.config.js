/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#10B981',
        'geo-primary': '#16a34a',
        'geo-secondary': '#0ea5e9',
        'geo-accent': '#f59e0b',
        'geo-dark': '#1e293b',
        'geo-light': '#f8fafc'
      }
    },
  },
  plugins: [],
}
