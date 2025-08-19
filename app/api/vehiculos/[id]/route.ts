import { NextRequest, NextResponse } from 'next/server'
import { VehiculoUseCases } from '../../../../src/application/usecases/VehiculoUseCases'
import { InMemoryVehiculoRepository } from '../../../../src/infrastructure/repositories/InMemoryVehiculoRepository'

const vehiculoRepository = new InMemoryVehiculoRepository()
const vehiculoUseCases = new VehiculoUseCases(vehiculoRepository)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehiculo = await vehiculoUseCases.getVehiculoById(params.id)
    if (!vehiculo) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(vehiculo)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener vehículo' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehiculoData = await request.json()
    const vehiculo = await vehiculoUseCases.updateVehiculo(params.id, vehiculoData)
    return NextResponse.json(vehiculo)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar vehículo' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await vehiculoUseCases.deleteVehiculo(params.id)
    return NextResponse.json({ message: 'Vehículo eliminado correctamente' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar vehículo' },
      { status: 500 }
    )
  }
}
