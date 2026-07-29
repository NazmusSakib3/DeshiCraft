/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#faf8f3',
        ink: '#1c231d',
        clay: {
          50: '#fbf1ec',
          100: '#f4dccf',
          200: '#e7b49d',
          300: '#d98b6c',
          400: '#c96a44',
          500: '#b5502e',
          600: '#933f24',
          700: '#70301c',
        },
        forest: {
          50: '#eef4ef',
          100: '#d3e3d6',
          200: '#a4c6ab',
          300: '#6fa079',
          400: '#437a4f',
          500: '#1f5c30',
          600: '#164a26',
          700: '#0f3319',
        },
        brass: {
          300: '#e3c56b',
          400: '#d3ab3f',
          500: '#b98f27',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      opacity: {
        8: '0.08',
        15: '0.15',
        85: '0.85',
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(28, 35, 29, 0.18)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'fade-in': 'fade-in 0.8s ease-out both',
      },
    },
  },
  plugins: [],
};
