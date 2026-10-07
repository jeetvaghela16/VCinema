/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vc-bg-base': 'var(--vc-bg-base)',
        'vc-bg-elevated': 'var(--vc-bg-elevated)',
        'vc-bg-card': 'var(--vc-bg-card)',
        'vc-text-primary': 'var(--vc-text-primary)',
        'vc-text-muted': 'var(--vc-text-muted)',
        'vc-gold': 'var(--vc-gold)',
        'vc-burgundy': 'var(--vc-burgundy)',
        'vc-border': 'var(--vc-border)',
      }
    },
  },
  plugins: [],
}
