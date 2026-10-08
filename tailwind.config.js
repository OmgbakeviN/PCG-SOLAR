/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pcg: {
          ink: '#071B33',
          navy: '#0A2748',
          blue: '#0B74D1',
          sky: '#18A7F2',
          solar: '#F59E0B',
          amber: '#FFB30F',
          cream: '#FFF8EA',
          mist: '#EFF6FB',
        },
      },
      boxShadow: {
        soft: '0 24px 80px rgba(7, 27, 51, 0.12)',
        card: '0 16px 50px rgba(7, 27, 51, 0.08)',
      },
      backgroundImage: {
        'solar-grid':
          'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
