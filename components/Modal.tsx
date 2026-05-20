'use client'
import { useEffect } from 'react'
import { Icons } from './Icons'

type Props = {
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  large?: boolean
}

export function Modal({ title, onClose, children, footer, large }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={'modal' + (large ? ' modal-lg' : '')} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}><Icons.close /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}
