import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pulse — Uptime Monitor & Status',
  description: 'Self-hosted uptime monitoring and status page with real-time heartbeat tracking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a0f] text-[#e0e0e0] antialiased selection:bg-[#2979ff]/30 selection:text-white`}>
        {children}
      </body>
    </html>
  )
}
