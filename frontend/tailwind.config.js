/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#0B1120",
        surface: "#0F1629",
        "surface-2": "#131d35",
        "surface-3": "#1a2540",
        border: "#1e2d4a",
        "border-2": "#243457",
        primary: {
          DEFAULT: "#3B82F6",
          50: "#eff6ff",
          100: "#dbeafe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        violet: {
          DEFAULT: "#8B5CF6",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        muted: "#64748B",
        "muted-foreground": "#94A3B8",
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "blue-violet": "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
        "glow-blue": "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)",
        "glow-violet": "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(59,130,246,0.4), 0 0 40px rgba(59,130,246,0.1)",
        "glow-violet": "0 0 20px rgba(139,92,246,0.4), 0 0 40px rgba(139,92,246,0.1)",
        "card": "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-up": "slideUp 0.5s ease forwards",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
}
