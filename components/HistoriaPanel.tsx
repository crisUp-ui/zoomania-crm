'use client'
import { useState, useEffect } from 'react'
import { getHistoriaClinica, updateClienteNotas, createAlerta, deleteAlerta } from '@/lib/server-actions'
import { Icons } from './Icons'
import { useToast } from './Toast'

interface Props { clienteId: string; onClose: () => void }

function Chevron({ open }: { open: boolean }) {
  return (
    <span style={{ display: 'flex', flexShrink: 0, transition: 'transform 0.15s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
      <Icons.chevron size={13} />
    </span>
  )
}

export default function HistoriaPanel({ clienteId, onClose }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exp, setExp] = useState({ info: true, mascotas: true, historial: false, citas: true, alertas: true, notas: true })
  const [expandedPet, setExpandedPet] = useState<string | null>(null)
  const [notas, setNotas] = useState('')
  const [savingNotas, setSavingNotas] = useState(false)
  const toast = useToast()

  const load = async () => {
    setLoading(true)
    const result = await getHistoriaClinica(clienteId)
    setData(result)
    setNotas(result.cliente?.notas || '')
    setLoading(false)
  }

  useEffect(() => { load() }, [clienteId])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const toggle = (k: keyof typeof exp) => setExp(e => ({ ...e, [k]: !e[k] }))

  const guardarNotas = async () => {
    setSavingNotas(true)
    const { error } = await updateClienteNotas(clienteId, notas)
    setSavingNotas(false)
    if (error) { toast(error, 'error'); return }
    toast('Notas guardadas')
  }

  const eliminarAlerta = async (id: string) => {
    const { error } = await deleteAlerta(id)
    if (error) { toast(error, 'error'); return }
    load()
  }

  return (
    <div className="hp-overlay" onClick={onClose}>
      <div className="hp-panel" onClick={e => e.stopPropagation()}>
        <div className="hp-header">
          <div>
            <div className="hp-title">{loading ? 'Cargando…' : (data?.cliente?.nombre || '—')}</div>
            <div className="hp-sub">Historia clínica</div>
          </div>
          <button className="hp-close" onClick={onClose}><Icons.close /></button>
        </div>

        {loading && <div className="hp-loading">Cargando historia clínica…</div>}

        {!loading && data && (
          <div className="hp-body">

            {/* A: INFO CLIENTE */}
            <div className="hp-section">
              <button className="hp-section-head" onClick={() => toggle('info')}>
                <span>Info cliente</span><Chevron open={exp.info} />
              </button>
              {exp.info && (
                <div className="hp-section-body">
                  <div className="hp-info-row"><Icons.phone size={14} /><span>{data.cliente.telefono || '—'}</span></div>
                  <div className="hp-info-row"><Icons.mail size={14} /><span>{data.cliente.email || '—'}</span></div>
                  <div className="hp-info-row"><Icons.mappin size={14} /><span>{data.cliente.direccion || '—'}</span></div>
                </div>
              )}
            </div>

            {/* B: MASCOTAS */}
            <div className="hp-section">
              <button className="hp-section-head" onClick={() => toggle('mascotas')}>
                <span>Mascotas ({data.mascotas.length})</span><Chevron open={exp.mascotas} />
              </button>
              {exp.mascotas && (
                <div className="hp-section-body">
                  {data.mascotas.length === 0 && <div className="hp-empty">Sin mascotas registradas</div>}
                  {data.mascotas.map((m: any) => (
                    <div key={m.id} className="hp-pet-card" onClick={() => setExpandedPet(expandedPet === m.id ? null : m.id)}>
                      <div className="hp-pet-head">
                        <div className="hp-pet-avatar">🐾</div>
                        <div style={{ flex: 1 }}>
                          <div className="hp-pet-name">{m.nombre}</div>
                          <div className="hp-pet-meta">{m.raza || 'Sin raza'} · {m.edad_años ? m.edad_años + ' años' : 'Edad s/d'}</div>
                        </div>
                        <Chevron open={expandedPet === m.id} />
                      </div>
                      {expandedPet === m.id && (
                        <div className="hp-pet-details">
                          {m.tamaño && <span className="hp-tag">Tamaño: {m.tamaño}</span>}
                          {m.peso_kg && <span className="hp-tag">Peso: {m.peso_kg} kg</span>}
                          {m.temperamento && <span className="hp-tag">Temperamento: {m.temperamento}</span>}
                          {m.tipo_pelo && <span className="hp-tag">Pelo: {m.tipo_pelo}</span>}
                          {m.estado_pelaje && <span className="hp-tag">Pelaje: {m.estado_pelaje}</span>}
                          {m.notas_especiales && <div className="hp-pet-notas">📝 {m.notas_especiales}</div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* C: HISTORIAL */}
            <div className="hp-section">
              <button className="hp-section-head" onClick={() => toggle('historial')}>
                <span>Historial de visitas ({data.historial.length})</span><Chevron open={exp.historial} />
              </button>
              {exp.historial && (
                <div className="hp-section-body">
                  {data.historial.length === 0 && <div className="hp-empty">Sin visitas registradas</div>}
                  {data.historial.map((v: any) => (
                    <div key={v.id} className="hp-visit">
                      <div className="hp-visit-top">
                        <span className="hp-visit-svc">{v.servicio}</span>
                        <span className={`hp-visit-diff ${v.diferencia <= 0 ? 'diff-ok' : 'diff-late'}`}>
                          {v.diferencia > 0 ? `+${v.diferencia}` : v.diferencia}min
                        </span>
                      </div>
                      <div className="hp-visit-bot">
                        <span className="hp-visit-fecha">{v.fecha}</span>
                        <span className="hp-visit-mascota"> · {v.mascota}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* D: PRÓXIMAS CITAS */}
            <div className="hp-section">
              <button className="hp-section-head" onClick={() => toggle('citas')}>
                <span>Próximas citas ({data.proximasCitas.length})</span><Chevron open={exp.citas} />
              </button>
              {exp.citas && (
                <div className="hp-section-body">
                  {data.proximasCitas.length === 0 && <div className="hp-empty">Sin citas próximas</div>}
                  {data.proximasCitas.map((c: any) => (
                    <div key={c.id} className="hp-upcoming">
                      <div className="hp-upcoming-date">{c.fecha}</div>
                      <div className="hp-upcoming-time">{c.hora}</div>
                      <div className="hp-upcoming-svc">{c.servicio} · {c.mascota}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* E: ALERTAS MÉDICAS */}
            <div className="hp-section">
              <button className="hp-section-head" onClick={() => toggle('alertas')}>
                <span>Alertas médicas</span>
                {data.alertas.length > 0 && <span className="hp-alert-badge">{data.alertas.length}</span>}
                <Chevron open={exp.alertas} />
              </button>
              {exp.alertas && (
                <div className="hp-section-body">
                  {data.alertas.length === 0 && <div className="hp-empty">Sin alertas activas</div>}
                  {data.alertas.map((a: any) => (
                    <div key={a.id} className={`hp-alerta hp-alerta-${a.urgencia}`}>
                      <div>
                        <div className="hp-alerta-desc">{a.descripcion}</div>
                        <div className="hp-alerta-meta">
                          {a.mascota_nombre}{a.fecha_vencimiento ? ` · vence ${a.fecha_vencimiento}` : ''}
                        </div>
                      </div>
                      <button className="hp-alerta-del" onClick={() => eliminarAlerta(a.id)}><Icons.close size={12} /></button>
                    </div>
                  ))}
                  <AddAlertaForm mascotas={data.mascotas} onAdd={load} />
                </div>
              )}
            </div>

            {/* F: NOTAS */}
            <div className="hp-section">
              <button className="hp-section-head" onClick={() => toggle('notas')}>
                <span>Notas importantes</span><Chevron open={exp.notas} />
              </button>
              {exp.notas && (
                <div className="hp-section-body">
                  <textarea
                    className="hp-notas-input"
                    value={notas}
                    onChange={e => setNotas(e.target.value)}
                    placeholder="Ej: Prefiere citas por la mañana, paga solo en efectivo…"
                    rows={4}
                  />
                  <button className="btn btn-sm btn-primary" onClick={guardarNotas} disabled={savingNotas}>
                    {savingNotas ? 'Guardando…' : 'Guardar notas'}
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

function AddAlertaForm({ mascotas, onAdd }: { mascotas: any[]; onAdd: () => void }) {
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ mascota_id: '', tipo: 'vacuna', descripcion: '', fecha_vencimiento: '' })
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const guardar = async () => {
    if (!form.mascota_id || !form.descripcion) { toast('Completa los campos requeridos', 'error'); return }
    setSaving(true)
    const payload: any = { mascota_id: form.mascota_id, tipo: form.tipo, descripcion: form.descripcion }
    if (form.fecha_vencimiento) payload.fecha_vencimiento = form.fecha_vencimiento
    const { error } = await createAlerta(payload)
    setSaving(false)
    if (error) { toast(error, 'error'); return }
    toast('Alerta creada')
    setShow(false)
    setForm({ mascota_id: '', tipo: 'vacuna', descripcion: '', fecha_vencimiento: '' })
    onAdd()
  }

  if (!show) return (
    <button className="btn btn-sm btn-ghost" style={{ marginTop: 8 }} onClick={() => setShow(true)}>
      <Icons.plus size={12} /> Agregar alerta
    </button>
  )

  return (
    <div className="hp-add-alerta">
      <select value={form.mascota_id} onChange={e => setForm(f => ({ ...f, mascota_id: e.target.value }))}>
        <option value="">Seleccionar mascota…</option>
        {mascotas.map((m: any) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
      </select>
      <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
        <option value="vacuna">Vacuna</option>
        <option value="alergia">Alergia</option>
        <option value="comportamiento">Comportamiento</option>
        <option value="otro">Otro</option>
      </select>
      <input placeholder="Descripción…" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
      <input type="date" value={form.fecha_vencimiento} onChange={e => setForm(f => ({ ...f, fecha_vencimiento: e.target.value }))} title="Fecha vencimiento (opcional)" />
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-sm btn-primary" onClick={guardar} disabled={saving}>Guardar</button>
        <button className="btn btn-sm btn-ghost" onClick={() => setShow(false)}>Cancelar</button>
      </div>
    </div>
  )
}
