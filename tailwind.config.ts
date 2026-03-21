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
  			background: '#050505',
  			foreground: '#ffffff',
  			sidebar: {
  				DEFAULT: '#080808',
  				foreground: '#a1a1aa',
  				primary: '#6366f1',
  				'primary-foreground': '#ffffff',
  				accent: '#18181b',
  				'accent-foreground': '#ffffff',
  				border: '#27272a',
  				ring: '#6366f1'
  			}
  		}
  	}
  },
  plugins: [],
};
export default config;
