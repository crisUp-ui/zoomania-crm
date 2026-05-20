'use server'
import { createClient } from '@supabase/supabase-js'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
}

function minDiff(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

// ── CLIENTES ─────────────────────────────────────────────────────────────────

export async function getClientes() {
  const { data } = await admin()
    .from('clientes')
    .select('*, mascotas(id)')
    .order('apellido')
  return (data || []).map((c: any) => ({
    id: c.id,
    nombre: `${c.nombre} ${c.apellido}`,
    _nombre: c.nombre,
    _apellido: c.apellido,
    telefono: c.telefono || '',
    email: c.email || '',
    direccion: c.direccion || '',
    notas: c.notas || '',
    numMascotas: (c.mascotas || []).length,
    ultimaVisita: new Date(c.updated_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }),
  }))
}

export async function createCliente(data: { nombre: string; apellido: string; telefono: string; email?: string; direccion?: string; notas?: string }) {
  const { data: created, error } = await admin().from('clientes').insert(data).select('id').single()
  return { error: error?.message, id: created?.id as string | undefined }
}

export async function updateCliente(id: string, data: { nombre: string; apellido: string; telefono: string; email?: string; direccion?: string; notas?: string }) {
  const { error } = await admin().from('clientes').update(data).eq('id', id)
  return { error: error?.message }
}

export async function deleteCliente(id: string) {
  const { error } = await admin().from('clientes').delete().eq('id', id)
  return { error: error?.message }
}

// ── MASCOTAS ─────────────────────────────────────────────────────────────────

export async function getMascotas(clienteId?: string) {
  let q = admin()
    .from('mascotas')
    .select('*, clientes(nombre, apellido)')
    .order('nombre')
  if (clienteId) q = (q as any).eq('cliente_id', clienteId)
  const { data } = await (q as any)
  return (data || []).map((m: any) => ({
    id: m.id,
    nombre: m.nombre,
    especie: m.especie || 'Perro',
    dueñoId: m.cliente_id,
    dueño: m.clientes ? `${m.clientes.nombre} ${m.clientes.apellido}` : '',
    raza: m.raza || '',
    tamaño: m.tamaño || '',
    peso: m.peso_kg || 0,
    tipoPelo: m.tipo_pelo || '',
    estadoPelaje: m.estado_pelaje || '',
    temperamento: m.temperamento || '',
    edad: m.edad_años || 0,
    ultimaVisita: new Date(m.updated_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }),
    notas: m.notas_especiales || '',
  }))
}

export async function createMascota(data: any) {
  const { data: created, error } = await admin().from('mascotas').insert(data).select('id').single()
  return { error: error?.message, id: created?.id as string | undefined }
}

export async function updateMascota(id: string, data: any) {
  const { error } = await admin().from('mascotas').update(data).eq('id', id)
  return { error: error?.message }
}

export async function deleteMascota(id: string) {
  const { error } = await admin().from('mascotas').delete().eq('id', id)
  return { error: error?.message }
}

// ── SERVICIOS ─────────────────────────────────────────────────────────────────

export async function getServicios() {
  const { data } = await admin().from('servicios').select('*').eq('activo', true).order('nombre')
  return (data || []) as any[]
}

// ── CITAS ─────────────────────────────────────────────────────────────────────

export async function getCitas(fecha?: string) {
  let q = admin()
    .from('citas')
    .select('*, clientes(id,nombre,apellido,telefono), mascotas(id,nombre,raza,tamaño,especie), servicios(id,nombre,precio_base,tiempo_base_minutos)')
    .order('hora_inicio')
  if (fecha) q = (q as any).eq('fecha', fecha)
  const { data } = await (q as any)
  const mascotaIds = [...new Set((data || []).map((c: any) => c.mascota_id))] as string[]
  let primerasVisitas = new Set<string>()
  if (mascotaIds.length > 0) {
    const db2 = admin()
    const { data: prev } = await db2.from('citas').select('mascota_id').in('mascota_id', mascotaIds).eq('estado', 'completada')
    const visited = new Set((prev || []).map((c: any) => c.mascota_id))
    mascotaIds.forEach(id => { if (!visited.has(id)) primerasVisitas.add(id) })
  }
  return (data || []).map((c: any) => ({
    id: c.id,
    hora: (c.hora_inicio || '').substring(0, 5),
    horaInicio: c.hora_inicio,
    horaFin: c.hora_fin_estimada,
    horaFinReal: c.hora_fin_real,
    fecha: c.fecha,
    clienteId: c.cliente_id,
    clienteNombre: c.clientes ? `${c.clientes.nombre} ${c.clientes.apellido}` : '',
    clienteTelefono: c.clientes?.telefono || '',
    mascotaId: c.mascota_id,
    mascotaNombre: c.mascotas?.nombre || '',
    mascotaRaza: c.mascotas?.raza || '',
    mascotaTamaño: c.mascotas?.tamaño || '',
    mascotaEspecie: c.mascotas?.especie || 'Perro',
    esPrimeraVisita: primerasVisitas.has(c.mascota_id),
    servicioId: c.servicio_id,
    servicio: c.servicios?.nombre || '',
    duracion: c.tiempo_calculado_minutos || c.servicios?.tiempo_base_minutos || 0,
    precio: parseFloat(c.servicios?.precio_base || '0'),
    estado: c.estado === 'en_proceso' ? 'en-proceso' : (c.estado || 'pendiente'),
    tiempoReal: c.hora_fin_real && c.hora_inicio ? minDiff(c.hora_inicio, c.hora_fin_real) : null,
  }))
}

export async function completarCita(id: string, tiempoReal: number) {
  const now = new Date()
  const horaFinReal = now.toTimeString().substring(0, 8)
  const { error } = await admin()
    .from('citas')
    .update({ estado: 'completada', hora_fin_real: horaFinReal, tiempo_calculado_minutos: tiempoReal })
    .eq('id', id)
  return { error: error?.message }
}

export async function createCita(data: {
  fecha: string; hora_inicio: string; hora_fin_estimada: string;
  cliente_id: string; mascota_id: string; servicio_id: string;
  tiempo_calculado_minutos: number; estado: string;
}) {
  const { error } = await admin().from('citas').insert(data)
  return { error: error?.message }
}

export async function cancelarCita(id: string) {
  const { error } = await admin().from('citas').update({ estado: 'cancelada' }).eq('id', id)
  return { error: error?.message }
}

// ── HISTORIAL (citas completadas) ─────────────────────────────────────────────

export async function getHistorial() {
  const { data } = await admin()
    .from('citas')
    .select('*, clientes(nombre,apellido), mascotas(nombre,raza), servicios(nombre,tiempo_base_minutos,precio_base)')
    .eq('estado', 'completada')
    .order('fecha', { ascending: false })
    .limit(100)
  return (data || []).map((c: any) => {
    const estimado = c.tiempo_calculado_minutos || c.servicios?.tiempo_base_minutos || 0
    const real = c.hora_fin_real && c.hora_inicio ? minDiff(c.hora_inicio, c.hora_fin_real) : estimado
    return {
      id: c.id,
      fecha: new Date(c.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }),
      cliente: c.clientes ? `${c.clientes.nombre} ${c.clientes.apellido}` : '—',
      mascota: c.mascotas ? `${c.mascotas.nombre} (${c.mascotas.raza || 'Sin raza'})` : '—',
      servicio: c.servicios?.nombre || '—',
      estimado,
      real,
      diferencia: real - estimado,
      precio: parseFloat(c.servicios?.precio_base || '0'),
      mes: (c.fecha as string).substring(0, 7),
    }
  })
}

// ── FACTURAS ─────────────────────────────────────────────────────────────────

export async function getFacturas() {
  const { data } = await admin()
    .from('facturas')
    .select('*, clientes(nombre,apellido)')
    .order('fecha', { ascending: false })
  return (data || []).map((f: any) => ({
    id: f.numero_factura || f.id,
    _id: f.id,
    cliente: f.clientes ? `${f.clientes.nombre} ${f.clientes.apellido}` : '—',
    fecha: new Date(f.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }),
    total: parseFloat(f.total || 0).toFixed(2),
    estado: f.estado === 'pagada' ? 'Pagada' : 'Pendiente',
    metodoPago: f.metodo_pago || '',
  }))
}

export async function marcarFacturaPagada(id: string) {
  const { error } = await admin().from('facturas').update({ estado: 'pagada' }).eq('id', id)
  return { error: error?.message }
}

export async function createFactura(data: any) {
  const { error } = await admin().from('facturas').insert(data)
  return { error: error?.message }
}

// ── INVENTARIO ────────────────────────────────────────────────────────────────

export async function getProductos() {
  const { data } = await admin().from('productos').select('*').order('nombre')
  return (data || []).map((p: any) => ({
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria || '',
    stock: p.stock_actual,
    stockMin: p.stock_minimo,
    precio: parseFloat(p.precio || 0).toFixed(2),
    proveedor: p.proveedor || '',
    stockBajo: p.stock_actual <= p.stock_minimo,
  }))
}

export async function createProducto(data: any) {
  const { error } = await admin().from('productos').insert(data)
  return { error: error?.message }
}

export async function updateProducto(id: string, data: any) {
  const { error } = await admin().from('productos').update(data).eq('id', id)
  return { error: error?.message }
}

export async function deleteProducto(id: string) {
  const { error } = await admin().from('productos').delete().eq('id', id)
  return { error: error?.message }
}

export async function ajustarStock(id: string, nuevoStock: number) {
  const { error } = await admin().from('productos').update({ stock_actual: nuevoStock }).eq('id', id)
  return { error: error?.message }
}

// ── HISTORIA CLÍNICA ──────────────────────────────────────────────────────────

export async function searchClientes(query: string) {
  if (!query || query.length < 2) return []
  const db = admin()
  const { data: byClient } = await db
    .from('clientes')
    .select('id, nombre, apellido, telefono, mascotas(id, nombre)')
    .or(`nombre.ilike.%${query}%,apellido.ilike.%${query}%,telefono.ilike.%${query}%`)
    .limit(6)
  const { data: byPet } = await db
    .from('mascotas')
    .select('cliente_id, nombre, clientes(id, nombre, apellido, telefono, mascotas(id, nombre))')
    .ilike('nombre', `%${query}%`)
    .limit(4)
  const seen = new Set<string>()
  const results: any[] = []
  for (const c of (byClient || [])) {
    if (!seen.has(c.id)) {
      seen.add(c.id)
      results.push({ id: c.id, nombre: `${c.nombre} ${c.apellido}`, telefono: c.telefono || '', mascotas: (c as any).mascotas || [] })
    }
  }
  for (const m of (byPet || [])) {
    const c = (m as any).clientes
    if (c && !seen.has(c.id)) {
      seen.add(c.id)
      results.push({ id: c.id, nombre: `${c.nombre} ${c.apellido}`, telefono: c.telefono || '', mascotas: c.mascotas || [] })
    }
  }
  return results.slice(0, 8)
}

export async function getHistoriaClinica(clienteId: string) {
  const db = admin()
  const today = new Date().toISOString().split('T')[0]
  const [{ data: c }, { data: mascotas }, { data: historial }, { data: proximas }] = await Promise.all([
    db.from('clientes').select('*').eq('id', clienteId).single(),
    db.from('mascotas').select('*').eq('cliente_id', clienteId).order('nombre'),
    db.from('citas')
      .select('*, mascotas(nombre), servicios(nombre, tiempo_base_minutos)')
      .eq('cliente_id', clienteId).eq('estado', 'completada')
      .order('fecha', { ascending: false }).limit(10),
    db.from('citas')
      .select('*, mascotas(nombre), servicios(nombre)')
      .eq('cliente_id', clienteId).gte('fecha', today)
      .not('estado', 'eq', 'cancelada')
      .order('fecha').order('hora_inicio').limit(5),
  ])
  const mascotaIds = (mascotas || []).map((m: any) => m.id)
  let alertas: any[] = []
  if (mascotaIds.length > 0) {
    const { data } = await db.from('alertas_medicas').select('*, mascotas(nombre)').in('mascota_id', mascotaIds).order('created_at', { ascending: false })
    alertas = data || []
  }
  const now = new Date()
  return {
    cliente: c ? {
      id: (c as any).id, nombre: `${(c as any).nombre} ${(c as any).apellido}`,
      _nombre: (c as any).nombre, _apellido: (c as any).apellido,
      telefono: (c as any).telefono || '', email: (c as any).email || '',
      direccion: (c as any).direccion || '', notas: (c as any).notas || '',
    } : null,
    mascotas: mascotas || [],
    historial: (historial || []).map((h: any) => {
      const estimado = h.tiempo_calculado_minutos || h.servicios?.tiempo_base_minutos || 0
      const real = h.hora_fin_real && h.hora_inicio ? minDiff(h.hora_inicio, h.hora_fin_real) : estimado
      return {
        id: h.id,
        fecha: new Date(h.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }),
        servicio: h.servicios?.nombre || '—',
        mascota: h.mascotas?.nombre || '—',
        diferencia: real - estimado,
      }
    }),
    proximasCitas: (proximas || []).map((p: any) => ({
      id: p.id,
      fecha: new Date(p.fecha).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' }),
      hora: (p.hora_inicio || '').substring(0, 5),
      servicio: p.servicios?.nombre || '—',
      mascota: p.mascotas?.nombre || '—',
    })),
    alertas: alertas.map((a: any) => {
      const daysUntil = a.fecha_vencimiento
        ? Math.floor((new Date(a.fecha_vencimiento).getTime() - now.getTime()) / 86400000)
        : null
      return {
        id: a.id,
        descripcion: a.descripcion,
        tipo: a.tipo,
        mascota_nombre: a.mascotas?.nombre || '',
        fecha_vencimiento: a.fecha_vencimiento
          ? new Date(a.fecha_vencimiento).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
          : null,
        urgencia: (daysUntil !== null && daysUntil <= 30) || a.tipo === 'alergia' ? 'alta' : 'media',
      }
    }),
  }
}

export async function updateClienteNotas(id: string, notas: string) {
  const { error } = await admin().from('clientes').update({ notas }).eq('id', id)
  return { error: error?.message }
}

export async function createAlerta(data: { mascota_id: string; tipo: string; descripcion: string; fecha_vencimiento?: string }) {
  const { error } = await admin().from('alertas_medicas').insert(data)
  return { error: error?.message }
}

export async function deleteAlerta(id: string) {
  const { error } = await admin().from('alertas_medicas').delete().eq('id', id)
  return { error: error?.message }
}

export async function getHistoriaClinicaMascota(mascotaId: string) {
  const db = admin()
  const today = new Date().toISOString().split('T')[0]
  const now = new Date()
  const [{ data: m }, { data: historial }, { data: proximas }, { data: alertas }] = await Promise.all([
    db.from('mascotas').select('*, clientes(id,nombre,apellido,telefono,email)').eq('id', mascotaId).single(),
    db.from('citas').select('*, servicios(nombre,tiempo_base_minutos)').eq('mascota_id', mascotaId).eq('estado', 'completada').order('fecha', { ascending: false }).limit(20),
    db.from('citas').select('*, servicios(nombre)').eq('mascota_id', mascotaId).gte('fecha', today).not('estado', 'eq', 'cancelada').order('fecha').order('hora_inicio').limit(5),
    db.from('alertas_medicas').select('*').eq('mascota_id', mascotaId).order('created_at', { ascending: false }),
  ])
  return {
    mascota: m ? {
      id: (m as any).id, nombre: (m as any).nombre,
      especie: (m as any).especie || 'Perro', raza: (m as any).raza || '',
      edad_años: (m as any).edad_años, peso_kg: (m as any).peso_kg,
      tamaño: (m as any).tamaño || '', temperamento: (m as any).temperamento || '',
      tipo_pelo: (m as any).tipo_pelo || '', estado_pelaje: (m as any).estado_pelaje || '',
      notas_especiales: (m as any).notas_especiales || '',
      cliente: (m as any).clientes ? {
        id: (m as any).clientes.id,
        nombre: `${(m as any).clientes.nombre} ${(m as any).clientes.apellido}`,
        telefono: (m as any).clientes.telefono || '',
        email: (m as any).clientes.email || '',
      } : null,
    } : null,
    historial: (historial || []).map((h: any) => {
      const estimado = h.tiempo_calculado_minutos || h.servicios?.tiempo_base_minutos || 0
      const real = h.hora_fin_real && h.hora_inicio ? minDiff(h.hora_inicio, h.hora_fin_real) : estimado
      return { id: h.id, fecha: new Date(h.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }), servicio: h.servicios?.nombre || '—', diferencia: real - estimado }
    }),
    proximasCitas: (proximas || []).map((p: any) => ({
      id: p.id, fecha: new Date(p.fecha).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' }),
      hora: (p.hora_inicio || '').substring(0, 5), servicio: p.servicios?.nombre || '—',
    })),
    alertas: (alertas || []).map((a: any) => {
      const daysUntil = a.fecha_vencimiento ? Math.floor((new Date(a.fecha_vencimiento).getTime() - now.getTime()) / 86400000) : null
      return {
        id: a.id, descripcion: a.descripcion, tipo: a.tipo,
        fecha_vencimiento: a.fecha_vencimiento ? new Date(a.fecha_vencimiento).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
        urgencia: daysUntil !== null ? (daysUntil < 0 ? 'vencida' : daysUntil <= 7 ? 'alta' : daysUntil <= 30 ? 'media' : 'baja') : 'baja',
      }
    }),
  }
}
