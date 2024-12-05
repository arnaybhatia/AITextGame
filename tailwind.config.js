/**
 * Tailwind CSS Configuration
 * Customizes the framework for Faustus chat application
 * 
 * Features:
 * - Custom animation for loading states
 * - Content scanning of HTML and JS files
 * - Extended theme configuration
 */
module.exports = {
  content: [
    "./static/**/*.{html,js}",
    "./static/styles/*.css"
  ],
  theme: {
    extend: {
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .5 },
        },
      },
      height: {
        'screen-dynamic': 'calc(var(--vh, 1vh) * 100)',
      }
    },
  },
  plugins: [],
}