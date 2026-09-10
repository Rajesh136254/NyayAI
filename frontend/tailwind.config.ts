/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NYAYAI Sovereign & Enterprise Color Palette
        navy: {
          50: "#f0f4fc",
          100: "#dbe5f7",
          200: "#b9cdf0",
          300: "#89ade6",
          400: "#5587d9",
          500: "#3267cb",
          600: "#2250b0",
          700: "#1d408f",
          800: "#1b3774",
          900: "#0B1B3D",
          950: "#060f24",
        },
        gold: {
          50: "#fdfbe8",
          100: "#fcf6c3",
          200: "#f8ec8a",
          300: "#f3dc4a",
          400: "#ecc61c",
          500: "#D4AF37",
          600: "#b58c27",
          700: "#916922",
          800: "#775422",
          900: "#654521",
        },
        surface: {
          light: "#FFFFFF",
          "light-subtle": "#F8FAFC",
          "light-border": "#E2E8F0",
          dark: "#0B1528",
          "dark-subtle": "#101D36",
          "dark-border": "#1E2D4A",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        heading: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
        card: "0 4px 20px -2px rgba(11, 27, 61, 0.08), 0 2px 6px -1px rgba(11, 27, 61, 0.04)",
        "card-dark": "0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.2)",
        glow: "0 0 20px rgba(212, 175, 55, 0.25)",
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
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in": "slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
