'use client'
import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { useCitas } from '@/lib/hooks'
import { Icons } from '@/components/Icons'

export default function Dashboard() {
  const today = new Date().toISOString().split('T')[0]
  const { citas } = useCitas(today)

  const completadas = citas.filter(c => c.estado === 'completada').length
  const pendientes = citas.filter(c => ['pendiente', 'retrasada', 'en-proceso'].includes(c.estado)).length
  const ingresos = citas.filter(c => c.estado === 'completada').reduce((s, c: any) => s + (c.precio || 0), 0)
  const proximas = citas.filter(c => ['pendiente', 'en-proceso', 'retrasada'].includes(c.estado)).slice(0, 3)

  const chartRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!chartRef.current) return
    let chart: any
    const counts = Array(14).fill(0) // 9am-10pm
    citas.forEach(c => {
      const h = parseInt((c.hora || '').split(':')[0])
      if (h >= 9 && h <= 22) counts[h - 9]++
    })
    import('chart.js/auto').then(({ default: Chart }) => {
      if (!chartRef.current) return
      const ctx = chartRef.current.getContext('2d')!
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm','10pm'],
          datasets: [{
            label: 'Citas',
            data: counts,
            backgroundColor: '#639922',
            borderRadius: 6,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#8B948A', font: { size: 11 } } },
            y: { grid: { color: '#EEF1EA' }, ticks: { color: '#8B948A', font: { size: 11 }, stepSize: 1 }, beginAtZero: true },
          },
        },
      })
    })
    return () => chart?.destroy()
  }, [citas])

  const todayStr = new Date().toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Buenas tardes, Rosa</h1>
          <div className="page-sub">{todayStr} · Resumen del día</div>
        </div>
        <div className="page-actions">
          <Link href="/agenda" className="btn btn-primary"><Icons.calendar /> Ver agenda</Link>
        </div>
      </div>

      <div className="metric-grid">
        <div className="card metric">
          <div className="metric-head">
            <div className="metric-label">Citas hoy</div>
            <div className="metric-icon"><Icons.calendar size={20} /></div>
          </div>
          <div className="metric-value">{citas.length}</div>
        </div>
        <div className="card metric">
          <div className="metric-head">
            <div className="metric-label">Completadas</div>
            <div className="metric-icon" style={{ background: '#DCEBF7', color: '#1F5C92' }}><Icons.check size={20} /></div>
          </div>
          <div className="metric-value">{completadas}</div>
          <div className="metric-delta">{citas.length > 0 ? Math.round(completadas / citas.length * 100) : 0}% del día</div>
        </div>
        <div className="card metric">
          <div className="metric-head">
            <div className="metric-label">Pendientes</div>
            <div className="metric-icon" style={{ background: '#FBEFC8', color: '#876615' }}><Icons.clock size={20} /></div>
          </div>
          <div className="metric-value">{pendientes}</div>
          <div className="metric-delta" style={{ color: '#876615' }}>
            {citas.filter(c => c.estado === 'retrasada').length} retrasada(s)
          </div>
        </div>
        <div className="card metric">
          <div className="metric-head">
            <div className="metric-label">Ingresos est.</div>
            <div className="metric-icon"><Icons.cash size={20} /></div>
          </div>
          <div className="metric-value">S/. {ingresos.toLocaleString('es-PE')}</div>
        </div>
      </div>

      {citas.some(c => c.estado === 'retrasada') && (
        <div style={{ marginBottom: 16 }}>
          <div className="alert alert-warn"><Icons.clock /><div><strong>Retraso detectado:</strong> Hay citas con retraso en la agenda.</div></div>
        </div>
      )}

      <div className="dash-grid">
        <div className="card card-pad">
          <div className="section-title">
            <span>Citas por hora</span>
            <span className="muted">Hoy · 9:00 – 22:00</span>
          </div>
          <div className="chart-wrap"><canvas ref={chartRef} /></div>
        </div>
        <div className="card card-pad">
          <div className="section-title">
            <span>Próximas citas</span>
            <Link href="/agenda" className="btn btn-ghost btn-sm">Ver todas <Icons.chevron size={14} /></Link>
          </div>
          {proximas.length === 0 && <p style={{ color: 'var(--zm-text-3)', fontSize: 13 }}>No hay citas pendientes</p>}
          {proximas.map(c => (
            <div key={c.id} className="upcoming-item">
              <div className="upcoming-time">{c.hora}</div>
              <div className="upcoming-body">
                <div className="upcoming-name">{c.clienteNombre}</div>
                <div className="upcoming-meta">{c.mascotaNombre} · {c.mascotaRaza}</div>
                <div className="upcoming-meta" style={{ marginTop: 3 }}>{c.servicio} · {c.duracion}min</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
