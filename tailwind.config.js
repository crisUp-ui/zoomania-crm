/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'vet-green': '#10b981',
        'vet-blue': '#0ea5e9',
        'vet-light': '#f0fdf4',
      },
    },
  },
  plugins: [],
}
