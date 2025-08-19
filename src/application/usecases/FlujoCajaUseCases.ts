import { FlujoCajaEntity } from '../../domain/entities/FlujoCaja'
import { FlujoCajaRepository } from '../../domain/ports/FlujoCajaRepository'

export class FlujoCajaUseCases {
  constructor(private flujoCajaRepository: FlujoCajaRepository) {}

  async getAllFlujoCaja(): Promise<FlujoCajaEntity[]> {
    return await this.flujoCajaRepository.findAll()
  }

  async getFlujoCajaById(id: number): Promise<FlujoCajaEntity | null> {
    return await this.flujoCajaRepository.findById(id)
  }

  async createFlujoCaja(flujoCajaData: Omit<FlujoCajaEntity, 'id' | 'egresos' | 'utilidad' | 'margen'>): Promise<FlujoCajaEntity> {
    const flujoCaja = new FlujoCajaEntity(
      this.generateId(),
      flujoCajaData.año,
      flujoCajaData.mes,
      flujoCajaData.ingresos,
      0, // Se calculará automáticamente
      flujoCajaData.personal,
      flujoCajaData.seguros,
      flujoCajaData.impuestos,
      flujoCajaData.multas,
      flujoCajaData.mantenimiento,
      flujoCajaData.combustible,
      flujoCajaData.peaje,
      flujoCajaData.comidas,
      flujoCajaData.otros_egresos,
      0, // Se calculará automáticamente
      0  // Se calculará automáticamente
    )

    flujoCaja.actualizarCalculos()
    return await this.flujoCajaRepository.save(flujoCaja)
  }

  async updateFlujoCaja(id: number, flujoCajaData: Partial<FlujoCajaEntity>): Promise<FlujoCajaEntity> {
    const existingFlujoCaja = await this.flujoCajaRepository.findById(id)
    if (!existingFlujoCaja) {
      throw new Error('Registro de flujo de caja no encontrado')
    }

    const updatedFlujoCaja = await this.flujoCajaRepository.update(id, flujoCajaData)
    updatedFlujoCaja.actualizarCalculos()
    
    return await this.flujoCajaRepository.update(id, updatedFlujoCaja)
  }

  async deleteFlujoCaja(id: number): Promise<void> {
    const existingFlujoCaja = await this.flujoCajaRepository.findById(id)
    if (!existingFlujoCaja) {
      throw new Error('Registro de flujo de caja no encontrado')
    }

    await this.flujoCajaRepository.delete(id)
  }

  async getEstadisticasFlujoCaja(registros: FlujoCajaEntity[]): Promise<{
    totalIngresos: number
    totalEgresos: number
    totalUtilidad: number
    promedioMargen: number
  }> {
    if (registros.length === 0) {
      return {
        totalIngresos: 0,
        totalEgresos: 0,
        totalUtilidad: 0,
        promedioMargen: 0
      }
    }

    const totalIngresos = registros.reduce((sum, record) => sum + record.ingresos, 0)
    const totalEgresos = registros.reduce((sum, record) => sum + record.egresos, 0)
    const totalUtilidad = registros.reduce((sum, record) => sum + record.utilidad, 0)
    const promedioMargen = registros.reduce((sum, record) => sum + record.margen, 0) / registros.length

    return {
      totalIngresos,
      totalEgresos,
      totalUtilidad,
      promedioMargen
    }
  }

  private generateId(): number {
    return Math.floor(Math.random() * 1000000)
  }
}
