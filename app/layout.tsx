import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/query-provider'
import { Navbar } from '@/components/navbar'
import { validateSchema } from '@/lib/schema-validator'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EventApp',
  description: 'Your event management application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (process.env.NODE_ENV === 'development') {
    validateSchema();
  }
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}
