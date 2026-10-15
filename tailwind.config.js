/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF4E4',
        sand: '#F3E7CB',
        charcoal: '#121212',
        ink: '#0A0A0A',
        gold: { DEFAULT: '#E8B31A', light: '#F6CF55', dark: '#946B00' },
        crimson: { DEFAULT: '#C41E1E', deep: '#9A1414' },
        burgundy: '#6B1E2E',
        forest: '#0F7A34',
        indigo: '#1A4DA0',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        script: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: { site: '1200px' },
    },
  },
  plugins: [],
}
