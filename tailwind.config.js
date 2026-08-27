/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./dist/**/*.{html,js}",
    "./dist/**/*.html",
    "./dist/*.html",
    "./dist/criacao-de-sites/*.html",
    "./dist/seo-copy/*.html",
    "./dist/media-social/*.html",
    "./dist/identidade-visual/*.html",
    "./dist/trafego-pago/*.html",
    "./dist/automacoes-ia/*.html",
    "./dist/blog/*.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#A27A1A',
          'gold-hover': '#B88B22',
          'gold-light': '#D4AF37',
          'gold-subtle': 'rgba(162, 122, 26, 0.15)',
          dark: '#080C14',
          'dark-secondary': '#0E131F',
          card: '#121826',
          'card-hover': '#162033',
          border: '#28354D',
        }
      },
      fontFamily: {
        heading: ['Outfit', 'Montserrat', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
