import typography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{astro,js,ts,md}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      colors: {
        ink: {
          950: "#0b0d12",
          900: "#0f141c",
          800: "#141b25",
          200: "#d7dde7",
          100: "#eef2f8"
        },
        accent: {
          600: "#1b9aaa",
          500: "#22b6c7",
          400: "#3ed6e5"
        }
      },
      boxShadow: {
        soft: "0 10px 35px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: [typography]
};
