/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#10B981',
        'geo-primary': 'var(--geo-primary)',
        'geo-secondary': 'var(--geo-secondary)',
        'geo-accent': 'var(--geo-accent)',
        'geo-dark': 'var(--geo-dark)',
        'geo-light': 'var(--geo-light)',
        'geo-background': 'var(--geo-background)',
        'geo-text': 'var(--geo-text)',
        'geo-border': 'var(--geo-border)',
        'geo-hover': 'var(--geo-hover)'
      }
    },
  },
  plugins: [],
}
