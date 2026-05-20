'use client'
import { useState, useEffect, useRef } from 'react'
import { searchClientes } from '@/lib/server-actions'
import { Icons } from './Icons'
import HistoriaPanel from './HistoriaPanel'

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
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

  const select = (id: string) => { setSelectedId(id); setOpen(false); setQuery('') }

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
                <div key={r.id} className="gs-item" onClick={() => select(r.id)}>
                  <div className="gs-item-name">{r.nombre}</div>
                  <div className="gs-item-meta">
                    {r.telefono}
                    {r.mascotas?.length ? ` · ${r.mascotas.map((m: any) => m.nombre).join(', ')}` : ''}
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
      {selectedId && <HistoriaPanel clienteId={selectedId} onClose={() => setSelectedId(null)} />}
    </>
  )
}
