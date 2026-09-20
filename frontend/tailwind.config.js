/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heading: ['Anton', 'sans-serif'],
        calligraphy: ['Satisfy', 'cursive'],
        script: ['Caveat', 'cursive'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        gunmetal: {
          950: '#0B0F14',
          900: '#121820',
          800: '#1B2430',
          700: '#283545',
          600: '#3A4B60',
          accent: '#38BDF8',
        },
        maroon: {
          950: '#14070A',
          900: '#220B11',
          800: '#35111B',
          700: '#4D1827',
          600: '#6B2236',
          accent: '#FB7185',
        }
      }
    },
  },
  plugins: [],
}
