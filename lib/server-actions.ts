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
  const { error } = await admin().from('clientes').insert(data)
  return { error: error?.message }
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
  const { error } = await admin().from('mascotas').insert(data)
  return { error: error?.message }
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
    .select('*, clientes(id,nombre,apellido,telefono), mascotas(id,nombre,raza,tamaño), servicios(id,nombre,precio_base,tiempo_base_minutos)')
    .order('hora_inicio')
  if (fecha) q = (q as any).eq('fecha', fecha)
  const { data } = await (q as any)
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
    servicioId: c.servicio_id,
    servicio: c.servicios?.nombre || '',
    duracion: c.tiempo_calculado_minutos || c.servicios?.tiempo_base_minutos || 0,
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
    .select('*, clientes(nombre,apellido), mascotas(nombre,raza), servicios(nombre,tiempo_base_minutos)')
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
