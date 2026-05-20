'use client'
import { useEffect } from 'react'
import { Icons } from './Icons'

type Props = {
  title: React.ReactNode
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
}

export function SidePanel({ title, subtitle, onClose, children }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(15,25,10,0.25)', display: 'block' }} />
      <aside className="side-panel">
        <div className="sp-head">
          <div>
            <div className="sp-name">{title}</div>
            {subtitle && <div className="sp-sub">{subtitle}</div>}
          </div>
          <button className="modal-close" onClick={onClose}><Icons.close /></button>
        </div>
        <div className="sp-body">{children}</div>
      </aside>
    </>
  )
}
