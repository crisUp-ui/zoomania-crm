'use client'
import { useState } from 'react'
import { useProductos } from '@/lib/hooks'
import { createProducto, updateProducto, deleteProducto, ajustarStock } from '@/lib/server-actions'
import { Modal } from '@/components/Modal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Icons } from '@/components/Icons'
import { useToast } from '@/components/Toast'

const CATS = ['Alimento', 'Medicamentos', 'Accesorios', 'Higiene']

const CAT_COLOR: Record<string, [string, string]> = {
  Alimento:     ['#E8F4D9', '#3D6614'],
  Medicamentos: ['#DBEAFE', '#1E3A8A'],
  Accesorios:   ['#FEF3C7', '#92400E'],
  Higiene:      ['#FCEEF8', '#7B2560'],
}
const catBadge = (cat: string) => {
  const [bg, color] = CAT_COLOR[cat] || ['#F2F3F4', '#4D5656']
  return { background: bg, color, borderRadius: 6, padding: '2px 9px', fontSize: 12, fontWeight: 600, display: 'inline-block' }
}

function StockBar({ actual, minimo }: { actual: number; minimo: number }) {
  const cap = minimo > 0 ? minimo * 2 : 20
  const pct = Math.min((actual / cap) * 100, 100)
  const color = actual <= 0
    ? 'var(--zm-red)'
    : actual <= minimo
      ? 'var(--zm-yellow)'
      : 'var(--zm-primary)'
  const textColor = actual <= 0
    ? 'var(--zm-red)'
    : actual <= minimo
      ? '#876615'
      : 'var(--zm-text)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, minWidth: 24, textAlign: 'right', color: textColor }}>
        {actual}
      </span>
      <div style={{ width: 56, height: 5, borderRadius: 3, background: 'var(--zm-border)', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

export default function Inventario() {
  const { productos, loading, refresh } = useProductos()
  const toast = useToast()
  const [query, setQuery]       = useState('')
  const [catFilter, setCatFilter] = useState('Todos')
  const [showAdd, setShowAdd]   = useState(false)
  const [editing, setEditing]   = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [stockModal, setStockModal] = useState<any>(null)
  const [delta, setDelta]       = useState('')
  const [saving, setSaving]     = useState(false)

  const EMPTY = { nombre: '', categoria: 'Alimento', stock_actual: '', stock_minimo: '', precio: '', proveedor: '' }
  const [form, setForm] = useState(EMPTY)

  const filtered = productos
    .filter(p => catFilter === 'Todos' || p.categoria === catFilter)
    .filter(p => p.nombre.toLowerCase().includes(query.toLowerCase()))

  const stockBajoCount  = productos.filter(p => p.stockBajo).length
  const valorTotal      = productos.reduce((s, p) => s + Number(p.precio) * p.stock, 0)

  const guardar = async () => {
    setSaving(true)
    const data = {
      nombre: form.nombre, categoria: form.categoria,
      stock_actual: Number(form.stock_actual), stock_minimo: Number(form.stock_minimo),
      precio: Number(form.precio), proveedor: form.proveedor,
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
    if (!stockModal || !delta || delta === '0') return
    const nuevo = stockModal.stock + Number(delta)
    if (nuevo < 0) { toast('El stock no puede ser negativo', 'error'); return }
    const { error } = await ajustarStock(stockModal.id, nuevo)
    if (error) { toast(error, 'error'); return }
    toast('Stock actualizado'); setStockModal(null); refresh()
  }

  const openEdit = (p: any) => {
    setForm({ nombre: p.nombre, categoria: p.categoria, stock_actual: p.stock, stock_minimo: p.stockMin, precio: p.precio, proveedor: p.proveedor })
    setEditing(p); setShowAdd(true)
  }

  const resultado = stockModal ? stockModal.stock + Number(delta || 0) : 0

  return (
    <>
      {/* Header */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Inventario</h1>
          <div className="page-sub">{productos.length} productos · {CATS.filter(c => productos.some(p => p.categoria === c)).length} categorías</div>
        </div>
        <div className="page-actions">
          <div className="search">
            <Icons.search />
            <input placeholder="Buscar producto…" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm(EMPTY); setShowAdd(true) }}>
            <Icons.plus /> Agregar producto
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        <div className="card metric">
          <div className="metric-head">
            <div className="metric-label"><Icons.package size={14} /> Total productos</div>
            <div className="metric-icon"><Icons.package size={17} /></div>
          </div>
          <div className="metric-value">{productos.length}</div>
          <div className="metric-delta">{filtered.length !== productos.length ? `${filtered.length} filtrados` : 'en inventario'}</div>
        </div>

        <div className="card metric">
          <div className="metric-head">
            <div className="metric-label"><Icons.cash size={14} /> Valor total</div>
            <div className="metric-icon" style={{ background: 'var(--zm-blue-light)', color: '#1F5C92' }}><Icons.cash size={17} /></div>
          </div>
          <div className="metric-value" style={{ fontSize: 22 }}>S/. {valorTotal.toFixed(0)}</div>
          <div className="metric-delta">stock × precio</div>
        </div>

        <div className="card metric">
          <div className="metric-head">
            <div className="metric-label" style={{ color: stockBajoCount > 0 ? '#876615' : undefined }}>
              <Icons.alert size={14} /> Stock bajo
            </div>
            <div className="metric-icon" style={{
              background: stockBajoCount > 0 ? '#FBEFC8' : 'var(--zm-primary-bg)',
              color: stockBajoCount > 0 ? '#876615' : 'var(--zm-primary-dark)',
            }}>
              <Icons.alert size={17} />
            </div>
          </div>
          <div className="metric-value" style={{ color: stockBajoCount > 0 ? 'var(--zm-red)' : 'var(--zm-primary-dark)' }}>
            {stockBajoCount}
          </div>
          <div className="metric-delta" style={{ color: stockBajoCount > 0 ? '#876615' : undefined }}>
            {stockBajoCount > 0 ? 'requieren reabastecimiento' : 'todo en orden'}
          </div>
        </div>
      </div>

      {/* Filtros por categoría */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['Todos', ...CATS].map(cat => {
          const active = catFilter === cat
          const count  = cat === 'Todos' ? productos.length : productos.filter(p => p.categoria === cat).length
          const [bg, fg] = CAT_COLOR[cat] || ['var(--zm-primary-bg)', 'var(--zm-primary-dark)']
          return (
            <button key={cat} onClick={() => setCatFilter(cat)} style={{
              padding: '5px 13px', borderRadius: 20, border: '1px solid',
              fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
              borderColor: active ? (cat === 'Todos' ? 'var(--zm-primary)' : fg) : 'var(--zm-border)',
              background: active ? (cat === 'Todos' ? 'var(--zm-primary-bg)' : bg) : 'var(--zm-surface)',
              color: active ? (cat === 'Todos' ? 'var(--zm-primary-dark)' : fg) : 'var(--zm-text-2)',
            }}>
              {cat}
              <span style={{ marginLeft: 5, opacity: 0.55, fontSize: 11.5 }}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Tabla */}
      <div className="card tbl-card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th style={{ textAlign: 'right' }}>Stock</th>
              <th style={{ textAlign: 'right' }}>Mínimo</th>
              <th style={{ textAlign: 'right' }}>Precio</th>
              <th>Proveedor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--zm-text-3)' }}>Cargando…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 52 }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>📦</div>
                <div style={{ fontWeight: 600, color: 'var(--zm-text-2)' }}>Sin resultados</div>
                <div style={{ fontSize: 12.5, color: 'var(--zm-text-3)', marginTop: 4 }}>
                  Prueba con otro filtro o cambia la búsqueda
                </div>
              </td></tr>
            )}
            {filtered.map(p => (
              <tr key={p.id} className={p.stockBajo ? 'tbl-row-warn' : ''} onClick={() => { setDelta(''); setStockModal(p) }}>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                  {p.stock <= 0
                    ? <span className="badge badge-red" style={{ marginTop: 3 }}>Agotado</span>
                    : p.stockBajo
                      ? <span className="badge badge-yellow" style={{ marginTop: 3 }}>Stock bajo</span>
                      : null
                  }
                </td>
                <td>
                  <span style={catBadge(p.categoria)}>{p.categoria}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <StockBar actual={p.stock} minimo={p.stockMin} />
                </td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--zm-text-3)', fontSize: 12.5 }}>
                  {p.stockMin}
                </td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>S/. {Number(p.precio).toFixed(2)}</td>
                <td style={{ color: 'var(--zm-text-2)', fontSize: 12.5 }}>{p.proveedor || '—'}</td>
                <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}><Icons.edit size={14} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(p.id)}><Icons.trash size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal agregar / editar */}
      {showAdd && (
        <Modal title={editing ? 'Editar producto' : 'Agregar producto'}
          onClose={() => { setShowAdd(false); setEditing(null) }}
          footer={<>
            <button className="btn" onClick={() => { setShowAdd(false); setEditing(null) }}>Cancelar</button>
            <button className="btn btn-primary" onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </>}>
          <div className="field">
            <label>Nombre</label>
            <input value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} placeholder="Ej: Shampoo medicado" />
          </div>
          <div className="field-row">
            <div className="field"><label>Categoría</label>
              <select value={form.categoria} onChange={e => setForm(f => ({...f, categoria: e.target.value}))}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field"><label>Proveedor</label>
              <input value={form.proveedor} onChange={e => setForm(f => ({...f, proveedor: e.target.value}))} />
            </div>
          </div>
          <div className="field-row-3">
            <div className="field"><label>Stock actual</label>
              <input type="number" value={form.stock_actual} onChange={e => setForm(f => ({...f, stock_actual: e.target.value}))} />
            </div>
            <div className="field"><label>Stock mínimo</label>
              <input type="number" value={form.stock_minimo} onChange={e => setForm(f => ({...f, stock_minimo: e.target.value}))} />
            </div>
            <div className="field"><label>Precio (S/.)</label>
              <input type="number" step="0.01" value={form.precio} onChange={e => setForm(f => ({...f, precio: e.target.value}))} />
            </div>
          </div>
        </Modal>
      )}

      {/* Modal ajuste de stock */}
      {stockModal && (
        <Modal title={`Ajustar stock — ${stockModal.nombre}`} onClose={() => setStockModal(null)}
          footer={<>
            <button className="btn" onClick={() => setStockModal(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={ajustar} disabled={!delta || delta === '0'}>
              Confirmar ajuste
            </button>
          </>}>

          {/* Resumen actual / resultado */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: 'var(--zm-bg)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--zm-border)' }}>
            {[
              { label: 'ACTUAL', val: stockModal.stock, color: stockModal.stockBajo ? 'var(--zm-red)' : 'var(--zm-primary-dark)' },
              { label: 'MÍNIMO', val: stockModal.stockMin, color: 'var(--zm-text-2)' },
              ...(delta && delta !== '0' ? [{ label: 'RESULTADO', val: resultado, color: resultado < stockModal.stockMin ? 'var(--zm-red)' : 'var(--zm-primary-dark)' }] : []),
            ].map((item, i, arr) => (
              <div key={item.label} style={{ flex: 1, padding: '14px 18px', borderRight: i < arr.length - 1 ? '1px solid var(--zm-border)' : 'none' }}>
                <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--zm-text-3)', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.val}</div>
              </div>
            ))}
          </div>

          <div className="field">
            <label>Ajuste <span style={{ color: 'var(--zm-text-3)', fontWeight: 400 }}>(+ agregar · − restar)</span></label>
            <input type="number" value={delta} onChange={e => setDelta(e.target.value)} autoFocus placeholder="Ej: 10 o -3" />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {[5, 10, 20, 50].map(n => (
              <button key={n} className="btn btn-sm" onClick={() => setDelta(String(n))}>+{n}</button>
            ))}
            <div style={{ width: 1, background: 'var(--zm-border)', margin: '0 2px' }} />
            {[1, 5].map(n => (
              <button key={n} className="btn btn-sm" style={{ color: 'var(--zm-red)', borderColor: '#f1bfb1' }} onClick={() => setDelta(String(-n))}>−{n}</button>
            ))}
          </div>
        </Modal>
      )}

      {deleteId && <ConfirmDialog onConfirm={confirmarDelete} onCancel={() => setDeleteId(null)} />}
    </>
  )
}
