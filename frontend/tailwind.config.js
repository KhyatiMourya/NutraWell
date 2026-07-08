/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          light: '#E8F5E9',
          hover: '#256428',
          soft: '#C8E6C9',
        },
        secondary: {
          DEFAULT: '#8E7CC3',
          light: '#F7F2FF',
          hover: '#7B68B0',
          soft: '#E8E2F8',
        },
        lavender: {
          DEFAULT: '#F7F2FF',
          mid: '#E8E2F8',
          dark: '#8E7CC3',
        },
        background: '#FAFAFA',
        card: '#FFFFFF',
        softgray: '#F5F5F5',
      },
      borderRadius: {
        'premium': '16px',
        'card': '12px',
      },
      boxShadow: {
        'premium': '0 2px 16px 0 rgba(46, 125, 50, 0.07), 0 1px 3px rgba(0,0,0,0.04)',
        'premium-hover': '0 8px 24px -4px rgba(46, 125, 50, 0.13), 0 2px 6px rgba(0,0,0,0.04)',
        'purple-soft': '0 2px 16px 0 rgba(142, 124, 195, 0.10), 0 1px 3px rgba(0,0,0,0.04)',
        'card': '0 1px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.10)',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
