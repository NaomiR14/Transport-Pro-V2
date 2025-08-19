import { FlujoCajaEntity } from '../entities/FlujoCaja'

export interface FlujoCajaRepository {
  findAll(): Promise<FlujoCajaEntity[]>
  findById(id: number): Promise<FlujoCajaEntity | null>
  save(flujoCaja: FlujoCajaEntity): Promise<FlujoCajaEntity>
  update(id: number, flujoCaja: Partial<FlujoCajaEntity>): Promise<FlujoCajaEntity>
  delete(id: number): Promise<void>
  findByYear(year: number): Promise<FlujoCajaEntity[]>
  findByMonth(month: string): Promise<FlujoCajaEntity[]>
}
