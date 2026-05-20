'use client'
import { useState } from 'react'
import { useCitas, useClientes, useMascotas, useServicios } from '@/lib/hooks'
import { completarCita, createCita, cancelarCita, createCliente, createMascota } from '@/lib/server-actions'
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
  const { mascotas, refresh: refreshMascotas } = useMascotas(form.clienteId && form.clienteId !== '__new__' ? form.clienteId : undefined)
  const [step, setStep] = useState<1|2>(1)
  const [newClientForm, setNewClientForm] = useState({ nombre: '', apellido: '', telefono: '', email: '' })
  const [savingNewClient, setSavingNewClient] = useState(false)
  const [newPetForm, setNewPetForm] = useState({ nombre: '', especie: 'Perro', raza: '', edad_años: '', peso_kg: '', tamaño: 'Mediano', temperamento: 'Tranquilo' })
  const [savingNewPet, setSavingNewPet] = useState(false)

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

  const crearNuevaMascota = async () => {
    if (!newPetForm.nombre) { toast('Ingresa el nombre de la mascota', 'error'); return }
    setSavingNewPet(true)
    const { error, id } = await createMascota({
      nombre: newPetForm.nombre, especie: newPetForm.especie, raza: newPetForm.raza,
      cliente_id: form.clienteId, edad_años: Number(newPetForm.edad_años) || null,
      peso_kg: Number(newPetForm.peso_kg) || null, tamaño: newPetForm.tamaño,
      temperamento: newPetForm.temperamento,
    })
    setSavingNewPet(false)
    if (error) { toast(error, 'error'); return }
    toast('Mascota agregada')
    refreshMascotas()
    setNewPetForm({ nombre: '', especie: 'Perro', raza: '', edad_años: '', peso_kg: '', tamaño: 'Mediano', temperamento: 'Tranquilo' })
    setForm(f => ({...f, mascotaId: id!}))
  }

  const resetNueva = () => {
    setShowNueva(false); setStep(1); setForm(EMPTY)
    setNewClientForm({ nombre: '', apellido: '', telefono: '', email: '' })
    setNewPetForm({ nombre: '', especie: 'Perro', raza: '', edad_años: '', peso_kg: '', tamaño: 'Mediano', temperamento: 'Tranquilo' })
  }

  const guardarNueva = async () => {
    if (!form.clienteId || !form.mascotaId || !form.servicioId) {
      toast('Completa todos los campos', 'error'); return
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
                <div className="appt-pet" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  🐾 {c.mascotaNombre} · {c.mascotaRaza}
                  {(c as any).esPrimeraVisita && <span style={{ background: '#FEF9E7', color: '#7D6008', borderRadius: 5, padding: '1px 6px', fontSize: 11, fontWeight: 600 }}>1ª visita</span>}
                </div>
                <div className="appt-svc">{c.servicio}</div>
              </div>
              <div className="appt-meta">
                <EstadoBadge estado={c.estado} />
                {(c as any).fuente === 'telegram' && <span style={{ background: '#E8F4FD', color: '#0369A1', borderRadius: 5, padding: '2px 7px', fontSize: 11, fontWeight: 600 }}>Telegram</span>}
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
        <Modal title={`Nueva cita — Paso ${step} de 2`} large onClose={resetNueva}
          footer={step === 1 ? (
            <>
              <button className="btn" onClick={resetNueva}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => {
                if (!form.clienteId || form.clienteId === '__new__') { toast('Selecciona o crea un cliente primero', 'error'); return }
                if (!form.mascotaId || form.mascotaId === '__new__') { toast('Selecciona o agrega una mascota primero', 'error'); return }
                setStep(2)
              }}>Siguiente →</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => setStep(1)}>← Anterior</button>
              <button className="btn btn-primary" onClick={guardarNueva}><Icons.check size={14} /> Crear cita</button>
            </>
          )}>

          {/* Indicador de pasos */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--zm-primary)' }} />
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: step === 2 ? 'var(--zm-primary)' : 'var(--zm-border)' }} />
          </div>

          {step === 1 && (
            <>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--zm-text-2)', marginBottom: 10 }}>1 · Cliente</div>
              <div className="field">
                <label>Cliente</label>
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

              {form.clienteId && form.clienteId !== '__new__' && (
                <>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--zm-text-2)', marginBottom: 10, marginTop: 4 }}>2 · Mascota</div>
                  <div className="field">
                    <label>Mascota</label>
                    <select value={form.mascotaId} onChange={e => setForm(f => ({...f, mascotaId: e.target.value}))}>
                      <option value="">Seleccionar mascota…</option>
                      <option value="__new__">＋ Agregar nueva mascota…</option>
                      {mascotas.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.raza || m.especie})</option>)}
                    </select>
                  </div>
                  {form.mascotaId === '__new__' && (
                    <div style={{ background: 'var(--zm-primary-bg)', border: '1px solid var(--zm-primary-light)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--zm-primary-dark)', marginBottom: 10 }}>Datos de la nueva mascota</div>
                      <div className="field-row">
                        <div className="field" style={{ marginBottom: 8 }}><label>Nombre *</label><input value={newPetForm.nombre} onChange={e => setNewPetForm(f => ({...f, nombre: e.target.value}))} placeholder="Ej: Max" /></div>
                        <div className="field" style={{ marginBottom: 8 }}><label>Especie</label>
                          <select value={newPetForm.especie} onChange={e => setNewPetForm(f => ({...f, especie: e.target.value}))}>
                            {['Perro','Gato','Conejo','Ave','Iguana','Reptil','Hámster','Hurón','Pez','Otro'].map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="field-row">
                        <div className="field" style={{ marginBottom: 8 }}><label>Raza</label><input value={newPetForm.raza} onChange={e => setNewPetForm(f => ({...f, raza: e.target.value}))} placeholder="Ej: Labrador" /></div>
                        <div className="field" style={{ marginBottom: 8 }}><label>Tamaño</label>
                          <select value={newPetForm.tamaño} onChange={e => setNewPetForm(f => ({...f, tamaño: e.target.value}))}>
                            {['Pequeño','Mediano','Grande'].map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="field-row">
                        <div className="field" style={{ marginBottom: 8 }}><label>Edad (años)</label><input type="number" value={newPetForm.edad_años} onChange={e => setNewPetForm(f => ({...f, edad_años: e.target.value}))} /></div>
                        <div className="field" style={{ marginBottom: 8 }}><label>Peso (kg)</label><input type="number" step="0.1" value={newPetForm.peso_kg} onChange={e => setNewPetForm(f => ({...f, peso_kg: e.target.value}))} /></div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={crearNuevaMascota} disabled={savingNewPet}>
                        <Icons.check size={13} /> {savingNewPet ? 'Creando…' : 'Agregar mascota y continuar'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              {(() => {
                const cli = clientes.find((c: any) => c.id === form.clienteId)
                const pet = mascotas.find((m: any) => m.id === form.mascotaId)
                return cli && pet ? (
                  <div style={{ background: 'var(--zm-primary-bg)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--zm-primary-dark)' }}>
                    <b>{cli.nombre}</b> · {pet.nombre} ({(pet as any).raza || (pet as any).especie})
                  </div>
                ) : null
              })()}
              <div className="field-row">
                <div className="field"><label>Fecha</label>
                  <input type="date" value={form.fecha} onChange={e => setForm(f => ({...f, fecha: e.target.value}))} />
                </div>
                <div className="field"><label>Hora inicio</label>
                  <input type="time" value={form.horaInicio} onChange={e => setForm(f => ({...f, horaInicio: e.target.value}))} />
                </div>
              </div>
              <div className="field"><label>Servicio</label>
                <select value={form.servicioId} onChange={e => setForm(f => ({...f, servicioId: e.target.value}))}>
                  <option value="">Seleccionar servicio…</option>
                  {(servicios as any[]).map(s => <option key={s.id} value={s.id}>{s.nombre} ({s.tiempo_base_minutos}min — S/. {s.precio_base})</option>)}
                </select>
              </div>
            </>
          )}
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
