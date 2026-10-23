/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f3',
          100: '#ffe4e8',
          200: '#fecdd6',
          300: '#fda4b4',
          400: '#fb718a',
          500: '#eb5467', // BookLeaf Coral
          600: '#de4357',
          700: '#c52e42',
          800: '#ba2c43', // Back cover shadow
          900: '#8c1c2d',
          950: '#4c0813',
        },
        bookleaf: {
          coral: '#eb5467',
          shadow: '#ba2c43',
          dark: '#1e293b',
          light: '#fff5f6',
          soft: '#ffeef1',
        },
        // Harmonize emerald & teal into BookLeaf coral & rose so the entire app reflects the new theme
        emerald: {
          50: '#fff1f3',
          100: '#ffe4e8',
          200: '#fecdd6',
          300: '#fda4b4',
          400: '#fb718a',
          500: '#eb5467',
          600: '#de4357',
          700: '#c52e42',
          800: '#ba2c43',
          900: '#8c1c2d',
          950: '#4c0813',
        },
        teal: {
          50: '#fff5f6',
          100: '#ffe8eb',
          200: '#ffd1d8',
          300: '#fbaab7',
          400: '#f6788d',
          500: '#eb5467',
          600: '#de4357',
          700: '#c52e42',
          800: '#ba2c43',
          900: '#8c1c2d',
          950: '#4c0813',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
