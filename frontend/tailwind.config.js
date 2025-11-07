/** @type {import('tailwindcss').Config} */
module.exports = {
   darkMode: 'class',
   content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
    theme: {
    extend: {
      colors: {
        blue: {
         "85": "#061E47",
          "75": "#0A3176",
          "70": "#0C3B8D",
          "60": "#104FBC",
          "50": "#2870ED",
          "40": "#4382EF",
          "30": "#72A1F3",
          "20": "#A1C0F7",
          "15": "#B8D0F9",
          "10": "#D0E0FB"
        },
        grey: {
          "85": "#1B2631",
          "75": "#2E4052",
          "70": "#374D62",
          "60": "#496683",
          "50": "#5B80A4",
          "40": "#7C99B6",
          "30": "#9DB2C8",
          "20": "#BDCCDB",
          "15": "#CED9E4",
          "10": "#E4EAF0"
        },
        stone: {
          "85": "#12293B",
          "75": "#1E4562",
          "70": "#245375",
          "60": "#306F9C",
          "50": "#3C8AC3",
          "40": "#63A2CF",
          "30": "#8AB9DB",
          "20": "#B1D0E7",
          "15": "#C4DCED",
          "10": "#D8E8F3"
        },
        text: {
          light: '#f9fafb',
          base: '#3b3b3c',
          soft: '#6b7280',
          muted: '#d1d5db',
        },
        dark: {
          primary: '#1a1a1e',
          secondary: '#121214',
          ternary: '#38383e'
        },
        light: {
          primary: '#fce7f3',
          secondary: '#edd9e5',
          ternary: '#ddcfd8'
        }
      }
    },
  },
  plugins: [],
}

