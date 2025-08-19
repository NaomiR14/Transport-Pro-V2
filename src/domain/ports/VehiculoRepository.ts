import { VehiculoEntity } from '../entities/Vehiculo'

export interface VehiculoRepository {
  findAll(): Promise<VehiculoEntity[]>
  findById(id: string): Promise<VehiculoEntity | null>
  save(vehiculo: VehiculoEntity): Promise<VehiculoEntity>
  update(id: string, vehiculo: Partial<VehiculoEntity>): Promise<VehiculoEntity>
  delete(id: string): Promise<void>
  findByEstado(estado: string): Promise<VehiculoEntity[]>
  findByEstadoMantenimiento(estado: string): Promise<VehiculoEntity[]>
}
