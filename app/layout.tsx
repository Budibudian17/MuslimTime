import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { HistoryProvider } from '@/lib/contexts/HistoryContext'
import { UserCountProvider } from '@/lib/contexts/UserCountContext'
import { LoadingProvider } from '@/lib/contexts/LoadingContext'
import { ThemeProvider } from '@/components/theme-provider'
import OfflineIndicator from '@/components/offline-indicator'
import { offlineStorage } from '@/lib/services/offline-storage'

export const metadata: Metadata = {
  title: 'MuslimTime - Aplikasi Islami',
  description: 'Aplikasi untuk waktu sholat, Al-Quran, dan konten Islami',
  manifest: '/manifest.json',
  themeColor: '#0ea5e9',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MuslimTime',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="MuslimTime" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MuslimTime" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#0ea5e9" />
        
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/logo.png" color="#0ea5e9" />
        <link rel="shortcut icon" href="/logo.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Auto preload essential data for new users
              if (typeof window !== 'undefined') {
                // Check if this is first visit
                const hasVisited = localStorage.getItem('muslimtime_visited');
                if (!hasVisited) {
                  localStorage.setItem('muslimtime_visited', 'true');
                  // Preload will be triggered by client-side components
                }
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <HistoryProvider>
              <UserCountProvider>
                <LoadingProvider>
                  <OfflineIndicator />
                  {children}
                </LoadingProvider>
              </UserCountProvider>
            </HistoryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
