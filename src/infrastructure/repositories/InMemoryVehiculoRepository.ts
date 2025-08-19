import { VehiculoEntity } from '../../domain/entities/Vehiculo'
import { VehiculoRepository } from '../../domain/ports/VehiculoRepository'

export class InMemoryVehiculoRepository implements VehiculoRepository {
  private vehiculos: VehiculoEntity[] = [
    new VehiculoEntity(
      "1",
      "VEH-001",
      "Tractocamión",
      "Kenworth",
      "T680",
      "ABC-123",
      "1XKWDB0X5LJ123456",
      "Blanco",
      2020,
      40000,
      "activo",
      15000,
      0,
      125000,
      120000,
      135000,
      "al_dia"
    ),
    new VehiculoEntity(
      "2",
      "VEH-002",
      "Tractocamión",
      "Freightliner",
      "Cascadia",
      "DEF-456",
      "1FUJGBDV8KLSP7890",
      "Azul",
      2019,
      38000,
      "mantenimiento",
      15000,
      0,
      98000,
      90000,
      105000,
      "vencido"
    ),
    new VehiculoEntity(
      "3",
      "VEH-003",
      "Camión Rígido",
      "Mercedes-Benz",
      "Actros",
      "GHI-789",
      "WDB9340461L123789",
      "Rojo",
      2021,
      25000,
      "activo",
      12000,
      0,
      87000,
      84000,
      96000,
      "proximo"
    )
  ]

  async findAll(): Promise<VehiculoEntity[]> {
    return [...this.vehiculos]
  }

  async findById(id: string): Promise<VehiculoEntity | null> {
    const vehiculo = this.vehiculos.find(v => v.vehiculo_id === id)
    return vehiculo || null
  }

  async save(vehiculo: VehiculoEntity): Promise<VehiculoEntity> {
    this.vehiculos.push(vehiculo)
    return vehiculo
  }

  async update(id: string, vehiculoData: Partial<VehiculoEntity>): Promise<VehiculoEntity> {
    const index = this.vehiculos.findIndex(v => v.vehiculo_id === id)
    if (index === -1) {
      throw new Error('Vehículo no encontrado')
    }

    this.vehiculos[index] = { ...this.vehiculos[index], ...vehiculoData }
    return this.vehiculos[index]
  }

  async delete(id: string): Promise<void> {
    const index = this.vehiculos.findIndex(v => v.vehiculo_id === id)
    if (index === -1) {
      throw new Error('Vehículo no encontrado')
    }

    this.vehiculos.splice(index, 1)
  }

  async findByEstado(estado: string): Promise<VehiculoEntity[]> {
    return this.vehiculos.filter(v => v.estado === estado)
  }

  async findByEstadoMantenimiento(estado: string): Promise<VehiculoEntity[]> {
    return this.vehiculos.filter(v => v.estado_mantenimiento === estado)
  }
}
