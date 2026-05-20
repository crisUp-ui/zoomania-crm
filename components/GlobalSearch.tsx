'use client'
import { useState, useEffect, useRef } from 'react'
import { searchClientes } from '@/lib/server-actions'
import { Icons } from './Icons'
import HistoriaPanel from './HistoriaPanel'

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [mascotaId, setMascotaId] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return }
    const t = setTimeout(async () => {
      const data = await searchClientes(query)
      setResults(data)
      setOpen(true)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openMascota = (mid: string) => {
    setMascotaId(mid); setOpen(false); setQuery(''); setExpandedId(null)
  }

  const selectCliente = (r: any) => {
    if (!r.mascotas?.length) return
    if (r.mascotas.length === 1) { openMascota(r.mascotas[0].id); return }
    setExpandedId(expandedId === r.id ? null : r.id)
  }

  return (
    <>
      <div className="gs-wrap" ref={ref}>
        <div className="gs-input-wrap">
          <Icons.search size={15} />
          <input
            className="gs-input"
            placeholder="Buscar cliente, mascota, teléfono…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
          />
          {query && (
            <button className="gs-clear" onClick={() => { setQuery(''); setResults([]); setOpen(false) }}>
              <Icons.close size={13} />
            </button>
          )}
        </div>
        {open && (
          <div className="gs-dropdown">
            {results.length === 0
              ? <div className="gs-empty">Sin resultados para "{query}"</div>
              : results.map(r => (
                <div key={r.id}>
                  <div className="gs-item" onClick={() => selectCliente(r)}>
                    <div className="gs-item-name">{r.nombre}</div>
                    <div className="gs-item-meta">
                      {r.telefono}
                      {r.mascotas?.length ? ` · ${r.mascotas.map((m: any) => m.nombre).join(', ')}` : ''}
                    </div>
                  </div>
                  {expandedId === r.id && r.mascotas?.map((m: any) => (
                    <div key={m.id} className="gs-item" style={{ paddingLeft: 28, background: 'var(--zm-primary-bg)', fontSize: 13 }} onClick={() => openMascota(m.id)}>
                      <Icons.paw size={12} /> {m.nombre}
                    </div>
                  ))}
                </div>
              ))
            }
          </div>
        )}
      </div>
      {mascotaId && <HistoriaPanel mascotaId={mascotaId} onClose={() => setMascotaId(null)} />}
    </>
  )
}
