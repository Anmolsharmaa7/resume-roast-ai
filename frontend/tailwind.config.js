/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#1e293b',
      },
    },
  },
  plugins: [],
}
