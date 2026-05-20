import type { Metadata } from 'next'
import { Sidebar } from '@/components/Sidebar'
import { BotIndicator } from '@/components/BotIndicator'
import { ToastProvider } from '@/components/Toast'
import GlobalSearch from '@/components/GlobalSearch'
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
            <div className="main-wrap">
              <div className="topbar">
                <GlobalSearch />
              </div>
              <main className="main">{children}</main>
            </div>
            <BotIndicator />
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
