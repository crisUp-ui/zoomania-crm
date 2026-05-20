export interface Cliente {
  id: string
  nombre: string
  apellido: string
  telefono: string
  email?: string
  direccion?: string
  notas?: string
  created_at: string
  updated_at: string
}

export interface Mascota {
  id: string
  nombre: string
  raza?: string
  tamaño: 'pequeño' | 'mediano' | 'grande'
  peso_kg?: number
  tipo_pelo: 'corto' | 'medio' | 'largo'
  estado_pelaje: 'bueno' | 'enredado' | 'muy_enredado'
  temperamento: 'tranquilo' | 'nervioso' | 'agresivo'
  edad_años?: number
  notas_especiales?: string
  cliente_id: string
  created_at: string
  updated_at: string
}

export interface Servicio {
  id: string
  nombre: string
  descripcion?: string
  tiempo_base_minutos: number
  precio_base: number
  activo: boolean
  created_at: string
}

export interface Cita {
  id: string
  fecha: string
  hora_inicio: string
  hora_fin_estimada?: string
  hora_fin_real?: string
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'
  notas?: string
  cliente_id: string
  mascota_id: string
  servicio_id: string
  tiempo_calculado_minutos?: number
  veterinario_asignado?: string
  created_at: string
  updated_at: string
}

export interface HistorialServicios {
  id: string
  mascota_id: string
  servicio_id: string
  fecha: string
  tiempo_real_minutos?: number
  dificultad: 1 | 2 | 3 | 4 | 5
  notas?: string
  created_at: string
}

export interface Factura {
  id: string
  numero_factura: string
  cliente_id: string
  fecha: string
  total: number
  estado: 'pendiente' | 'pagada'
  metodo_pago?: string
  items_json?: any
  created_at: string
}

export interface Producto {
  id: string
  nombre: string
  categoria?: string
  stock_actual: number
  stock_minimo: number
  precio: number
  proveedor?: string
  created_at: string
  updated_at: string
}
