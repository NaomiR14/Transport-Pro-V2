import { useState, useEffect } from 'react'
import { VehiculoEntity } from '../src/domain/entities/Vehiculo'

interface UseVehiculosReturn {
  vehiculos: VehiculoEntity[]
  estadisticas: {
    total: number
    activos: number
    enMantenimiento: number
    requierenMantenimiento: number
  } | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createVehiculo: (vehiculo: Omit<VehiculoEntity, 'vehiculo_id'>) => Promise<void>
  updateVehiculo: (id: string, vehiculo: Partial<VehiculoEntity>) => Promise<void>
  deleteVehiculo: (id: string) => Promise<void>
}

export function useVehiculos(): UseVehiculosReturn {
  const [vehiculos, setVehiculos] = useState<VehiculoEntity[]>([])
  const [estadisticas, setEstadisticas] = useState<{
    total: number
    activos: number
    enMantenimiento: number
    requierenMantenimiento: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVehiculos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vehiculos')
      if (!response.ok) {
        throw new Error('Error al cargar vehículos')
      }
      const data = await response.json()
      setVehiculos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const fetchEstadisticas = async () => {
    try {
      const response = await fetch('/api/vehiculos/estadisticas')
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas')
      }
      const data = await response.json()
      setEstadisticas(data)
    } catch (err) {
      console.error('Error al cargar estadísticas:', err)
    }
  }

  const refetch = async () => {
    await Promise.all([fetchVehiculos(), fetchEstadisticas()])
  }

  const createVehiculo = async (vehiculo: Omit<VehiculoEntity, 'vehiculo_id'>) => {
    try {
      const response = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehiculo),
      })
      if (!response.ok) {
        throw new Error('Error al crear vehículo')
      }
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    }
  }

  const updateVehiculo = async (id: string, vehiculo: Partial<VehiculoEntity>) => {
    try {
      const response = await fetch(`/api/vehiculos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehiculo),
      })
      if (!response.ok) {
        throw new Error('Error al actualizar vehículo')
      }
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    }
  }

  const deleteVehiculo = async (id: string) => {
    try {
      const response = await fetch(`/api/vehiculos/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Error al eliminar vehículo')
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
    vehiculos,
    estadisticas,
    loading,
    error,
    refetch,
    createVehiculo,
    updateVehiculo,
    deleteVehiculo,
  }
}
