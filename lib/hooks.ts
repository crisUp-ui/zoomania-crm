'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  getClientes, getMascotas, getCitas, getServicios,
  getHistorial, getFacturas, getProductos,
} from './server-actions'

function usePoll<T>(fn: () => Promise<T[]>, deps: any[] = [], interval = 30000) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const result = await fn()
      setData(result)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    load()
    const id = setInterval(load, interval)
    return () => clearInterval(id)
  }, [load, interval])

  return { data, loading, refresh: load }
}

export function useClientes() {
  const { data: clientes, loading, refresh } = usePoll(getClientes)
  return { clientes, loading, refresh }
}

export function useMascotas(clienteId?: string) {
  const { data: mascotas, loading, refresh } = usePoll(
    () => getMascotas(clienteId),
    [clienteId]
  )
  return { mascotas, loading, refresh }
}

export function useCitas(fecha?: string) {
  const { data: citas, loading, refresh } = usePoll(
    () => getCitas(fecha),
    [fecha],
    20000
  )
  return { citas, loading, refresh }
}

export function useServicios() {
  const { data: servicios, loading } = usePoll(getServicios, [], 300000)
  return { servicios, loading }
}

export function useHistorial() {
  const { data: historial, loading, refresh } = usePoll(getHistorial)
  return { historial, loading, refresh }
}

export function useFacturas() {
  const { data: facturas, loading, refresh } = usePoll(getFacturas)
  return { facturas, loading, refresh }
}

export function useProductos() {
  const { data: productos, loading, refresh } = usePoll(getProductos)
  return { productos, loading, refresh }
}
