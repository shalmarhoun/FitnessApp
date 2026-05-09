import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pearl: "#FFFFFF",
        cloud: "#FAF8FC",
        mist: "#F4F0FF",
        silk: "#E8DEFF",
        lilac: "#C9B6FF",
        lavender: "#8F6FE8",
        plum: "#49335F",
        ink: "#22172E",
        blush: "#F5C8D7",
        mauve: "#D8A7C5",
        sage: "#A8C7B5",
        champagne: "#E8D8AE",
      },
      boxShadow: {
        lavender: "0 18px 50px rgba(91, 64, 132, 0.12)",
        glow: "0 12px 28px rgba(143, 111, 232, 0.26)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;

