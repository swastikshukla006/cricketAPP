import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16324A",
        paper: "#F6FBFF",
        accent: "#2F88C6",
        blossom: "#F4ADD1",
        meadow: "#B6D97C",
        ocean: "#1E6294",
        sky: "#EAF6FF"
      },
      fontFamily: {
        display: ["var(--font-display)", "Marcellus", "serif"],
        body: ["var(--font-body)", "Manrope", "system-ui", "sans-serif"]
      },
      boxShadow: {
        premium: "0 30px 90px rgba(30, 98, 148, 0.14)",
        line: "inset 0 0 0 1px rgba(22, 50, 74, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
