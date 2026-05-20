'use client'
import { useState } from 'react'
import { useClientes, useMascotas } from '@/lib/hooks'
import { createCliente, updateCliente, deleteCliente } from '@/lib/server-actions'
import { Modal } from '@/components/Modal'
import { SidePanel } from '@/components/SidePanel'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Icons } from '@/components/Icons'
import { useToast } from '@/components/Toast'
import HistoriaPanel from '@/components/HistoriaPanel'

const EMPTY = { nombre: '', apellido: '', telefono: '', email: '', direccion: '', notas: '' }

export default function Clientes() {
  const { clientes, loading, refresh } = useClientes()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const { mascotas: mascotasPanel } = useMascotas(selected?.id)
  const [historiaId, setHistoriaId] = useState<string | null>(null)

  const filtered = clientes.filter(c => {
    const q = query.toLowerCase()
    return c.nombre.toLowerCase().includes(q) || c.telefono.includes(q) || c.email.toLowerCase().includes(q)
  })

  const guardar = async () => {
    setSaving(true)
    const data = { nombre: form.nombre, apellido: form.apellido, telefono: form.telefono, email: form.email, direccion: form.direccion, notas: form.notas }
    const { error } = editing ? await updateCliente(editing.id, data) : await createCliente(data)
    setSaving(false)
    if (error) { toast(error, 'error'); return }
    toast(editing ? 'Cliente actualizado' : 'Cliente agregado')
    setShowAdd(false); setEditing(null); setForm(EMPTY); refresh()
    if (editing && selected?.id === editing.id) setSelected(null)
  }

  const confirmarDelete = async () => {
    if (!deleteId) return
    const { error } = await deleteCliente(deleteId)
    if (error) { toast(error, 'error'); return }
    toast('Cliente eliminado'); setDeleteId(null); setSelected(null); refresh()
  }

  const openEdit = (c: any) => {
    setForm({ nombre: c._nombre, apellido: c._apellido, telefono: c.telefono, email: c.email, direccion: c.direccion, notas: c.notas })
    setEditing(c); setShowAdd(true)
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Clientes</h1>
          <div className="page-sub">{clientes.length} clientes registrados</div>
        </div>
        <div className="page-actions">
          <div className="search">
            <Icons.search />
            <input placeholder="Buscar por nombre, teléfono o email…" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm(EMPTY); setShowAdd(true) }}><Icons.plus /> Agregar cliente</button>
        </div>
      </div>

      <div className="card tbl-card">
        <table className="tbl">
          <thead>
            <tr><th>Nombre</th><th>Teléfono</th><th>Email</th><th style={{ textAlign: 'center' }}>Mascotas</th><th>Última visita</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--zm-text-3)' }}>Cargando…</td></tr>}
            {filtered.map(c => (
              <tr key={c.id} onClick={() => setSelected(c)}>
                <td><b>{c.nombre}</b></td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{c.telefono}</td>
                <td style={{ color: 'var(--zm-text-2)' }}>{c.email}</td>
                <td style={{ textAlign: 'center' }}><span className="badge badge-green">{c.numMascotas}</span></td>
                <td style={{ color: 'var(--zm-text-2)' }}>{c.ultimaVisita}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--zm-text-3)' }}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <SidePanel title={selected.nombre} subtitle={selected.telefono} onClose={() => setSelected(null)}>
          <div className="sp-grid">
            <div><div className="sp-label">Email</div><div className="sp-value">{selected.email || '—'}</div></div>
            <div><div className="sp-label">Última visita</div><div className="sp-value">{selected.ultimaVisita}</div></div>
            <div style={{ gridColumn: '1/-1' }}><div className="sp-label">Dirección</div><div className="sp-value">{selected.direccion || '—'}</div></div>
            {selected.notas && <div style={{ gridColumn: '1/-1' }}><div className="sp-label">Notas</div><div className="sp-value">{selected.notas}</div></div>}
          </div>

          <div className="sp-section-title">Mascotas ({mascotasPanel.length})</div>
          {mascotasPanel.map(m => (
            <div key={m.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--zm-border)', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--zm-primary-bg)', display: 'grid', placeItems: 'center', color: 'var(--zm-primary-dark)', flexShrink: 0 }}>
                <Icons.paw size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.nombre}</div>
                <div style={{ fontSize: 12.5, color: 'var(--zm-text-2)' }}>{m.raza} · {m.tamaño} · {m.peso} kg</div>
              </div>
              <span className="badge badge-gray">{m.edad} años</span>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setHistoriaId(selected.id); setSelected(null) }}>
              <Icons.paw size={14} /> Historia clínica
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => openEdit(selected)}>
              <Icons.edit size={14} /> Editar
            </button>
            <button className="btn" style={{ flex: 1, color: 'var(--zm-red)', borderColor: 'var(--zm-red-light)' }} onClick={() => setDeleteId(selected.id)}>
              <Icons.trash size={14} /> Eliminar
            </button>
          </div>
        </SidePanel>
      )}

      {showAdd && (
        <Modal title={editing ? 'Editar cliente' : 'Agregar cliente'} onClose={() => { setShowAdd(false); setEditing(null) }}
          footer={<>
            <button className="btn" onClick={() => { setShowAdd(false); setEditing(null) }}>Cancelar</button>
            <button className="btn btn-primary" onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : 'Guardar cliente'}</button>
          </>}>
          <div className="field-row">
            <div className="field"><label>Nombre</label><input value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} placeholder="Ej: Juan" /></div>
            <div className="field"><label>Apellido</label><input value={form.apellido} onChange={e => setForm(f => ({...f, apellido: e.target.value}))} placeholder="Ej: Pérez" /></div>
          </div>
          <div className="field-row">
            <div className="field"><label>Teléfono</label><input value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))} placeholder="+51 999 888 777" /></div>
            <div className="field"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="cliente@gmail.com" /></div>
          </div>
          <div className="field"><label>Dirección</label><input value={form.direccion} onChange={e => setForm(f => ({...f, direccion: e.target.value}))} placeholder="Av. Larco 234, Lima" /></div>
          <div className="field"><label>Notas</label><textarea rows={3} value={form.notas} onChange={e => setForm(f => ({...f, notas: e.target.value}))} placeholder="Información adicional…" /></div>
        </Modal>
      )}

      {deleteId && <ConfirmDialog onConfirm={confirmarDelete} onCancel={() => setDeleteId(null)} />}
      {historiaId && <HistoriaPanel clienteId={historiaId} onClose={() => setHistoriaId(null)} />}
    </>
  )
}
