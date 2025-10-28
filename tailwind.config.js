/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // Only scan src directory, not node_modules
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Baloo 2', 'cursive'],
      },
    },
  },
  plugins: [],
}

