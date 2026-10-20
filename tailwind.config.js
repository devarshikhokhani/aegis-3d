/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#070b14', // deepest navy background
          900: '#0b1324', // command surface
          850: '#0f1b33', // elevated panel
          800: '#142242', // border/divider
          700: '#1d3261', // subtle highlight
          600: '#2c4785',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          neon: '#00f0ff',
        },
        hazard: {
          green: '#10b981', // safe normal
          amber: '#f59e0b', // warning / anomaly
          red: '#ef4444',   // emergency / critical alarm
          fault: '#8b5cf6', // sensor fault / purple
          blue: '#3b82f6',  // info / system enable
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'siren': 'siren 1.5s ease-in-out infinite',
        'radar': 'radar 3s linear infinite',
      },
      keyframes: {
        siren: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
