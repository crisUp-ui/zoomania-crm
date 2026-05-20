'use client'
import { useState, useEffect } from 'react'
import { Icons } from './Icons'

const STATES = [
  ['+51 999 888 777'],
  [],
  ['+51 987 654 321', '+51 912 345 678'],
  ['+51 943 567 890'],
  [],
  ['+51 921 098 765'],
]

export function BotIndicator() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % STATES.length), 5000)
    return () => clearInterval(id)
  }, [])

  const activos = STATES[idx]
  const active = activos.length > 0

  return (
    <div className="bot" title="Bot de WhatsApp">
      <div className="bot-icon">
        <Icons.bot size={22} />
        <span className={'bot-dot' + (active ? ' active' : '')} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="bot-label">Bot WhatsApp</div>
        {active ? (
          <div className="bot-value">
            {activos[0]}
            {activos.length > 1 && (
              <span style={{ color: 'var(--zm-text-3)', fontWeight: 500, marginLeft: 6 }}>
                +{activos.length - 1}
              </span>
            )}
          </div>
        ) : (
          <div className="bot-value muted">Sin conversaciones</div>
        )}
      </div>
    </div>
  )
}
