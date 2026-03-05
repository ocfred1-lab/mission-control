import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mission Control',
  description: 'Fred & Mitch Command Center',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className} style={{ background: 'var(--bg)', display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main className="flex-1 dot-grid min-h-screen overflow-auto" style={{ marginLeft: 0 }}>
          {children}
        </main>
      </body>
    </html>
  )
}
