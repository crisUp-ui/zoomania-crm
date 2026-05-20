'use client'
import { useRef, useEffect } from 'react'
import { useFacturas } from '@/lib/hooks'
import { marcarFacturaPagada } from '@/lib/server-actions'
import { Icons } from '@/components/Icons'
import { useToast } from '@/components/Toast'

export default function Facturacion() {
  const { facturas, loading, refresh } = useFacturas()
  const toast = useToast()

  const total = facturas.reduce((s, f) => s + parseFloat(f.total), 0)
  const pendienteTotal = facturas.filter(f => f.estado === 'Pendiente').reduce((s, f) => s + parseFloat(f.total), 0)
  const pendienteCount = facturas.filter(f => f.estado === 'Pendiente').length

  const cobrar = async (id: string) => {
    const { error } = await marcarFacturaPagada(id)
    if (error) { toast(error, 'error'); return }
    toast('Factura marcada como pagada'); refresh()
  }

  const chartRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!chartRef.current) return
    let chart: any
    import('chart.js/auto').then(({ default: Chart }) => {
      if (!chartRef.current) return
      chart = new Chart(chartRef.current, {
        type: 'bar',
        data: {
          labels: ['Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May'],
          datasets: [{ data: [8200, 9100, 8800, 10200, 11500, 12300], backgroundColor: '#97C459', borderRadius: 6, maxBarThickness: 36 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#8B948A' } },
            y: { grid: { color: '#EEF1EA' }, ticks: { color: '#8B948A', callback: (v: any) => 'S/. ' + (v / 1000) + 'k' } },
          },
        },
      })
    })
    return () => chart?.destroy()
  }, [])

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Facturación</h1>
          <div className="page-sub">{facturas.length} facturas registradas</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary"><Icons.plus /> Nueva factura</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16, marginBottom: 16 }}>
        <div className="card metric">
          <div className="metric-label">Total cobrado</div>
          <div className="metric-value">S/. {total.toFixed(0)}</div>
          <div className="metric-delta">+12% vs. mes anterior</div>
        </div>
        <div className="card metric">
          <div className="metric-label">Por cobrar</div>
          <div className="metric-value" style={{ color: '#876615' }}>S/. {pendienteTotal.toFixed(0)}</div>
          <div className="metric-delta" style={{ color: '#876615' }}>{pendienteCount} pendientes</div>
        </div>
        <div className="card card-pad">
          <div className="section-title"><span>Ingresos últimos 6 meses</span></div>
          <div style={{ height: 120 }}><canvas ref={chartRef} /></div>
        </div>
      </div>

      <div className="card tbl-card">
        <table className="tbl">
          <thead>
            <tr><th># Factura</th><th>Cliente</th><th>Fecha</th><th style={{ textAlign: 'right' }}>Total</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--zm-text-3)' }}>Cargando…</td></tr>}
            {facturas.map(f => (
              <tr key={f._id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{f.id}</td>
                <td><b>{f.cliente}</b></td>
                <td style={{ color: 'var(--zm-text-2)' }}>{f.fecha}</td>
                <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>S/. {f.total}</td>
                <td>
                  <span className={'badge ' + (f.estado === 'Pagada' ? 'badge-green' : 'badge-yellow')}>{f.estado}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {f.estado === 'Pendiente'
                    ? <button className="btn btn-sm btn-primary" onClick={() => cobrar(f._id)}><Icons.cash size={14} /> Cobrar</button>
                    : <button className="btn btn-sm btn-ghost">Ver</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
