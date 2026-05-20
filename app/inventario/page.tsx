'use client'
import { useState } from 'react'
import { useProductos } from '@/lib/hooks'
import { createProducto, updateProducto, deleteProducto, ajustarStock } from '@/lib/server-actions'
import { Modal } from '@/components/Modal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Icons } from '@/components/Icons'
import { useToast } from '@/components/Toast'

const CATS = ['Alimento', 'Medicamentos', 'Accesorios', 'Higiene']

export default function Inventario() {
  const { productos, loading, refresh } = useProductos()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [stockModal, setStockModal] = useState<any>(null)
  const [newStock, setNewStock] = useState('')
  const [saving, setSaving] = useState(false)

  const EMPTY = { nombre: '', categoria: 'Alimento', stock_actual: '', stock_minimo: '', precio: '', proveedor: '' }
  const [form, setForm] = useState(EMPTY)

  const filtered = productos.filter(p => p.nombre.toLowerCase().includes(query.toLowerCase()))
  const stockBajoCount = productos.filter(p => p.stockBajo).length

  const guardar = async () => {
    setSaving(true)
    const data = {
      nombre: form.nombre,
      categoria: form.categoria,
      stock_actual: Number(form.stock_actual),
      stock_minimo: Number(form.stock_minimo),
      precio: Number(form.precio),
      proveedor: form.proveedor,
    }
    const { error } = editing ? await updateProducto(editing.id, data) : await createProducto(data)
    setSaving(false)
    if (error) { toast(error, 'error'); return }
    toast(editing ? 'Producto actualizado' : 'Producto agregado')
    setShowAdd(false); setEditing(null); setForm(EMPTY); refresh()
  }

  const confirmarDelete = async () => {
    if (!deleteId) return
    const { error } = await deleteProducto(deleteId)
    if (error) { toast(error, 'error'); return }
    toast('Producto eliminado'); setDeleteId(null); refresh()
  }

  const ajustar = async () => {
    if (!stockModal) return
    const { error } = await ajustarStock(stockModal.id, Number(newStock))
    if (error) { toast(error, 'error'); return }
    toast('Stock actualizado'); setStockModal(null); refresh()
  }

  const openEdit = (p: any) => {
    setForm({ nombre: p.nombre, categoria: p.categoria, stock_actual: p.stock, stock_minimo: p.stockMin, precio: p.precio, proveedor: p.proveedor })
    setEditing(p); setShowAdd(true)
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Inventario</h1>
          <div className="page-sub">{productos.length} productos · {stockBajoCount} con stock bajo</div>
        </div>
        <div className="page-actions">
          <div className="search">
            <Icons.search />
            <input placeholder="Buscar producto…" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm(EMPTY); setShowAdd(true) }}><Icons.plus /> Agregar producto</button>
        </div>
      </div>

      {stockBajoCount > 0 && (
        <div className="alert alert-warn" style={{ marginBottom: 16 }}>
          <Icons.alert />
          <div><strong>{stockBajoCount} productos</strong> con stock por debajo del mínimo. Revisa para reabastecer.</div>
        </div>
      )}

      <div className="card tbl-card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Producto</th><th>Categoría</th>
              <th style={{ textAlign: 'right' }}>Stock</th>
              <th style={{ textAlign: 'right' }}>Mínimo</th>
              <th style={{ textAlign: 'right' }}>Precio</th>
              <th>Proveedor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--zm-text-3)' }}>Cargando…</td></tr>}
            {filtered.map(p => (
              <tr key={p.id} className={p.stockBajo ? 'tbl-row-warn' : ''} onClick={() => { setNewStock(String(p.stock)); setStockModal(p) }}>
                <td>
                  <b>{p.nombre}</b>
                  {p.stockBajo && <span className="badge badge-red" style={{ marginLeft: 8 }}>Stock bajo</span>}
                </td>
                <td><span className="badge badge-gray">{p.categoria}</span></td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: p.stockBajo ? 'var(--zm-red)' : 'var(--zm-text)' }}>{p.stock}</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--zm-text-2)' }}>{p.stockMin}</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>S/. {p.precio}</td>
                <td style={{ color: 'var(--zm-text-2)', fontSize: 12.5 }}>{p.proveedor}</td>
                <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}><Icons.edit size={14} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(p.id)}><Icons.trash size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title={editing ? 'Editar producto' : 'Agregar producto'} onClose={() => { setShowAdd(false); setEditing(null) }}
          footer={<>
            <button className="btn" onClick={() => { setShowAdd(false); setEditing(null) }}>Cancelar</button>
            <button className="btn btn-primary" onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </>}>
          <div className="field"><label>Nombre</label><input value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} placeholder="Ej: Shampoo medicado" /></div>
          <div className="field-row">
            <div className="field"><label>Categoría</label>
              <select value={form.categoria} onChange={e => setForm(f => ({...f, categoria: e.target.value}))}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field"><label>Proveedor</label><input value={form.proveedor} onChange={e => setForm(f => ({...f, proveedor: e.target.value}))} /></div>
          </div>
          <div className="field-row-3">
            <div className="field"><label>Stock actual</label><input type="number" value={form.stock_actual} onChange={e => setForm(f => ({...f, stock_actual: e.target.value}))} /></div>
            <div className="field"><label>Stock mínimo</label><input type="number" value={form.stock_minimo} onChange={e => setForm(f => ({...f, stock_minimo: e.target.value}))} /></div>
            <div className="field"><label>Precio (S/.)</label><input type="number" step="0.01" value={form.precio} onChange={e => setForm(f => ({...f, precio: e.target.value}))} /></div>
          </div>
        </Modal>
      )}

      {stockModal && (
        <Modal title={`Ajustar stock — ${stockModal.nombre}`} onClose={() => setStockModal(null)}
          footer={<>
            <button className="btn" onClick={() => setStockModal(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={ajustar}>Actualizar stock</button>
          </>}>
          <div className="field"><label>Nuevo stock</label><input type="number" value={newStock} onChange={e => setNewStock(e.target.value)} autoFocus /></div>
        </Modal>
      )}

      {deleteId && <ConfirmDialog onConfirm={confirmarDelete} onCancel={() => setDeleteId(null)} />}
    </>
  )
}
