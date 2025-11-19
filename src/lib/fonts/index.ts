import { Inter, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'

// Google Fonts with optimized loading
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  preload: false, // Only load when needed for code blocks
})

// Local custom font (Frutiger)
export const frutiger = localFont({
  src: [
    {
      path: '../../../public/Frutiger_bold.woff',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-frutiger',
  display: 'swap',
  preload: true,
})

// Font class names for easy usage
export const fontVariables = [
  inter.variable,
  jetbrainsMono.variable,
  frutiger.variable,
].join(' ')

// CSS custom properties for use in Tailwind config
export const fontFamilies = {
  sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-jetbrains-mono)', 'Consolas', 'monospace'],
  frutiger: ['var(--font-frutiger)', 'system-ui', 'sans-serif'],
}
