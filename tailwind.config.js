/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#fbf6ef",
        champagne: "#f3e7d8",
        taupe: "#a08369",
        mocha: "#6e5846",
        blush: "#e7d0c1",
        sage: "#d9ccb7",
        sand: "#e3d2bc",
        mist: "#fffefd",
      },
      fontFamily: {
        body: ["Manrope", "sans-serif"],
        serif: ['"Cormorant Garamond"', "serif"],
        script: ['"Corinthia"', "cursive"],
      },
      boxShadow: {
        editorial: "0 20px 80px rgba(103, 75, 49, 0.10)",
        soft: "0 12px 35px rgba(120, 93, 68, 0.10)",
        float: "0 28px 90px rgba(102, 72, 48, 0.18)",
      },
      backgroundImage: {
        paper:
          "linear-gradient(180deg, rgba(255,255,255,0.995), rgba(255,254,251,0.985)), url('../assets/paper-texture.svg')",
        blushGlow:
          "radial-gradient(circle at top, rgba(248, 242, 236, 0.18), transparent 48%)",
        sageGlow:
          "radial-gradient(circle at bottom right, rgba(248, 243, 237, 0.1), transparent 42%)",
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeRise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
      },
      animation: {
        floatSlow: "floatSlow 8s ease-in-out infinite",
        fadeRise: "fadeRise 0.9s ease forwards",
      },
      maxWidth: {
        editorial: "1180px",
      },
    },
  },
  plugins: [],
};
