'use client'
import { useState } from 'react'
import { useCitas, useClientes, useMascotas, useServicios } from '@/lib/hooks'
import { completarCita, createCita, cancelarCita, createCliente } from '@/lib/server-actions'
import { Modal } from '@/components/Modal'
import { EstadoBadge } from '@/components/EstadoBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Icons } from '@/components/Icons'
import { useToast } from '@/components/Toast'

export default function Agenda() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const { citas, refresh } = useCitas(fecha)
  const toast = useToast()

  const [completando, setCompletando] = useState<any>(null)
  const [tiempoReal, setTiempoReal] = useState('')
  const [saving, setSaving] = useState(false)

  const [showNueva, setShowNueva] = useState(false)
  const [cancelId, setCancelId] = useState<string | null>(null)

  const { clientes, refresh: refreshClientes } = useClientes()
  const { servicios } = useServicios()
  const EMPTY = { clienteId: '', mascotaId: '', servicioId: '', fecha, horaInicio: '09:00' }
  const [form, setForm] = useState(EMPTY)
  const { mascotas } = useMascotas(form.clienteId && form.clienteId !== '__new__' ? form.clienteId : undefined)
  const [newClientForm, setNewClientForm] = useState({ nombre: '', apellido: '', telefono: '', email: '' })
  const [savingNewClient, setSavingNewClient] = useState(false)

  const total = citas.length
  const completadas = citas.filter(c => c.estado === 'completada').length

  const confirmarCompleta = async () => {
    if (!completando) return
    setSaving(true)
    const t = parseInt(tiempoReal) || completando.duracion
    const { error } = await completarCita(completando.id, t)
    setSaving(false)
    if (error) { toast(error, 'error'); return }
    toast('Cita completada'); setCompletando(null); refresh()
  }

  const confirmarCancelar = async () => {
    if (!cancelId) return
    const { error } = await cancelarCita(cancelId)
    if (error) { toast(error, 'error'); return }
    toast('Cita cancelada'); setCancelId(null); refresh()
  }

  const crearNuevoCliente = async () => {
    if (!newClientForm.nombre || !newClientForm.apellido || !newClientForm.telefono) {
      toast('Nombre, apellido y teléfono son obligatorios', 'error'); return
    }
    setSavingNewClient(true)
    const { error, id } = await createCliente(newClientForm)
    setSavingNewClient(false)
    if (error) { toast(error, 'error'); return }
    toast('Cliente creado')
    refreshClientes()
    setNewClientForm({ nombre: '', apellido: '', telefono: '', email: '' })
    setForm(f => ({...f, clienteId: id!, mascotaId: ''}))
  }

  const guardarNueva = async () => {
    if (!form.clienteId || form.clienteId === '__new__' || !form.mascotaId || !form.servicioId) {
      toast(form.clienteId === '__new__' ? 'Primero crea el cliente' : 'Completa todos los campos', 'error'); return
    }
    const svc = (servicios as any[]).find(s => s.id === form.servicioId)
    const dur = svc?.tiempo_base_minutos || 60
    const [h, m] = form.horaInicio.split(':').map(Number)
    const endMin = h * 60 + m + dur
    const horaFin = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}:00`
    const { error } = await createCita({
      fecha: form.fecha, hora_inicio: form.horaInicio + ':00', hora_fin_estimada: horaFin,
      cliente_id: form.clienteId, mascota_id: form.mascotaId, servicio_id: form.servicioId,
      tiempo_calculado_minutos: dur, estado: 'pendiente',
    })
    if (error) { toast(error, 'error'); return }
    toast('Cita creada'); setShowNueva(false); setForm(EMPTY); refresh()
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Agenda del día</h1>
          <div className="page-sub">{total} citas programadas · {completadas} completadas</div>
        </div>
        <div className="page-actions">
          <input type="date" className="filter-select" value={fecha}
            onChange={e => { setFecha(e.target.value); setForm(f => ({...f, fecha: e.target.value})) }}
            style={{ padding: '7px 10px' }} />
          <button className="btn btn-primary" onClick={() => setShowNueva(true)}><Icons.plus /> Nueva cita</button>
        </div>
      </div>

      <div className="timeline">
        {!citas.length && <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--zm-text-3)' }}>No hay citas para esta fecha</p>}
        {citas.map(c => {
          const isAction = ['pendiente', 'en-proceso', 'retrasada'].includes(c.estado)
          return (
            <div key={c.id} className={`appt appt-${c.estado}`}>
              <div>
                <div className="appt-hora">{c.hora}</div>
                <div className="appt-dur">{c.duracion} min est.</div>
              </div>
              <div>
                <div className="appt-cli">{c.clienteNombre}</div>
                <div className="appt-tel">{c.clienteTelefono}</div>
                <div className="appt-pet">🐾 {c.mascotaNombre} · {c.mascotaRaza} · {c.mascotaTamaño}</div>
                <div className="appt-svc">{c.servicio}</div>
              </div>
              <div className="appt-meta">
                <EstadoBadge estado={c.estado} />
                {isAction ? (
                  <>
                    <button className="btn btn-success btn-sm" onClick={() => { setCompletando(c); setTiempoReal(String(c.duracion)) }}>
                      <Icons.check size={14} /> Completar
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setCancelId(c.id)} title="Cancelar cita">
                      <Icons.close size={14} />
                    </button>
                  </>
                ) : c.tiempoReal ? (
                  <span style={{ fontSize: 12.5, color: 'var(--zm-text-3)', fontVariantNumeric: 'tabular-nums' }}>Real: {c.tiempoReal}min</span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {completando && (
        <Modal title="Completar cita" onClose={() => setCompletando(null)}
          footer={<>
            <button className="btn" onClick={() => setCompletando(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={confirmarCompleta} disabled={saving}>
              <Icons.check size={14} /> {saving ? 'Guardando…' : 'Confirmar'}
            </button>
          </>}>
          <div style={{ marginBottom: 16, padding: 14, background: 'var(--zm-bg)', borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: 'var(--zm-text-2)' }}>{completando.hora} · {completando.servicio}</div>
            <div style={{ fontWeight: 600, marginTop: 2 }}>{completando.clienteNombre} — {completando.mascotaNombre}</div>
            <div style={{ fontSize: 12.5, color: 'var(--zm-text-3)', marginTop: 6 }}>Tiempo estimado: <b>{completando.duracion} min</b></div>
          </div>
          <div className="field">
            <label>Tiempo real (minutos)</label>
            <input type="number" value={tiempoReal} onChange={e => setTiempoReal(e.target.value)} autoFocus />
          </div>
        </Modal>
      )}

      {showNueva && (
        <Modal title="Nueva cita" large onClose={() => setShowNueva(false)}
          footer={<>
            <button className="btn" onClick={() => setShowNueva(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={guardarNueva}><Icons.check size={14} /> Crear cita</button>
          </>}>
          <div className="field-row">
            <div className="field"><label>Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm(f => ({...f, fecha: e.target.value}))} />
            </div>
            <div className="field"><label>Hora inicio</label>
              <input type="time" value={form.horaInicio} onChange={e => setForm(f => ({...f, horaInicio: e.target.value}))} />
            </div>
          </div>
          <div className="field"><label>Cliente</label>
            <select value={form.clienteId} onChange={e => setForm(f => ({...f, clienteId: e.target.value, mascotaId: ''}))}>
              <option value="">Seleccionar cliente…</option>
              <option value="__new__">＋ Nuevo cliente…</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          {form.clienteId === '__new__' && (
            <div style={{ background: 'var(--zm-primary-bg)', border: '1px solid var(--zm-primary-light)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--zm-primary-dark)', marginBottom: 10 }}>Datos del nuevo cliente</div>
              <div className="field-row">
                <div className="field" style={{ marginBottom: 8 }}><label>Nombre *</label><input value={newClientForm.nombre} onChange={e => setNewClientForm(f => ({...f, nombre: e.target.value}))} placeholder="Ej: Ana" /></div>
                <div className="field" style={{ marginBottom: 8 }}><label>Apellido *</label><input value={newClientForm.apellido} onChange={e => setNewClientForm(f => ({...f, apellido: e.target.value}))} placeholder="Ej: García" /></div>
              </div>
              <div className="field-row">
                <div className="field" style={{ marginBottom: 8 }}><label>Teléfono *</label><input value={newClientForm.telefono} onChange={e => setNewClientForm(f => ({...f, telefono: e.target.value}))} placeholder="+51 999 888 777" /></div>
                <div className="field" style={{ marginBottom: 8 }}><label>Email</label><input type="email" value={newClientForm.email} onChange={e => setNewClientForm(f => ({...f, email: e.target.value}))} placeholder="cliente@gmail.com" /></div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={crearNuevoCliente} disabled={savingNewClient}>
                <Icons.check size={13} /> {savingNewClient ? 'Creando…' : 'Crear cliente y continuar'}
              </button>
            </div>
          )}
          <div className="field"><label>Mascota</label>
            <select value={form.mascotaId} onChange={e => setForm(f => ({...f, mascotaId: e.target.value}))} disabled={!form.clienteId}>
              <option value="">Seleccionar mascota…</option>
              {mascotas.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.raza})</option>)}
            </select>
          </div>
          <div className="field"><label>Servicio</label>
            <select value={form.servicioId} onChange={e => setForm(f => ({...f, servicioId: e.target.value}))}>
              <option value="">Seleccionar servicio…</option>
              {(servicios as any[]).map(s => <option key={s.id} value={s.id}>{s.nombre} ({s.tiempo_base_minutos}min — S/. {s.precio_base})</option>)}
            </select>
          </div>
        </Modal>
      )}

      {cancelId && (
        <ConfirmDialog
          message="¿Cancelar esta cita? Esta acción no se puede deshacer."
          onConfirm={confirmarCancelar}
          onCancel={() => setCancelId(null)}
        />
      )}
    </>
  )
}
