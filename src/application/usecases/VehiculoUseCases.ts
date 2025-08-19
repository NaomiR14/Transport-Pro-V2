import { VehiculoEntity } from '../../domain/entities/Vehiculo'
import { VehiculoRepository } from '../../domain/ports/VehiculoRepository'

export class VehiculoUseCases {
  constructor(private vehiculoRepository: VehiculoRepository) {}

  async getAllVehiculos(): Promise<VehiculoEntity[]> {
    return await this.vehiculoRepository.findAll()
  }

  async getVehiculoById(id: string): Promise<VehiculoEntity | null> {
    return await this.vehiculoRepository.findById(id)
  }

  async createVehiculo(vehiculoData: Omit<VehiculoEntity, 'vehiculo_id'>): Promise<VehiculoEntity> {
    const vehiculo = new VehiculoEntity(
      this.generateId(),
      vehiculoData.numero_interno,
      vehiculoData.tipo,
      vehiculoData.marca,
      vehiculoData.modelo,
      vehiculoData.placa,
      vehiculoData.numero_serie,
      vehiculoData.color,
      vehiculoData.anio,
      vehiculoData.carga_maxima,
      vehiculoData.estado,
      vehiculoData.ciclo_mantenimiento_km,
      vehiculoData.odometro_inicial,
      vehiculoData.odometro_actual,
      vehiculoData.ultimo_mantenimiento_km,
      vehiculoData.proximo_mantenimiento_km,
      vehiculoData.estado_mantenimiento
    )

    return await this.vehiculoRepository.save(vehiculo)
  }

  async updateVehiculo(id: string, vehiculoData: Partial<VehiculoEntity>): Promise<VehiculoEntity> {
    const existingVehiculo = await this.vehiculoRepository.findById(id)
    if (!existingVehiculo) {
      throw new Error('Vehículo no encontrado')
    }

    return await this.vehiculoRepository.update(id, vehiculoData)
  }

  async deleteVehiculo(id: string): Promise<void> {
    const existingVehiculo = await this.vehiculoRepository.findById(id)
    if (!existingVehiculo) {
      throw new Error('Vehículo no encontrado')
    }

    await this.vehiculoRepository.delete(id)
  }

  async getVehiculosRequierenMantenimiento(): Promise<VehiculoEntity[]> {
    const vehiculos = await this.vehiculoRepository.findAll()
    return vehiculos.filter(vehiculo => vehiculo.requiereMantenimiento())
  }

  async getEstadisticasVehiculos(): Promise<{
    total: number
    activos: number
    enMantenimiento: number
    requierenMantenimiento: number
  }> {
    const vehiculos = await this.vehiculoRepository.findAll()
    
    return {
      total: vehiculos.length,
      activos: vehiculos.filter(v => v.estado === 'activo').length,
      enMantenimiento: vehiculos.filter(v => v.estado === 'mantenimiento').length,
      requierenMantenimiento: vehiculos.filter(v => v.requiereMantenimiento()).length
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}
