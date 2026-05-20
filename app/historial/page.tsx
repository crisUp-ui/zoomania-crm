'use client'
import { useHistorial } from '@/lib/hooks'

export default function Historial() {
  const { historial, loading } = useHistorial()

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Historial de servicios</h1>
          <div className="page-sub">Comparación entre tiempos estimados y reales</div>
        </div>
      </div>

      <div className="card tbl-card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Fecha</th><th>Cliente</th><th>Mascota</th><th>Servicio</th>
              <th style={{ textAlign: 'right' }}>Estimado</th>
              <th style={{ textAlign: 'right' }}>Real</th>
              <th style={{ textAlign: 'right' }}>Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--zm-text-3)' }}>Cargando…</td></tr>
            )}
            {!loading && historial.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--zm-text-3)' }}>Sin registros</td></tr>
            )}
            {historial.map(h => (
              <tr key={h.id}>
                <td style={{ color: 'var(--zm-text-2)' }}>{h.fecha}</td>
                <td>{h.cliente}</td>
                <td>{h.mascota}</td>
                <td>{h.servicio}</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{h.estimado} min</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{h.real} min</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  <span className={h.diferencia < 0 ? 'diff-pos' : h.diferencia > 0 ? 'diff-neg' : 'diff-zero'}>
                    {h.diferencia > 0 ? '+' : ''}{h.diferencia} min
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
