const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['var(--font-sans)', ...fontFamily.sans],
      mono: ['var(--font-mono)', ...fontFamily.mono],
    },
    fontSize: {
      xs: ['0.75rem', '0.875rem'],
      sm: ['0.8125rem', '1rem'],
      base: ['0.875rem', '1.125rem'],
      lg: ['1rem', '1.125rem'],
      xl: ['1.25rem', '1.5rem'],
      '2xl': ['1.5rem', '1.75rem'],
    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        scroll: 'hsl(var(--scroll))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        sidebar: 'hsl(var(--sidebar-background))',
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        cell: '34px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        mono: ['var(--font-mono)', ...fontFamily.mono],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      boxShadow: {
        focus:
          '0px 0px 0px 4px rgba(79, 70, 229, 0.25), 0px 0px 0px 1px #4F46E5',
        xs: '0 0 0 1px hsla(var(--shadow)), 0 1px 1px hsla(var(--shadow)), 0 2px 2px hsla(var(--shadow))',
        sm: '0 0 0 1px hsla(var(--shadow)), 0 1px 1px hsla(var(--shadow)), 0 2px 2px hsla(var(--shadow)), 0 4px 4px hsla(var(--shadow))',
        lg: '0 0 0 1px hsla(var(--shadow)), 0 1px 1px hsla(var(--shadow)), 0 2px 2px hsla(var(--shadow)), 0 4px 4px hsla(var(--shadow)), 0 8px 8px hsla(var(--shadow))',
        xl: '0 0 0 1px hsla(var(--shadow)), 0 1px 1px hsla(var(--shadow)), 0 2px 2px hsla(var(--shadow)), 0 4px 4px hsla(var(--shadow)), 0 8px 8px hsla(var(--shadow)), 0 16px 16px hsla(var(--shadow))',
      },
      ringColor: {
        DEFAULT: 'hsl(var(--ring))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
