/** @type {import('tailwindcss').Config} */
export default {
  // Scan all TSX/TS files in src for Tailwind class usage
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Custom weather-themed color palette
      colors: {
        sunny: {
          light: '#FFD700',
          DEFAULT: '#FFA500',
          dark: '#FF8C00',
        },
        rainy: {
          light: '#607D8B',
          DEFAULT: '#455A64',
          dark: '#37474F',
        },
        cloudy: {
          light: '#CFD8DC',
          DEFAULT: '#B0BEC5',
          dark: '#78909C',
        },
        snowy: {
          light: '#E3F2FD',
          DEFAULT: '#BBDEFB',
          dark: '#90CAF9',
        },
        stormy: {
          light: '#7B1FA2',
          DEFAULT: '#4A148C',
          dark: '#263238',
        },
      },
      // Custom animation for modal and card interactions
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
