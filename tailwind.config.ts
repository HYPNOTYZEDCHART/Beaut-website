import type { Config } from 'tailwindcss';

const config: Config = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        powdery: {
          surface: '#FDF8F9',
          border: '#F3E1E6',
          pill: '#F9EBEF',
          accent: '#D88B99',
          cta: '#C47482',
          ctaHover: '#B36270',
        },
        ink: {
          primary: '#1C191A',
          secondary: '#786B6E',
        },
        semantic: {
          sageText: '#2E7D5B',
          sageBg: '#EBF5F0',
          amberText: '#B4690E',
          amberBg: '#FDF4E7',
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        powdery: '0 8px 30px rgb(216, 139, 153, 0.08)',
        powderyLg: '0 14px 40px rgb(216, 139, 153, 0.13)',
      },
      transitionTimingFunction: {
        'emil-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'emil-in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
        'emil-drawer': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
};

export default config;

