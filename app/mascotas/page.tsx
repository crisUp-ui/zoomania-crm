'use client'
import { useState } from 'react'
import { useMascotas, useClientes } from '@/lib/hooks'
import { createMascota, updateMascota, deleteMascota } from '@/lib/server-actions'
import { Modal } from '@/components/Modal'
import { SidePanel } from '@/components/SidePanel'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Icons } from '@/components/Icons'
import { useToast } from '@/components/Toast'
import HistoriaPanel from '@/components/HistoriaPanel'

const TAMAÑO_COLOR: Record<string, [string, string]> = {
  'Pequeño': ['#DBEAFE', '#1E3A8A'],
  'Mediano': ['#FEF3C7', '#92400E'],
  'Grande':  ['#FEE2E2', '#991B1B'],
}
const tamañoBadge = (t: string) => {
  const [bg, color] = TAMAÑO_COLOR[t] || ['#F2F3F4', '#4D5656']
  return { background: bg, color, borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }
}

const ESPECIE_COLOR: Record<string, [string, string]> = {
  'Perro':   ['#E8F4D9','#3D6614'],
  'Gato':    ['#FDEBD0','#784A15'],
  'Conejo':  ['#FCEEF8','#7B2560'],
  'Ave':     ['#FEF9E7','#7D6008'],
  'Iguana':  ['#D5F5E3','#1A6B3D'],
  'Reptil':  ['#E8DAEF','#5B2C8D'],
  'Hámster': ['#FAE5D3','#7D3C10'],
  'Hurón':   ['#DBEAFE','#1E40AF'],
  'Pez':     ['#CCEEFF','#0066AA'],
  'Otro':    ['#F2F3F4','#4D5656'],
}
const especieBadge = (esp: string) => {
  const [bg, color] = ESPECIE_COLOR[esp] || ESPECIE_COLOR['Otro']
  return { background: bg, color, borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }
}

const ESPECIES = ['Perro', 'Gato', 'Conejo', 'Ave', 'Iguana', 'Reptil', 'Hámster', 'Hurón', 'Pez', 'Otro']
const TAMAÑOS = ['Pequeño', 'Mediano', 'Grande']
const PELOS = ['Corto', 'Medio', 'Largo', 'Rizado']
const PELAJES = ['Excelente', 'Bueno', 'Regular', 'Enmarañado']
const TEMPERAMENTOS = ['Tranquilo', 'Nervioso', 'Agresivo', 'Juguetón', 'Tímido']

const EMPTY = { nombre: '', especie: 'Perro', cliente_id: '', raza: '', edad_años: '', peso_kg: '', tamaño: 'Mediano', tipo_pelo: 'Corto', estado_pelaje: 'Bueno', temperamento: 'Tranquilo', notas_especiales: '' }

export default function Mascotas() {
  const { mascotas, loading, refresh } = useMascotas()
  const { clientes } = useClientes()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [historiaId, setHistoriaId] = useState<string | null>(null)

  const filtered = mascotas.filter(m => {
    const q = query.toLowerCase()
    return m.nombre.toLowerCase().includes(q) || m.dueño.toLowerCase().includes(q) || m.raza.toLowerCase().includes(q)
  })

  const guardar = async () => {
    setSaving(true)
    const data = {
      nombre: form.nombre, especie: form.especie, cliente_id: form.cliente_id,
      raza: form.raza, edad_años: Number(form.edad_años) || null,
      peso_kg: Number(form.peso_kg) || null, tamaño: form.tamaño,
      tipo_pelo: form.tipo_pelo, estado_pelaje: form.estado_pelaje,
      temperamento: form.temperamento, notas_especiales: form.notas_especiales,
    }
    const { error } = editing ? await updateMascota(editing.id, data) : await createMascota(data)
    setSaving(false)
    if (error) { toast(error, 'error'); return }
    toast(editing ? 'Mascota actualizada' : 'Mascota agregada')
    setShowAdd(false); setEditing(null); setForm(EMPTY); refresh()
    if (editing && selected?.id === editing.id) setSelected(null)
  }

  const confirmarDelete = async () => {
    if (!deleteId) return
    const { error } = await deleteMascota(deleteId)
    if (error) { toast(error, 'error'); return }
    toast('Mascota eliminada'); setDeleteId(null); setSelected(null); refresh()
  }

  const openEdit = (m: any) => {
    setForm({
      nombre: m.nombre, especie: m.especie || 'Perro', cliente_id: m.dueñoId, raza: m.raza,
      edad_años: m.edad, peso_kg: m.peso, tamaño: m.tamaño,
      tipo_pelo: m.tipoPelo, estado_pelaje: m.estadoPelaje,
      temperamento: m.temperamento, notas_especiales: m.notas,
    })
    setEditing(m); setShowAdd(true)
  }

  const F = (key: string) => (e: any) => setForm((f: any) => ({...f, [key]: e.target.value}))

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Mascotas</h1>
          <div className="page-sub">{mascotas.length} mascotas registradas</div>
        </div>
        <div className="page-actions">
          <div className="search">
            <Icons.search />
            <input placeholder="Buscar mascota, dueño o raza…" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm(EMPTY); setShowAdd(true) }}><Icons.plus /> Agregar mascota</button>
        </div>
      </div>

      <div className="card tbl-card">
        <table className="tbl">
          <thead>
            <tr><th>Nombre</th><th>Dueño</th><th>Raza</th><th>Tamaño</th><th>Última visita</th><th></th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--zm-text-3)' }}>Cargando…</td></tr>}
            {filtered.map(m => (
              <tr key={m.id} onClick={() => setSelected(m)}>
                <td><b>{m.nombre}</b> <span style={{ marginLeft: 4, ...especieBadge(m.especie || 'Perro') }}>{m.especie || 'Perro'}</span></td>
                <td>{m.dueño}</td>
                <td style={{ color: 'var(--zm-text-2)' }}>{m.raza}</td>
                <td><span style={tamañoBadge(m.tamaño)}>{m.tamaño}</span></td>
                <td style={{ color: 'var(--zm-text-2)' }}>{m.ultimaVisita}</td>
                <td onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => setHistoriaId(m.id)} title="Historia clínica">
                    <Icons.paw size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--zm-text-3)' }}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <SidePanel title={<>{selected.nombre} <span style={{ marginLeft: 6, ...especieBadge(selected.especie || 'Perro') }}>{selected.especie || 'Perro'}</span></>} subtitle={`${selected.raza} · ${selected.edad} años`} onClose={() => setSelected(null)}>
          <div className="sp-grid">
            <div><div className="sp-label">Dueño</div><div className="sp-value">{selected.dueño}</div></div>
            <div><div className="sp-label">Peso</div><div className="sp-value">{selected.peso} kg</div></div>
            <div><div className="sp-label">Tamaño</div><div className="sp-value"><span style={tamañoBadge(selected.tamaño)}>{selected.tamaño}</span></div></div>
            <div><div className="sp-label">Tipo de pelo</div><div className="sp-value">{selected.tipoPelo}</div></div>
            <div><div className="sp-label">Estado pelaje</div><div className="sp-value">{selected.estadoPelaje}</div></div>
            <div><div className="sp-label">Temperamento</div><div className="sp-value">{selected.temperamento}</div></div>
            {selected.notas && <div style={{ gridColumn: '1/-1' }}><div className="sp-label">Notas</div><div className="sp-value">{selected.notas}</div></div>}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setHistoriaId(selected.id); setSelected(null) }}><Icons.paw size={14} /> Historia clínica</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => openEdit(selected)}><Icons.edit size={14} /> Editar</button>
            <button className="btn" style={{ flex: 1, color: 'var(--zm-red)', borderColor: 'var(--zm-red-light)' }} onClick={() => setDeleteId(selected.id)}><Icons.trash size={14} /> Eliminar</button>
          </div>
        </SidePanel>
      )}

      {showAdd && (
        <Modal title={editing ? 'Editar mascota' : 'Agregar mascota'} large onClose={() => { setShowAdd(false); setEditing(null) }}
          footer={<>
            <button className="btn" onClick={() => { setShowAdd(false); setEditing(null) }}>Cancelar</button>
            <button className="btn btn-primary" onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : 'Guardar mascota'}</button>
          </>}>
          <div className="field-row">
            <div className="field"><label>Nombre</label><input value={form.nombre} onChange={F('nombre')} placeholder="Ej: Rocky" /></div>
            <div className="field"><label>Especie</label>
              <select value={form.especie} onChange={F('especie')}>{ESPECIES.map(e => <option key={e}>{e}</option>)}</select>
            </div>
          </div>
          <div className="field-row">
            <div className="field"><label>Dueño</label>
              <select value={form.cliente_id} onChange={F('cliente_id')}>
                <option value="">Seleccionar cliente…</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="field-row-3">
            <div className="field"><label>Raza</label><input value={form.raza} onChange={F('raza')} placeholder="Ej: Shih Tzu" /></div>
            <div className="field"><label>Edad (años)</label><input type="number" value={form.edad_años} onChange={F('edad_años')} /></div>
            <div className="field"><label>Peso (kg)</label><input type="number" step="0.1" value={form.peso_kg} onChange={F('peso_kg')} /></div>
          </div>
          <div style={{ background: 'var(--zm-primary-bg)', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 12.5, color: 'var(--zm-primary-dark)' }}>
            <b>Características usadas en el cálculo de duración:</b>
          </div>
          <div className="field-row-3">
            <div className="field"><label>Tamaño</label>
              <select value={form.tamaño} onChange={F('tamaño')}>{TAMAÑOS.map(t => <option key={t}>{t}</option>)}</select>
            </div>
            <div className="field"><label>Tipo de pelo</label>
              <select value={form.tipo_pelo} onChange={F('tipo_pelo')}>{PELOS.map(t => <option key={t}>{t}</option>)}</select>
            </div>
            <div className="field"><label>Estado pelaje</label>
              <select value={form.estado_pelaje} onChange={F('estado_pelaje')}>{PELAJES.map(t => <option key={t}>{t}</option>)}</select>
            </div>
          </div>
          <div className="field"><label>Temperamento</label>
            <select value={form.temperamento} onChange={F('temperamento')}>{TEMPERAMENTOS.map(t => <option key={t}>{t}</option>)}</select>
          </div>
          <div className="field"><label>Observaciones</label><textarea rows={2} value={form.notas_especiales} onChange={F('notas_especiales')} placeholder="Alergias, condiciones especiales…" /></div>
        </Modal>
      )}

      {deleteId && <ConfirmDialog onConfirm={confirmarDelete} onCancel={() => setDeleteId(null)} />}
      {historiaId && <HistoriaPanel mascotaId={historiaId} onClose={() => setHistoriaId(null)} />}
    </>
  )
}
