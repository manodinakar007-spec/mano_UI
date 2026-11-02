/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dde6ff',
          200: '#c2d1ff',
          300: '#9ab4ff',
          400: '#6b8eff',
          500: '#4066ff',
          600: '#2545f5',
          700: '#1d34e1',
          800: '#1e2eb6',
          900: '#1e2d8f',
          950: '#161d5c',
        },
        accent: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s 2s ease-in-out infinite',
        'blob': 'blob 8s ease-in-out infinite',
        'blob-delay': 'blob 8s 2.5s ease-in-out infinite',
        'blob-delay2': 'blob 8s 5s ease-in-out infinite',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(20px, -30px) scale(1.07)' },
          '66%': { transform: 'translate(-15px, 15px) scale(0.94)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      boxShadow: {
        'glow': '0 0 50px rgba(64, 102, 255, 0.3)',
        'glow-sm': '0 0 20px rgba(64, 102, 255, 0.2)',
        'brand-btn': '0 4px 16px rgba(37, 69, 245, 0.4)',
        'brand-btn-hover': '0 8px 28px rgba(37, 69, 245, 0.5)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.07), 0 20px 48px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
};
