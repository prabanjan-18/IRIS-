/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sapphire Blue Color System for Typography & Accents
        sapphire: {
          900: '#0B192C',
          800: '#0F2537',
          700: '#162B40',
          600: '#1E3A5A',
          500: '#254E7A',
          400: '#3A6B9F',
          300: '#5B8ABF',
          200: '#8AAECF',
          100: '#E6EFF8',
        },
        // Photo Color Palette (Light Cyan & Frosted Blue)
        frosted: {
          100: '#E0FAFF', // Light Cyan (HEX E0FAFF from photo)
          300: '#9FE2EE', // Frosted Blue (HEX 9FE2EE from photo)
          500: '#254E7A', // Re-mapped accent to Sapphire Blue
          700: '#162B40', // Deep Sapphire accent
          900: '#0B192C', // Deepest Sapphire
        },
        // Container Surfaces
        ink: {
          900: '#E0FAFF', // Light Cyan background base
          800: '#F4FAFC', // Softest frosted panel background
          700: '#FFFFFF', // Crisp White card container background
          600: '#EAF6FA', // Hover card surface
          500: '#CBEBF3', // Subtle Cyan border
        },
        // Text & Typography remapped strictly to Sapphire
        mist: {
          100: '#0B192C', // Deepest Sapphire for primary headings & text
          200: '#0F2537', // Deep Sapphire for body text
          300: '#1E3A5A', // Rich Sapphire for secondary text
          400: '#3A6B9F', // Muted Sapphire for captions & placeholders
        },
        triage: {
          self: '#15803D',
          caution: '#B45309',
          urgent: '#C2410C',
        },
        lavender: {
          100: '#E8E0F5',
          200: '#D4C4EE', // Soft Lavender from photo background
          300: '#B8A3E0',
          400: '#9B84C9',
          500: '#7E68B0',
        },
      },
      fontFamily: {
        display: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'Public Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'frosted-glow': '0 0 24px rgba(159, 226, 238, 0.45)',
        'card-glow': '0 4px 20px rgba(37, 78, 122, 0.08)',
        'soft': '0 2px 10px rgba(15, 37, 55, 0.05)',
        'glass': '0 8px 32px rgba(159, 226, 238, 0.25)',
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #E0FAFF 0%, #D4C4EE 50%, #B8A3E0 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #F4FAFC 0%, #E8E0F5 100%)',
        'gradient-card': 'linear-gradient(135deg, #FFFFFF 0%, #E0FAFF 100%)',
      },
    },
  },
  plugins: [],
}
