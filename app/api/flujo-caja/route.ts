import { NextRequest, NextResponse } from 'next/server'
import { FlujoCajaUseCases } from '../../../src/application/usecases/FlujoCajaUseCases'
import { InMemoryFlujoCajaRepository } from '../../../src/infrastructure/repositories/InMemoryFlujoCajaRepository'

const flujoCajaRepository = new InMemoryFlujoCajaRepository()
const flujoCajaUseCases = new FlujoCajaUseCases(flujoCajaRepository)

export async function GET() {
  try {
    const flujoCaja = await flujoCajaUseCases.getAllFlujoCaja()
    return NextResponse.json(flujoCaja)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener flujo de caja' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const flujoCajaData = await request.json()
    const flujoCaja = await flujoCajaUseCases.createFlujoCaja(flujoCajaData)
    return NextResponse.json(flujoCaja, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear registro de flujo de caja' },
      { status: 500 }
    )
  }
}
