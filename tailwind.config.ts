import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0f',
        'bg-card': '#12121a',
        'accent-green': '#00e676',
        'accent-red': '#ff1744',
        'accent-blue': '#2979ff',
        'text-primary': '#e0e0e0',
        'text-secondary': '#666680',
      },
    },
  },
  plugins: [],
}

export default config
