import { NextResponse } from 'next/server'
import { VehiculoUseCases } from '../../../../src/application/usecases/VehiculoUseCases'
import { InMemoryVehiculoRepository } from '../../../../src/infrastructure/repositories/InMemoryVehiculoRepository'

const vehiculoRepository = new InMemoryVehiculoRepository()
const vehiculoUseCases = new VehiculoUseCases(vehiculoRepository)

export async function GET() {
  try {
    const estadisticas = await vehiculoUseCases.getEstadisticasVehiculos()
    return NextResponse.json(estadisticas)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
