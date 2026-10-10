import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F2F1EC",
        surface: "#FFFFFF",
        sunk: "#E4E3DC",
        ink: "#1A1D1A",
        soft: "#4D534C",
        faint: "#838A81",
        green: { DEFAULT: "#1C3A33", ink: "#F4F6F3", tint: "#E3ECE8" },
        gold: "#8C6F33",
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "Times New Roman", "serif"],
        sans: ["Public Sans", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      maxWidth: { site: "1200px" },
    },
  },
  plugins: [],
};
export default config;
