/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],


    theme: {
    extend: {
      colors: {
        customBlue: "#2E86AB",
        customGray: "#2A2B2A",
        primaryBlack:'#010314',
        primaryDarkBlue: "#172b64",  // Vibrant Green background
        primaryLightBlue: "#552ACA",   // Deep Teal 
        primaryLightGray:'#DADADA',
        primaryWhite:'#E7DEFC',
        primaryRed: "#b82e2e",    // Strong Red
        primaryOrange: "#d96c06", // Warm Orange

        // New from your list
        midnightBlue: "#0A1229",         // Deep navy background (used twice, so one name)
        royalBlue: "#172B64",           // Already mapped as primaryDarkBlue
        vibrantOrange: "#FE5E15",       // Bright button color
        successGreen: "#3BBA3F",        // Status success, green
        slateGray: "#374151",           // Common UI dark gray
        deepNavy: "#101C40",            // Deeper version of midnight
        lightGrayish: "#E8E8E8",        // Background section(not yet used in the code )
        denimBlue: "#2A3D76",           // Muted blue for backgrounds/headings
        lightWhite: "#F7F7F7",       // Very light, clean white alt
        hoverSlate: "#444F6D",          // On hover background
        strokeGray: "#4C5879",          // Borders or strokes(Not yet used in the code )
      },
    },
  },
  plugins: [],
}


