/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: { // Added fontFamily extension
        sans: ['var(--font-sans)', ...require('tailwindcss/defaultTheme').fontFamily.sans],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        paper: {
          light: "#FDF8F3", // Light warm paper color
          DEFAULT: "#FCF5EE", // Default warm paper color
          dark: "#2C1810", // Dark warm color for dark mode
        },
        parchment: {
          light: "#FBF3E7", // Light parchment
          DEFAULT: "#F9ECD7", // Default parchment
          dark: "#251610", // Dark parchment for dark mode
        },
        sepia: {
          light: "#E8C8A9", // Light sepia
          DEFAULT: "#D4A373", // Default sepia
          dark: "#8B5E34", // Dark sepia
        },
      },
      typography: (theme) => ({
        amber: {
          css: {
            "--tw-prose-body": theme("colors.amber.800"),
            "--tw-prose-headings": theme("colors.amber.900"),
            "--tw-prose-lead": theme("colors.amber.700"),
            "--tw-prose-links": theme("colors.amber.900"),
            "--tw-prose-bold": theme("colors.amber.900"),
            "--tw-prose-counters": theme("colors.amber.600"),
            "--tw-prose-bullets": theme("colors.amber.400"),
            "--tw-prose-hr": theme("colors.amber.300"),
            "--tw-prose-quotes": theme("colors.amber.900"),
            "--tw-prose-quote-borders": theme("colors.amber.300"),
            "--tw-prose-captions": theme("colors.amber.700"),
            "--tw-prose-code": theme("colors.amber.900"),
            "--tw-prose-pre-code": theme("colors.amber.100"),
            "--tw-prose-pre-bg": theme("colors.amber.900"),
            "--tw-prose-th-borders": theme("colors.amber.300"),
            "--tw-prose-td-borders": theme("colors.amber.200"),
            "--tw-prose-invert-body": theme("colors.amber.200"),
            "--tw-prose-invert-headings": theme("colors.amber.100"),
            "--tw-prose-invert-lead": theme("colors.amber.300"),
            "--tw-prose-invert-links": theme("colors.amber.100"),
            "--tw-prose-invert-bold": theme("colors.amber.100"),
            "--tw-prose-invert-counters": theme("colors.amber.400"),
            "--tw-prose-invert-bullets": theme("colors.amber.600"),
            "--tw-prose-invert-hr": theme("colors.amber.700"),
            "--tw-prose-invert-quotes": theme("colors.amber.100"),
            "--tw-prose-invert-quote-borders": theme("colors.amber.700"),
            "--tw-prose-invert-captions": theme("colors.amber.400"),
            "--tw-prose-invert-code": theme("colors.amber.100"),
            "--tw-prose-invert-pre-code": theme("colors.amber.300"),
            "--tw-prose-invert-pre-bg": theme("colors.amber.900"),
            "--tw-prose-invert-th-borders": theme("colors.amber.600"),
            "--tw-prose-invert-td-borders": theme("colors.amber.700"),
          },
        },
      }),
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
