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
        background: "#F8FAFC", // Slate 50
        foreground: "#0F172A", // Slate 900
        trust: {
          bg: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
          primary: "#4F46E5", // Indigo 600
          primaryHover: "#4338CA", // Indigo 700
          text: "#0F172A",
          muted: "#64748B",
          success: "#10B981"
        }
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'float': '0 20px 40px -20px rgba(79,70,229,0.15)',
      }
    },
  },
  plugins: [],
};
export default config;
