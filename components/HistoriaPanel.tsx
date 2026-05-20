'use client'
import { useState, useEffect } from 'react'
import { getHistoriaClinicaMascota, updateMascota, createAlerta, deleteAlerta } from '@/lib/server-actions'
import { Icons } from './Icons'
import { useToast } from './Toast'

const TAMAÑO_COLOR: Record<string, [string, string]> = {
  'Pequeño': ['#DBEAFE', '#1E3A8A'],
  'Mediano': ['#FEF3C7', '#92400E'],
  'Grande':  ['#FEE2E2', '#991B1B'],
}
const ESPECIE_COLOR: Record<string, [string, string]> = {
  'Perro':   ['#E8F4D9', '#3D6614'],
  'Gato':    ['#FDEBD0', '#784A15'],
  'Conejo':  ['#FCEEF8', '#7B2560'],
  'Ave':     ['#FEF9E7', '#7D6008'],
  'Iguana':  ['#D5F5E3', '#1A6B3D'],
  'Reptil':  ['#E8DAEF', '#5B2C8D'],
  'Hámster': ['#FAE5D3', '#7D3C10'],
  'Hurón':   ['#DBEAFE', '#1E40AF'],
  'Pez':     ['#CCEEFF', '#0066AA'],
  'Otro':    ['#F2F3F4', '#4D5656'],
}
const badgeStyle = (map: Record<string, [string, string]>, key: string) => {
  const [bg, color] = map[key] || ['#F2F3F4', '#4D5656']
  return { background: bg, color, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, display: 'inline-block' }
}

function Chevron({ open }: { open: boolean }) {
  return (
    <span style={{ display: 'flex', flexShrink: 0, transition: 'transform 0.15s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
      <Icons.chevron size={13} />
    </span>
  )
}

interface Props { mascotaId: string; onClose: () => void }

export default function HistoriaPanel({ mascotaId, onClose }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exp, setExp] = useState({ info: true, historial: false, citas: true, alertas: true })
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const load = async () => {
    setLoading(true)
    const r = await getHistoriaClinicaMascota(mascotaId)
    setData(r)
    if (r.mascota) setForm({
      raza: r.mascota.raza, edad_años: r.mascota.edad_años || '',
      peso_kg: r.mascota.peso_kg || '', tamaño: r.mascota.tamaño || 'Mediano',
      temperamento: r.mascota.temperamento || 'Tranquilo',
      tipo_pelo: r.mascota.tipo_pelo || 'Corto',
      estado_pelaje: r.mascota.estado_pelaje || 'Bueno',
      notas_especiales: r.mascota.notas_especiales || '',
    })
    setLoading(false)
  }

  useEffect(() => { load() }, [mascotaId])
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const toggle = (k: keyof typeof exp) => setExp(e => ({ ...e, [k]: !e[k] }))

  const guardar = async () => {
    setSaving(true)
    const { error } = await updateMascota(mascotaId, {
      raza: form.raza, edad_años: Number(form.edad_años) || null,
      peso_kg: Number(form.peso_kg) || null, tamaño: form.tamaño,
      temperamento: form.temperamento, tipo_pelo: form.tipo_pelo,
      estado_pelaje: form.estado_pelaje, notas_especiales: form.notas_especiales,
    })
    setSaving(false)
    if (error) { toast(error, 'error'); return }
    toast('Datos actualizados'); setEditando(false); load()
  }

  const eliminarAlerta = async (id: string) => {
    const { error } = await deleteAlerta(id)
    if (error) { toast(error, 'error'); return }
    load()
  }

  const F = (k: string) => (e: any) => setForm((f: any) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="hp-overlay" onClick={onClose}>
      <div className="hp-panel" onClick={e => e.stopPropagation()}>

        <div className="hp-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="hp-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {loading ? 'Cargando…' : data?.mascota?.nombre}
              {!loading && data?.mascota && (
                <span style={badgeStyle(ESPECIE_COLOR, data.mascota.especie)}>{data.mascota.especie}</span>
              )}
            </div>
            <div className="hp-sub">
              Historia clínica
              {!loading && data?.mascota?.cliente && ` · Dueño: ${data.mascota.cliente.nombre}`}
            </div>
          </div>
          <button className="hp-close" onClick={onClose}><Icons.close /></button>
        </div>

        {loading && <div className="hp-loading">Cargando historia clínica…</div>}

        {!loading && data && (
          <div className="hp-body">

            {/* A: DATOS DE LA MASCOTA */}
            <div className="hp-section">
              <button className="hp-section-head" onClick={() => toggle('info')}>
                <span>Datos de la mascota</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                  {exp.info && !editando && (
                    <span className="hp-icon-btn" onClick={e => { e.stopPropagation(); setEditando(true) }}><Icons.edit size={13} /></span>
                  )}
                  <Chevron open={exp.info} />
                </span>
              </button>
              {exp.info && (
                <div className="hp-section-body">
                  {!editando ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                      {[
                        ['RAZA', data.mascota.raza || '—'],
                        ['EDAD', data.mascota.edad_años ? data.mascota.edad_años + ' años' : '—'],
                        ['PESO', data.mascota.peso_kg ? data.mascota.peso_kg + ' kg' : '—'],
                        ['TEMPERAMENTO', data.mascota.temperamento || '—'],
                        ['TIPO DE PELO', data.mascota.tipo_pelo || '—'],
                        ['ESTADO PELAJE', data.mascota.estado_pelaje || '—'],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <div style={{ fontSize: 10.5, color: 'var(--zm-text-3)', fontWeight: 700, letterSpacing: '0.03em' }}>{label}</div>
                          <div style={{ fontSize: 13.5, marginTop: 2 }}>{val}</div>
                        </div>
                      ))}
                      <div style={{ gridColumn: '1/-1' }}>
                        <div style={{ fontSize: 10.5, color: 'var(--zm-text-3)', fontWeight: 700, letterSpacing: '0.03em' }}>TAMAÑO</div>
                        <div style={{ marginTop: 4 }}><span style={badgeStyle(TAMAÑO_COLOR, data.mascota.tamaño)}>{data.mascota.tamaño || '—'}</span></div>
                      </div>
                      {data.mascota.notas_especiales && (
                        <div style={{ gridColumn: '1/-1' }}>
                          <div style={{ fontSize: 10.5, color: 'var(--zm-text-3)', fontWeight: 700, letterSpacing: '0.03em' }}>OBSERVACIONES</div>
                          <div style={{ fontSize: 13, color: 'var(--zm-text-2)', marginTop: 2 }}>{data.mascota.notas_especiales}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="hp-form">
                      <div className="hp-form-row">
                        <input placeholder="Raza" value={form.raza} onChange={F('raza')} />
                        <select value={form.tamaño} onChange={F('tamaño')}>{['Pequeño','Mediano','Grande'].map(t => <option key={t}>{t}</option>)}</select>
                      </div>
                      <div className="hp-form-row">
                        <input type="number" placeholder="Edad (años)" value={form.edad_años} onChange={F('edad_años')} />
                        <input type="number" placeholder="Peso (kg)" step="0.1" value={form.peso_kg} onChange={F('peso_kg')} />
                      </div>
                      <div className="hp-form-row">
                        <select value={form.temperamento} onChange={F('temperamento')}>{['Tranquilo','Nervioso','Agresivo','Juguetón','Tímido'].map(t => <option key={t}>{t}</option>)}</select>
                        <select value={form.tipo_pelo} onChange={F('tipo_pelo')}>{['Corto','Medio','Largo','Rizado'].map(t => <option key={t}>{t}</option>)}</select>
                      </div>
                      <select value={form.estado_pelaje} onChange={F('estado_pelaje')}>{['Excelente','Bueno','Regular','Enmarañado'].map(t => <option key={t}>{t}</option>)}</select>
                      <textarea rows={2} placeholder="Observaciones especiales…" value={form.notas_especiales} onChange={F('notas_especiales')} style={{ resize: 'vertical' }} />
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <button className="btn btn-sm btn-primary" onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => setEditando(false)}>Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* B: DUEÑO */}
            {data.mascota.cliente && (
              <div className="hp-section">
                <div className="hp-section-head" style={{ cursor: 'default' }}>
                  <Icons.phone size={13} />
                  <span style={{ marginLeft: 6 }}>Dueño: <b>{data.mascota.cliente.nombre}</b></span>
                  <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--zm-text-2)', fontVariantNumeric: 'tabular-nums' }}>{data.mascota.cliente.telefono}</span>
                </div>
              </div>
            )}

            {/* C: HISTORIAL DE VISITAS */}
            <div className="hp-section">
              <button className="hp-section-head" onClick={() => toggle('historial')}>
                <span>Historial de visitas ({data.historial.length})</span>
                <Chevron open={exp.historial} />
              </button>
              {exp.historial && (
                <div className="hp-section-body">
                  {data.historial.length === 0 && <div className="hp-empty">Sin visitas registradas aún</div>}
                  {data.historial.map((v: any) => (
                    <div key={v.id} className="hp-visit">
                      <div className="hp-visit-top">
                        <span className="hp-visit-svc">{v.servicio}</span>
                        <span className={`hp-visit-diff ${v.diferencia <= 0 ? 'diff-ok' : 'diff-late'}`}>
                          {v.diferencia > 0 ? `+${v.diferencia}` : v.diferencia}min
                        </span>
                      </div>
                      <div className="hp-visit-bot"><span className="hp-visit-fecha">{v.fecha}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* D: PRÓXIMAS CITAS */}
            <div className="hp-section">
              <button className="hp-section-head" onClick={() => toggle('citas')}>
                <span>Próximas citas ({data.proximasCitas.length})</span>
                <Chevron open={exp.citas} />
              </button>
              {exp.citas && (
                <div className="hp-section-body">
                  {data.proximasCitas.length === 0 && <div className="hp-empty">Sin citas próximas</div>}
                  {data.proximasCitas.map((c: any) => (
                    <div key={c.id} className="hp-upcoming">
                      <div className="hp-upcoming-date">{c.fecha}</div>
                      <div className="hp-upcoming-time">{c.hora}</div>
                      <div className="hp-upcoming-svc">{c.servicio}</div>
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
                        {a.fecha_vencimiento && <div className="hp-alerta-meta">vence {a.fecha_vencimiento}</div>}
                      </div>
                      <button className="hp-alerta-del" onClick={() => eliminarAlerta(a.id)}><Icons.close size={12} /></button>
                    </div>
                  ))}
                  <AddAlertaForm mascotaId={mascotaId} onAdd={load} />
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

function AddAlertaForm({ mascotaId, onAdd }: { mascotaId: string; onAdd: () => void }) {
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ tipo: 'vacuna', descripcion: '', fecha_vencimiento: '' })
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const guardar = async () => {
    if (!form.descripcion) { toast('Ingresa una descripción', 'error'); return }
    setSaving(true)
    const payload: any = { mascota_id: mascotaId, tipo: form.tipo, descripcion: form.descripcion }
    if (form.fecha_vencimiento) payload.fecha_vencimiento = form.fecha_vencimiento
    const { error } = await createAlerta(payload)
    setSaving(false)
    if (error) { toast(error, 'error'); return }
    toast('Alerta creada')
    setShow(false); setForm({ tipo: 'vacuna', descripcion: '', fecha_vencimiento: '' }); onAdd()
  }

  if (!show) return (
    <button className="btn btn-sm btn-ghost" style={{ marginTop: 8, width: '100%' }} onClick={() => setShow(true)}>
      <Icons.plus size={12} /> Agregar alerta
    </button>
  )

  return (
    <div className="hp-form" style={{ marginTop: 8 }}>
      <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
        <option value="vacuna">Vacuna</option>
        <option value="alergia">Alergia</option>
        <option value="comportamiento">Comportamiento</option>
        <option value="otro">Otro</option>
      </select>
      <input placeholder="Descripción…" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
      <input type="date" value={form.fecha_vencimiento} onChange={e => setForm(f => ({ ...f, fecha_vencimiento: e.target.value }))} title="Fecha vencimiento (opcional)" />
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-sm btn-primary" onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
        <button className="btn btn-sm btn-ghost" onClick={() => setShow(false)}>Cancelar</button>
      </div>
    </div>
  )
}
