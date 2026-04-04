import type { Metadata, Viewport } from 'next'
import { DM_Sans, Shizuru, Kiwi_Maru } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { MascotProvider } from '@/lib/mascot-context'
import './globals.css'

const shizuru = Shizuru({
  subsets: ['latin'],
  variable: '--font-logo',
  weight: '400',
  display: 'swap',
})

const kiwiMaru = Kiwi_Maru({
  subsets: ['latin'],
  variable: '--font-roshi',
  weight: '400',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
})


export const metadata: Metadata = {
  title: "Roshi's Word Game",
  description: 'Dare your friends with words. Prove you know them.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: "Roshi's Word Game" },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2e8d5' },
    { media: '(prefers-color-scheme: dark)',  color: '#0f1729' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${kiwiMaru.variable} ${shizuru.variable}`}>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <MascotProvider>
            {children}
          </MascotProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
