import { useState, useEffect } from 'react'
import { FlujoCajaEntity } from '../src/domain/entities/FlujoCaja'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

interface UseFlujoCajaReturn {
  flujoCaja: FlujoCajaEntity[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createFlujoCaja: (flujoCaja: Omit<FlujoCajaEntity, 'id' | 'egresos' | 'utilidad' | 'margen'>) => Promise<void>
  updateFlujoCaja: (id: number, flujoCaja: Partial<FlujoCajaEntity>) => Promise<void>
  deleteFlujoCaja: (id: number) => Promise<void>
}

export function useFlujoCaja(): UseFlujoCajaReturn {
  const [flujoCaja, setFlujoCaja] = useState<FlujoCajaEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFlujoCaja = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/flujo-caja`, {
        headers: {
          ...getAuthHeaders(),
        },
      })
      if (!response.ok) {
        throw new Error('Error al cargar flujo de caja')
      }
      const data = await response.json()
      setFlujoCaja(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    await fetchFlujoCaja()
  }

  const createFlujoCaja = async (flujoCajaData: Omit<FlujoCajaEntity, 'id' | 'egresos' | 'utilidad' | 'margen'>) => {
    try {
      const response = await fetch(`${API_URL}/flujo-caja`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(flujoCajaData),
      })
      if (!response.ok) {
        throw new Error('Error al crear registro de flujo de caja')
      }
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    }
  }

  const updateFlujoCaja = async (id: number, flujoCajaData: Partial<FlujoCajaEntity>) => {
    try {
      const response = await fetch(`${API_URL}/flujo-caja/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(flujoCajaData),
      })
      if (!response.ok) {
        throw new Error('Error al actualizar registro de flujo de caja')
      }
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    }
  }

  const deleteFlujoCaja = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/flujo-caja/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      })
      if (!response.ok) {
        throw new Error('Error al eliminar registro de flujo de caja')
      }
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    }
  }

  useEffect(() => {
    refetch()
  }, [])

  return {
    flujoCaja,
    loading,
    error,
    refetch,
    createFlujoCaja,
    updateFlujoCaja,
    deleteFlujoCaja,
  }
}
