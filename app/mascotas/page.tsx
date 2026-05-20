'use client'
import { useState } from 'react'
import { useMascotas, useClientes } from '@/lib/hooks'
import { createMascota, updateMascota, deleteMascota } from '@/lib/server-actions'
import { Modal } from '@/components/Modal'
import { SidePanel } from '@/components/SidePanel'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Icons } from '@/components/Icons'
import { useToast } from '@/components/Toast'

const TAMAÑOS = ['Pequeño', 'Mediano', 'Grande']
const PELOS = ['Corto', 'Medio', 'Largo', 'Rizado']
const PELAJES = ['Excelente', 'Bueno', 'Regular', 'Enmarañado']
const TEMPERAMENTOS = ['Tranquilo', 'Nervioso', 'Agresivo', 'Juguetón', 'Tímido']

const EMPTY = { nombre: '', cliente_id: '', raza: '', edad_años: '', peso_kg: '', tamaño: 'Mediano', tipo_pelo: 'Corto', estado_pelaje: 'Bueno', temperamento: 'Tranquilo', notas_especiales: '' }

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

  const filtered = mascotas.filter(m => {
    const q = query.toLowerCase()
    return m.nombre.toLowerCase().includes(q) || m.dueño.toLowerCase().includes(q) || m.raza.toLowerCase().includes(q)
  })

  const guardar = async () => {
    setSaving(true)
    const data = {
      nombre: form.nombre, cliente_id: form.cliente_id,
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
      nombre: m.nombre, cliente_id: m.dueñoId, raza: m.raza,
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
            <tr><th>Nombre</th><th>Dueño</th><th>Raza</th><th>Tamaño</th><th>Última visita</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--zm-text-3)' }}>Cargando…</td></tr>}
            {filtered.map(m => (
              <tr key={m.id} onClick={() => setSelected(m)}>
                <td><b>🐾 {m.nombre}</b></td>
                <td>{m.dueño}</td>
                <td style={{ color: 'var(--zm-text-2)' }}>{m.raza}</td>
                <td><span className="badge badge-gray">{m.tamaño}</span></td>
                <td style={{ color: 'var(--zm-text-2)' }}>{m.ultimaVisita}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--zm-text-3)' }}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <SidePanel title={selected.nombre} subtitle={`${selected.raza} · ${selected.edad} años`} onClose={() => setSelected(null)}>
          <div className="sp-grid">
            <div><div className="sp-label">Dueño</div><div className="sp-value">{selected.dueño}</div></div>
            <div><div className="sp-label">Peso</div><div className="sp-value">{selected.peso} kg</div></div>
            <div><div className="sp-label">Tamaño</div><div className="sp-value">{selected.tamaño}</div></div>
            <div><div className="sp-label">Tipo de pelo</div><div className="sp-value">{selected.tipoPelo}</div></div>
            <div><div className="sp-label">Estado pelaje</div><div className="sp-value">{selected.estadoPelaje}</div></div>
            <div><div className="sp-label">Temperamento</div><div className="sp-value">{selected.temperamento}</div></div>
            {selected.notas && <div style={{ gridColumn: '1/-1' }}><div className="sp-label">Notas</div><div className="sp-value">{selected.notas}</div></div>}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
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
    </>
  )
}
