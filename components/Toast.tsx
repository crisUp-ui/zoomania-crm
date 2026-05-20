'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import { Icons } from './Icons'

type ToastType = 'success' | 'error' | 'info'
type Toast = { id: number; msg: string; type: ToastType }

const Ctx = createContext<(msg: string, type?: ToastType) => void>(() => {})

export function useToast() { return useContext(Ctx) }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((msg: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  return (
    <Ctx.Provider value={show}>
      {children}
      <div style={{ position: 'fixed', bottom: 100, right: 22, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 200 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === 'error' ? 'var(--zm-red)' : t.type === 'info' ? 'var(--zm-blue)' : 'var(--zm-primary)',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            boxShadow: 'var(--zm-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            maxWidth: 320,
            animation: 'rise 0.2s ease',
          }}>
            {t.type === 'error' ? <Icons.alert size={15} /> : <Icons.check size={15} />}
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
