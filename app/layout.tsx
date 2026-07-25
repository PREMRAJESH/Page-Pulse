import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AnimatedBackground } from '@/components/layout/AnimatedBackground'
import './globals.css'

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Page Pulse — URL Audit Tool',
  description: 'Get a structural audit of any web page: HTTP status, response time, title, meta description, H1 count, images missing alt text, and word count.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        <AnimatedBackground />
        {children}
      </body>
    </html>
  )
}
