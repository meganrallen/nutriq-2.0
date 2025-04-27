import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        lato: ['var(--font-lato)', 'sans-serif'],
      },
      colors: {
        navy: {
          800: '#1a365d',
          900: '#0f2942',
        },
      },
    },
  },
  plugins: [],
};

export default config; 