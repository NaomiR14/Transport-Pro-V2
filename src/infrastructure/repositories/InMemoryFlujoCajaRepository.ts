import { FlujoCajaEntity } from '../../domain/entities/FlujoCaja'
import { FlujoCajaRepository } from '../../domain/ports/FlujoCajaRepository'

export class InMemoryFlujoCajaRepository implements FlujoCajaRepository {
  private flujoCaja: FlujoCajaEntity[] = [
    new FlujoCajaEntity(
      1, 2024, "Enero", 125000, 98500, 45000, 8500, 12000, 2500, 15000, 8000, 3500, 2000, 2000, 26500, 21.2
    ),
    new FlujoCajaEntity(
      2, 2024, "Febrero", 138000, 105000, 45000, 8500, 15000, 1500, 18000, 9000, 4000, 2500, 1500, 33000, 23.9
    ),
    new FlujoCajaEntity(
      3, 2024, "Marzo", 142000, 108000, 47000, 8500, 13000, 3000, 20000, 8500, 4500, 2000, 1500, 34000, 23.9
    )
  ]

  async findAll(): Promise<FlujoCajaEntity[]> {
    return [...this.flujoCaja]
  }

  async findById(id: number): Promise<FlujoCajaEntity | null> {
    const registro = this.flujoCaja.find(f => f.id === id)
    return registro || null
  }

  async save(flujoCaja: FlujoCajaEntity): Promise<FlujoCajaEntity> {
    this.flujoCaja.push(flujoCaja)
    return flujoCaja
  }

  async update(id: number, flujoCajaData: Partial<FlujoCajaEntity>): Promise<FlujoCajaEntity> {
    const index = this.flujoCaja.findIndex(f => f.id === id)
    if (index === -1) {
      throw new Error('Registro de flujo de caja no encontrado')
    }

    this.flujoCaja[index] = { ...this.flujoCaja[index], ...flujoCajaData }
    return this.flujoCaja[index]
  }

  async delete(id: number): Promise<void> {
    const index = this.flujoCaja.findIndex(f => f.id === id)
    if (index === -1) {
      throw new Error('Registro de flujo de caja no encontrado')
    }

    this.flujoCaja.splice(index, 1)
  }

  async findByYear(year: number): Promise<FlujoCajaEntity[]> {
    return this.flujoCaja.filter(f => f.año === year)
  }

  async findByMonth(month: string): Promise<FlujoCajaEntity[]> {
    return this.flujoCaja.filter(f => f.mes === month)
  }
}
