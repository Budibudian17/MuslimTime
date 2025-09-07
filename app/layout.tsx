import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { HistoryProvider } from '@/lib/contexts/HistoryContext'
import { UserCountProvider } from '@/lib/contexts/UserCountContext'
import { LoadingProvider } from '@/lib/contexts/LoadingContext'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'MuslimTime - Aplikasi Islami',
  description: 'Aplikasi untuk waktu sholat, Al-Quran, dan konten Islami',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <HistoryProvider>
              <UserCountProvider>
                <LoadingProvider>
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
