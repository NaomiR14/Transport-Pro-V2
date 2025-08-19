import { NextRequest, NextResponse } from 'next/server'
import { VehiculoUseCases } from '../../../src/application/usecases/VehiculoUseCases'
import { InMemoryVehiculoRepository } from '../../../src/infrastructure/repositories/InMemoryVehiculoRepository'

const vehiculoRepository = new InMemoryVehiculoRepository()
const vehiculoUseCases = new VehiculoUseCases(vehiculoRepository)

export async function GET() {
  try {
    const vehiculos = await vehiculoUseCases.getAllVehiculos()
    return NextResponse.json(vehiculos)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener vehículos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const vehiculoData = await request.json()
    const vehiculo = await vehiculoUseCases.createVehiculo(vehiculoData)
    return NextResponse.json(vehiculo, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear vehículo' },
      { status: 500 }
    )
  }
}
