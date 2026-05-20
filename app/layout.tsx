import type { Metadata } from 'next'
import { Sidebar } from '@/components/Sidebar'
import { BotIndicator } from '@/components/BotIndicator'
import { ToastProvider } from '@/components/Toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zoomania CRM',
  description: 'Sistema de agendamiento veterinario',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ToastProvider>
          <div className="app">
            <Sidebar />
            <main className="main">{children}</main>
            <BotIndicator />
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
