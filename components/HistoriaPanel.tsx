'use client'
import { useState, useEffect } from 'react'
import {
  getHistoriaClinica, updateCliente, updateClienteNotas,
  createMascota, updateMascota, deleteMascota,
  createAlerta, deleteAlerta,
} from '@/lib/server-actions'
import { Icons } from './Icons'
import { useToast } from './Toast'

const TAMAÑO_COLOR: Record<string, [string, string]> = {
  'Pequeño': ['#DBEAFE', '#1E3A8A'],
  'Mediano': ['#FEF3C7', '#92400E'],
  'Grande':  ['#FEE2E2', '#991B1B'],
}
const tamañoBadge = (t: string) => {
  const [bg, color] = TAMAÑO_COLOR[t] || ['#F2F3F4', '#4D5656']
  return { background: bg, color, borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }
}

const ESPECIES = ['Perro', 'Gato', 'Conejo', 'Ave', 'Iguana', 'Reptil', 'Hámster', 'Hurón', 'Pez', 'Otro']
const TAMAÑOS = ['Pequeño', 'Mediano', 'Grande']
const TEMPERAMENTOS = ['Tranquilo', 'Nervioso', 'Agresivo', 'Juguetón', 'Tímido']
const NEW_PET = { nombre: '', especie: 'Perro', raza: '', edad_años: '', peso_kg: '', tamaño: 'Mediano', temperamento: 'Tranquilo', notas_especiales: '' }

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

  // Edit cliente
  const [editCliente, setEditCliente] = useState(false)
  const [cF, setCF] = useState({ nombre: '', apellido: '', telefono: '', email: '', direccion: '' })
  const [savingCliente, setSavingCliente] = useState(false)

  // Mascotas CRUD
  const [editingPetId, setEditingPetId] = useState<string | null>(null)
  const [petForm, setPetForm] = useState<any>({})
  const [addingPet, setAddingPet] = useState(false)
  const [newPet, setNewPet] = useState<any>(NEW_PET)
  const [savingPet, setSavingPet] = useState(false)
  const [confirmDelPet, setConfirmDelPet] = useState<string | null>(null)

  const toast = useToast()

  const load = async () => {
    setLoading(true)
    const r = await getHistoriaClinica(clienteId)
    setData(r)
    setNotas(r.cliente?.notas || '')
    if (r.cliente) setCF({ nombre: r.cliente._nombre, apellido: r.cliente._apellido, telefono: r.cliente.telefono, email: r.cliente.email, direccion: r.cliente.direccion })
    setLoading(false)
  }

  useEffect(() => { load() }, [clienteId])
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const toggle = (k: keyof typeof exp) => setExp(e => ({ ...e, [k]: !e[k] }))

  // Cliente
  const guardarCliente = async () => {
    setSavingCliente(true)
    const { error } = await updateCliente(clienteId, cF)
    setSavingCliente(false)
    if (error) { toast(error, 'error'); return }
    toast('Cliente actualizado'); setEditCliente(false); load()
  }

  // Mascotas
  const startEditPet = (m: any) => {
    setPetForm({ nombre: m.nombre, especie: m.especie || 'Perro', raza: m.raza || '', edad_años: m.edad_años || '', peso_kg: m.peso_kg || '', tamaño: m.tamaño || 'Mediano', temperamento: m.temperamento || 'Tranquilo', notas_especiales: m.notas_especiales || '' })
    setEditingPetId(m.id); setExpandedPet(m.id)
  }

  const guardarPet = async () => {
    if (!editingPetId) return
    setSavingPet(true)
    const { error } = await updateMascota(editingPetId, { nombre: petForm.nombre, especie: petForm.especie, raza: petForm.raza, edad_años: Number(petForm.edad_años) || null, peso_kg: Number(petForm.peso_kg) || null, tamaño: petForm.tamaño, temperamento: petForm.temperamento, notas_especiales: petForm.notas_especiales })
    setSavingPet(false)
    if (error) { toast(error, 'error'); return }
    toast('Mascota actualizada'); setEditingPetId(null); load()
  }

  const crearPet = async () => {
    if (!newPet.nombre) { toast('Ingresa el nombre', 'error'); return }
    setSavingPet(true)
    const { error } = await createMascota({ nombre: newPet.nombre, especie: newPet.especie, raza: newPet.raza, cliente_id: clienteId, edad_años: Number(newPet.edad_años) || null, peso_kg: Number(newPet.peso_kg) || null, tamaño: newPet.tamaño, temperamento: newPet.temperamento, notas_especiales: newPet.notas_especiales })
    setSavingPet(false)
    if (error) { toast(error, 'error'); return }
    toast('Mascota agregada'); setAddingPet(false); setNewPet(NEW_PET); load()
  }

  const eliminarPet = async () => {
    if (!confirmDelPet) return
    const { error } = await deleteMascota(confirmDelPet)
    if (error) { toast(error, 'error'); return }
    toast('Mascota eliminada'); setConfirmDelPet(null); load()
  }

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

  const PF = (k: string) => (e: any) => setPetForm((f: any) => ({ ...f, [k]: e.target.value }))
  const NPF = (k: string) => (e: any) => setNewPet((f: any) => ({ ...f, [k]: e.target.value }))

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
                <span>Info cliente</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                  {exp.info && !editCliente && (
                    <span className="hp-icon-btn" onClick={e => { e.stopPropagation(); setEditCliente(true) }}><Icons.edit size={13} /></span>
                  )}
                  <Chevron open={exp.info} />
                </span>
              </button>
              {exp.info && (
                <div className="hp-section-body">
                  {!editCliente ? (
                    <>
                      <div className="hp-info-row"><Icons.phone size={14} /><span>{data.cliente.telefono || '—'}</span></div>
                      <div className="hp-info-row"><Icons.mail size={14} /><span>{data.cliente.email || '—'}</span></div>
                      <div className="hp-info-row"><Icons.mappin size={14} /><span>{data.cliente.direccion || '—'}</span></div>
                    </>
                  ) : (
                    <div className="hp-form">
                      <div className="hp-form-row">
                        <input placeholder="Nombre" value={cF.nombre} onChange={e => setCF(f => ({...f, nombre: e.target.value}))} />
                        <input placeholder="Apellido" value={cF.apellido} onChange={e => setCF(f => ({...f, apellido: e.target.value}))} />
                      </div>
                      <input placeholder="Teléfono" value={cF.telefono} onChange={e => setCF(f => ({...f, telefono: e.target.value}))} />
                      <input placeholder="Email" value={cF.email} onChange={e => setCF(f => ({...f, email: e.target.value}))} />
                      <input placeholder="Dirección" value={cF.direccion} onChange={e => setCF(f => ({...f, direccion: e.target.value}))} />
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <button className="btn btn-sm btn-primary" onClick={guardarCliente} disabled={savingCliente}>{savingCliente ? 'Guardando…' : 'Guardar'}</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => setEditCliente(false)}>Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* B: MASCOTAS */}
            <div className="hp-section">
              <button className="hp-section-head" onClick={() => toggle('mascotas')}>
                <span>Mascotas ({data.mascotas.length})</span>
                <Chevron open={exp.mascotas} />
              </button>
              {exp.mascotas && (
                <div className="hp-section-body">
                  {data.mascotas.length === 0 && <div className="hp-empty">Sin mascotas registradas</div>}
                  {data.mascotas.map((m: any) => (
                    <div key={m.id} className="hp-pet-card">
                      <div className="hp-pet-head" onClick={() => { if (editingPetId !== m.id) { setExpandedPet(expandedPet === m.id ? null : m.id); setEditingPetId(null) } }}>
                        <div className="hp-pet-avatar">🐾</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="hp-pet-name">
                            {m.nombre}&nbsp;
                            <span className="hp-tag" style={{ fontSize: 11 }}>{m.especie || 'Perro'}</span>
                          </div>
                          <div className="hp-pet-meta">{m.raza || 'Sin raza'} · {m.edad_años ? m.edad_años + ' años' : 'Edad s/d'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                          <span className="hp-icon-btn" onClick={() => startEditPet(m)} title="Editar"><Icons.edit size={12} /></span>
                          <span className="hp-icon-btn hp-icon-del" onClick={() => setConfirmDelPet(m.id)} title="Eliminar"><Icons.trash size={12} /></span>
                          <div onClick={() => { if (editingPetId !== m.id) { setExpandedPet(expandedPet === m.id ? null : m.id); setEditingPetId(null) } }}>
                            <Chevron open={expandedPet === m.id} />
                          </div>
                        </div>
                      </div>
                      {expandedPet === m.id && (
                        editingPetId === m.id ? (
                          <div className="hp-form" style={{ padding: '8px 12px 12px', borderTop: '1px solid var(--zm-border)' }}>
                            <div className="hp-form-row">
                              <input placeholder="Nombre" value={petForm.nombre} onChange={PF('nombre')} />
                              <select value={petForm.especie} onChange={PF('especie')}>{ESPECIES.map(e => <option key={e}>{e}</option>)}</select>
                            </div>
                            <div className="hp-form-row">
                              <input placeholder="Raza" value={petForm.raza} onChange={PF('raza')} />
                              <select value={petForm.tamaño} onChange={PF('tamaño')}>{TAMAÑOS.map(t => <option key={t}>{t}</option>)}</select>
                            </div>
                            <div className="hp-form-row">
                              <input type="number" placeholder="Edad (años)" value={petForm.edad_años} onChange={PF('edad_años')} />
                              <input type="number" placeholder="Peso (kg)" step="0.1" value={petForm.peso_kg} onChange={PF('peso_kg')} />
                            </div>
                            <select value={petForm.temperamento} onChange={PF('temperamento')}>{TEMPERAMENTOS.map(t => <option key={t}>{t}</option>)}</select>
                            <textarea rows={2} placeholder="Observaciones…" value={petForm.notas_especiales} onChange={PF('notas_especiales')} style={{ resize: 'vertical' }} />
                            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                              <button className="btn btn-sm btn-primary" onClick={guardarPet} disabled={savingPet}>{savingPet ? 'Guardando…' : 'Guardar'}</button>
                              <button className="btn btn-sm btn-ghost" onClick={() => setEditingPetId(null)}>Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="hp-pet-details">
                            {m.tamaño && <span style={tamañoBadge(m.tamaño)}>Tamaño: {m.tamaño}</span>}
                            {m.peso_kg && <span className="hp-tag">Peso: {m.peso_kg} kg</span>}
                            {m.temperamento && <span className="hp-tag">Temperamento: {m.temperamento}</span>}
                            {m.tipo_pelo && <span className="hp-tag">Pelo: {m.tipo_pelo}</span>}
                            {m.estado_pelaje && <span className="hp-tag">Pelaje: {m.estado_pelaje}</span>}
                            {m.notas_especiales && <div className="hp-pet-notas">📝 {m.notas_especiales}</div>}
                          </div>
                        )
                      )}
                    </div>
                  ))}

                  {confirmDelPet && (
                    <div className="hp-confirm">
                      <span>¿Eliminar esta mascota? No se puede deshacer.</span>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        <button className="btn btn-sm" style={{ color: 'var(--zm-red)', borderColor: 'var(--zm-red-light)' }} onClick={eliminarPet}>Eliminar</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => setConfirmDelPet(null)}>Cancelar</button>
                      </div>
                    </div>
                  )}

                  {addingPet ? (
                    <div className="hp-form" style={{ marginTop: 8 }}>
                      <div className="hp-form-row">
                        <input placeholder="Nombre *" value={newPet.nombre} onChange={NPF('nombre')} />
                        <select value={newPet.especie} onChange={NPF('especie')}>{ESPECIES.map(e => <option key={e}>{e}</option>)}</select>
                      </div>
                      <div className="hp-form-row">
                        <input placeholder="Raza" value={newPet.raza} onChange={NPF('raza')} />
                        <select value={newPet.tamaño} onChange={NPF('tamaño')}>{TAMAÑOS.map(t => <option key={t}>{t}</option>)}</select>
                      </div>
                      <div className="hp-form-row">
                        <input type="number" placeholder="Edad (años)" value={newPet.edad_años} onChange={NPF('edad_años')} />
                        <input type="number" placeholder="Peso (kg)" step="0.1" value={newPet.peso_kg} onChange={NPF('peso_kg')} />
                      </div>
                      <select value={newPet.temperamento} onChange={NPF('temperamento')}>{TEMPERAMENTOS.map(t => <option key={t}>{t}</option>)}</select>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <button className="btn btn-sm btn-primary" onClick={crearPet} disabled={savingPet}>{savingPet ? 'Guardando…' : 'Agregar'}</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => setAddingPet(false)}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-sm btn-ghost" style={{ marginTop: 8, width: '100%' }} onClick={() => setAddingPet(true)}>
                      <Icons.plus size={12} /> Agregar mascota
                    </button>
                  )}
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
                        <span> · {v.mascota}</span>
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
                        <div className="hp-alerta-meta">{a.mascota_nombre}{a.fecha_vencimiento ? ` · vence ${a.fecha_vencimiento}` : ''}</div>
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
                  <textarea className="hp-notas-input" value={notas} onChange={e => setNotas(e.target.value)}
                    placeholder="Ej: Prefiere citas por la mañana, paga solo en efectivo…" rows={4} />
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
    setShow(false); setForm({ mascota_id: '', tipo: 'vacuna', descripcion: '', fecha_vencimiento: '' }); onAdd()
  }

  if (!show) return (
    <button className="btn btn-sm btn-ghost" style={{ marginTop: 8, width: '100%' }} onClick={() => setShow(true)}>
      <Icons.plus size={12} /> Agregar alerta
    </button>
  )

  return (
    <div className="hp-form" style={{ marginTop: 8 }}>
      <select value={form.mascota_id} onChange={e => setForm(f => ({ ...f, mascota_id: e.target.value }))}>
        <option value="">Mascota…</option>
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
        <button className="btn btn-sm btn-primary" onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
        <button className="btn btn-sm btn-ghost" onClick={() => setShow(false)}>Cancelar</button>
      </div>
    </div>
  )
}
