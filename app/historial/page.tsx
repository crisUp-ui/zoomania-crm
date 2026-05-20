'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { useHistorial } from '@/lib/hooks'
import { Icons } from '@/components/Icons'

export default function Historial() {
  const { historial, loading } = useHistorial()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    if (!q) return historial
    return historial.filter(h =>
      h.cliente.toLowerCase().includes(q) ||
      h.mascota.toLowerCase().includes(q) ||
      h.servicio.toLowerCase().includes(q)
    )
  }, [historial, query])

  const totalIngresos = filtered.reduce((s, h) => s + ((h as any).precio || 0), 0)
  const avgReal = filtered.length ? Math.round(filtered.reduce((s, h) => s + h.real, 0) / filtered.length) : 0
  const avgDiff = filtered.length ? Math.round(filtered.reduce((s, h) => s + h.diferencia, 0) / filtered.length) : 0

  const svcCount: Record<string, number> = {}
  filtered.forEach(h => { svcCount[h.servicio] = (svcCount[h.servicio] || 0) + 1 })
  const topSvc = Object.entries(svcCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  const chartRef = useRef<HTMLCanvasElement>(null)
  const monthlyData = useMemo(() => {
    const map: Record<string, { count: number; ingresos: number }> = {}
    historial.forEach((h: any) => {
      const mes = h.mes || ''
      if (!mes) return
      if (!map[mes]) map[mes] = { count: 0, ingresos: 0 }
      map[mes].count++
      map[mes].ingresos += h.precio || 0
    })
    const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
    return {
      labels: sorted.map(([m]) => { const [y, mo] = m.split('-'); return new Date(Number(y), Number(mo) - 1).toLocaleDateString('es-PE', { month: 'short', year: '2-digit' }) }),
      counts: sorted.map(([, v]) => v.count),
      ingresos: sorted.map(([, v]) => Math.round(v.ingresos)),
    }
  }, [historial])

  useEffect(() => {
    if (!chartRef.current) return
    let chart: any
    import('chart.js/auto').then(({ default: Chart }) => {
      if (!chartRef.current) return
      chart = new Chart(chartRef.current.getContext('2d')!, {
        type: 'bar',
        data: {
          labels: monthlyData.labels,
          datasets: [
            { label: 'Servicios', data: monthlyData.counts, backgroundColor: '#97C459', borderRadius: 5, yAxisID: 'y' },
            { label: 'Ingresos (S/.)', data: monthlyData.ingresos, backgroundColor: '#4A90D9', borderRadius: 5, yAxisID: 'y1' },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { font: { size: 11 }, color: '#8B948A' } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#8B948A', font: { size: 11 } } },
            y: { grid: { color: '#EEF1EA' }, ticks: { color: '#8B948A', font: { size: 11 }, stepSize: 1 }, beginAtZero: true, position: 'left' },
            y1: { grid: { display: false }, ticks: { color: '#4A90D9', font: { size: 11 } }, beginAtZero: true, position: 'right' },
          },
        },
      })
    })
    return () => chart?.destroy()
  }, [monthlyData])

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Historial de servicios</h1>
          <div className="page-sub">{historial.length} servicios completados en total</div>
        </div>
        <div className="page-actions">
          <div className="search">
            <Icons.search />
            <input
              placeholder="Buscar cliente, mascota o servicio…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="metric-grid">
        <div className="card metric">
          <div className="metric-head">
            <div className="metric-label">Servicios completados</div>
            <div className="metric-icon"><Icons.check size={20} /></div>
          </div>
          <div className="metric-value">{filtered.length}</div>
          {query && <div className="metric-delta">{historial.length} en total</div>}
        </div>
        <div className="card metric">
          <div className="metric-head">
            <div className="metric-label">Ingresos totales</div>
            <div className="metric-icon" style={{ background: '#D5F5E3', color: '#1A6B3D' }}><Icons.cash size={20} /></div>
          </div>
          <div className="metric-value">S/. {totalIngresos.toLocaleString('es-PE', { minimumFractionDigits: 0 })}</div>
        </div>
        <div className="card metric">
          <div className="metric-head">
            <div className="metric-label">Duración promedio</div>
            <div className="metric-icon" style={{ background: '#DCEBF7', color: '#1F5C92' }}><Icons.clock size={20} /></div>
          </div>
          <div className="metric-value">{avgReal} min</div>
          <div className="metric-delta" style={{ color: avgDiff > 5 ? 'var(--zm-red)' : 'var(--zm-primary-dark)' }}>
            {avgDiff > 0 ? '+' : ''}{avgDiff} min vs estimado
          </div>
        </div>
        <div className="card metric">
          <div className="metric-head">
            <div className="metric-label">Servicio más frecuente</div>
            <div className="metric-icon"><Icons.paw size={20} /></div>
          </div>
          <div className="metric-value" style={{ fontSize: 15, marginTop: 10 }}>{topSvc}</div>
          {svcCount[topSvc] && <div className="metric-delta">{svcCount[topSvc]} veces</div>}
        </div>
      </div>

      {historial.length > 0 && (
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <div className="section-title">
            <span>Tendencia mensual</span>
            <span className="muted">Últimos 6 meses</span>
          </div>
          <div className="chart-wrap"><canvas ref={chartRef} /></div>
        </div>
      )}

      <div className="card tbl-card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Fecha</th><th>Cliente</th><th>Mascota</th><th>Servicio</th>
              <th style={{ textAlign: 'right' }}>Estimado</th>
              <th style={{ textAlign: 'right' }}>Real</th>
              <th style={{ textAlign: 'right' }}>Diferencia</th>
              <th style={{ textAlign: 'right' }}>Precio</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--zm-text-3)' }}>Cargando…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--zm-text-3)' }}>
                {query ? 'Sin resultados para esta búsqueda' : 'Sin registros — las citas completadas aparecerán aquí'}
              </td></tr>
            )}
            {filtered.map(h => (
              <tr key={h.id}>
                <td style={{ color: 'var(--zm-text-2)' }}>{h.fecha}</td>
                <td><b>{h.cliente}</b></td>
                <td style={{ color: 'var(--zm-text-2)' }}>{h.mascota}</td>
                <td>{h.servicio}</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{h.estimado} min</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{h.real} min</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  <span className={h.diferencia < 0 ? 'diff-pos' : h.diferencia > 0 ? 'diff-neg' : 'diff-zero'}>
                    {h.diferencia > 0 ? '+' : ''}{h.diferencia} min
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--zm-primary-dark)', fontWeight: 600 }}>
                  S/. {((h as any).precio || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
