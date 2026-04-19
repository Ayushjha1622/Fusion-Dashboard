/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#00f2ff",
        "secondary": "#ffba35",
        "accent": "#ff4b4b",
        "background": "#0a0c0e",
        "surface": "#16181a",
        "surface-light": "#232527",
        "border": "rgba(58, 73, 76, 0.4)",
        "on-surface": "#e2e2e5",
        "on-surface-dim": "#849495",
        "neon-cyan": "#00f2ff",
        "neon-amber": "#ffba35",
        "neon-coral": "#ffb4ab",
      },
      fontFamily: {
        "orbitron": ["Orbitron", "sans-serif"],
        "mono": ["JetBrains Mono", "monospace"],
        "headline": ["Space Grotesk", "sans-serif"],
        "body": ["Inter", "sans-serif"],
      },
      backgroundImage: {
        'gradient-tactical': 'linear-gradient(135deg, rgba(0, 242, 255, 0.1) 0%, rgba(0, 242, 255, 0) 100%)',
        'glass-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
      }
    },
  },
  plugins: [],
}
