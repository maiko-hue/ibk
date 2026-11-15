import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ibk: {
          green: "#00B14F",
          "green-dark": "#038A36",
          "green-wa": "#005E1F",
          "green-badge": "#00D13D",
          blue: "#0039A6",
          "dark-blue": "#002D72",
          "qr-blue": "#0137AB",
          "plin-teal": "#00D3A0",
          "bg-light": "#F7F9FA",
          "text-dark": "#333333",
          "text-muted": "#666666",
        },
      },
      fontFamily: {
        sans: ["'Geist'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        geist: ["'Geist'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        slideUp: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        spinLoader: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite linear",
        slideUp: "slideUp 0.3s ease-out forwards",
        spinLoader: "spinLoader 1s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
