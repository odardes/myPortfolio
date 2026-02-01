import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'

export const metadata: Metadata = {
  title: 'Yatırım Portföyüm',
  description: 'Yatırımlarınızı takip edin ve analiz edin',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Yatırım Portföyüm',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Portföyüm" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased bg-gray-50 dark:bg-gray-900 transition-colors">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
