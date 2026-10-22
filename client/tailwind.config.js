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
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a8f7',
          500: '#0e8ceb',
          600: '#026fc9',
          700: '#0358a3',
          800: '#074b86',
          900: '#0c3f6f',
          950: '#082849',
        },
        paper: '#f8fafc',
        bookleaf: {
          dark: '#0f172a',
          card: '#1e293b',
          accent: '#10b981',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
