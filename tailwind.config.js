const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./App.js", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Every colour resolves to a CSS variable in global.css. The
      // <alpha-value> placeholder is what makes bg-primary/50 work.
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        // Extras beyond the shadcn set, from the Modern pattern
        "text-2": "hsl(var(--text-2) / <alpha-value>)",
        "line-soft": "hsl(var(--line-soft) / <alpha-value>)",
        link: "hsl(var(--link) / <alpha-value>)",
      },
      /*
       * React Native has no synthetic weights — each weight is a separate
       * loaded family, so pick the family, not `font-medium`/`font-bold`.
       * The keys are deliberately NOT `medium`/`semibold`/`bold`: those would
       * collide with Tailwind's own font-weight utilities of the same name.
       *
       *   font-sans           body            font-sans-semibold  headings
       *   font-sans-medium    labels          font-sans-bold      titles
       *   font-mono           #, ids, units
       */
      fontFamily: {
        sans: ["Onest_400Regular"],
        "sans-medium": ["Onest_500Medium"],
        "sans-semibold": ["Onest_600SemiBold"],
        "sans-bold": ["Onest_700Bold"],
        mono: ["JetBrainsMono_400Regular"],
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
