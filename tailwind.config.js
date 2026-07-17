/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B1626',
          900: '#0F1F3D',
          800: '#152A4E',
          700: '#1E3A5F',
          600: '#2A4E7A',
        },
        parchment: {
          50: '#FBFAF7',
          100: '#F5F3ED',
          200: '#EDEAE1',
        },
        gold: {
          400: '#D6B565',
          500: '#C89B3C',
          600: '#A67C2E',
        },
        priority: {
          critical: '#B3261E',
          high: '#C2622A',
          medium: '#B8860B',
          low: '#3E7A4C',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        seal: "radial-gradient(circle at center, rgba(200,155,60,0.15) 0%, rgba(200,155,60,0) 70%)",
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,31,61,0.06), 0 4px 12px rgba(15,31,61,0.06)',
        cardHover: '0 2px 4px rgba(15,31,61,0.08), 0 12px 24px rgba(15,31,61,0.10)',
      },
    },
  },
  plugins: [],
}
