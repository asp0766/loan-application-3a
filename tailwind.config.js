/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lendswift: {
          blue: {
            50: '#f0f6fc',
            100: '#e1ecf7',
            200: '#c2d9ef',
            300: '#94bfe4',
            400: '#5c9ed3',
            500: '#1F4E79', // LendSwift Primary Blue
            600: '#183f63',
            700: '#13324f',
            800: '#0f273e',
            900: '#0b1c2d',
          },
          green: {
            50: '#f2faf5',
            100: '#e2f5ea',
            200: '#c5ebd5',
            300: '#96dbb5',
            400: '#5ec28d',
            500: '#27AE60', // LendSwift Accent Green
            600: '#1e8e4e',
            700: '#1a7140',
            800: '#175a35',
            900: '#144a2d',
          },
          red: {
            50: '#fdf3f2',
            100: '#fbe4e2',
            200: '#f8cdc9',
            300: '#f1aba4',
            400: '#e97c72',
            500: '#E74C3C', // Error Red
            600: '#d63031',
            700: '#b72223',
            800: '#982021',
            900: '#7e1f20',
          },
          amber: {
            50: '#fefbf2',
            100: '#fdf5e2',
            200: '#fbe8c0',
            300: '#f7d494',
            400: '#f4bc5e',
            500: '#F39C12', // Warning Amber
            600: '#d6820a',
            700: '#b2650c',
            800: '#904f11',
            900: '#774212',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
