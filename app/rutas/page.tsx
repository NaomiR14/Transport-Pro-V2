"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Eye, Edit, Truck, Route, MapPin, Fuel, Calendar } from "lucide-react"
import Link from "next/link"
import EditRutaModal from "@/components/EditRutaModal"

interface RutaViaje {
  ruta_id: string
  fecha_salida: string
  fecha_llegada: string
  placa_vehiculo: string
  estado_vehiculo: "activo" | "inactivo" | "mantenimiento"
  conductor: string
  origen: string
  destino: string
  kms_inicial: number
  kms_final: number
  kms_recorridos: number
  peso_carga_kg: number
  costo_por_kg: number
  ingreso_total: number
  estacion_combustible: string
  tipo_combustible: string
  precio_por_galon: number
  total_combustible: number
  gasto_peajes: number
  gasto_comidas: number
  otros_gastos: number
  gasto_total: number
  volumen_combustible_gal: number
  recorrido_por_galon: number
  ingreso_por_km: number
  observaciones: string
}

export default function RutasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingRuta, setEditingRuta] = useState<RutaViaje | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Mock data
  const rutas: RutaViaje[] = [
    {
      ruta_id: "1",
      fecha_salida: "2024-01-15",
      fecha_llegada: "2024-01-16",
      placa_vehiculo: "ABC-123",
      estado_vehiculo: "activo",
      conductor: "Juan Pérez",
      origen: "Ciudad de México",
      destino: "Guadalajara",
      kms_inicial: 125000,
      kms_final: 125540,
      kms_recorridos: 540,
      peso_carga_kg: 15000,
      costo_por_kg: 2.5,
      ingreso_total: 37500,
      estacion_combustible: "Pemex Reforma",
      tipo_combustible: "Diesel",
      precio_por_galon: 24.5,
      total_combustible: 2940,
      gasto_peajes: 850,
      gasto_comidas: 450,
      otros_gastos: 200,
      gasto_total: 4440,
      volumen_combustible_gal: 120,
      recorrido_por_galon: 4.5,
      ingreso_por_km: 69.44,
      observaciones: "Viaje sin incidentes, entrega a tiempo",
    },
    {
      ruta_id: "2",
      fecha_salida: "2024-01-18",
      fecha_llegada: "2024-01-19",
      placa_vehiculo: "DEF-456",
      estado_vehiculo: "activo",
      conductor: "María García",
      origen: "Monterrey",
      destino: "Tijuana",
      kms_inicial: 98000,
      kms_final: 99200,
      kms_recorridos: 1200,
      peso_carga_kg: 22000,
      costo_por_kg: 3.0,
      ingreso_total: 66000,
      estacion_combustible: "Shell Constitución",
      tipo_combustible: "Diesel",
      precio_por_galon: 25.2,
      total_combustible: 6552,
      gasto_peajes: 1450,
      gasto_comidas: 680,
      otros_gastos: 350,
      gasto_total: 9032,
      volumen_combustible_gal: 260,
      recorrido_por_galon: 4.6,
      ingreso_por_km: 55.0,
      observaciones: "Retraso de 2 horas por tráfico en carretera",
    },
    {
      ruta_id: "3",
      fecha_salida: "2024-01-20",
      fecha_llegada: "2024-01-20",
      placa_vehiculo: "GHI-789",
      estado_vehiculo: "activo",
      conductor: "Carlos López",
      origen: "Puebla",
      destino: "Veracruz",
      kms_inicial: 87000,
      kms_final: 87280,
      kms_recorridos: 280,
      peso_carga_kg: 8500,
      costo_por_kg: 4.0,
      ingreso_total: 34000,
      estacion_combustible: "BP Central",
      tipo_combustible: "Diesel",
      precio_por_galon: 24.8,
      total_combustible: 1488,
      gasto_peajes: 420,
      gasto_comidas: 250,
      otros_gastos: 100,
      gasto_total: 2258,
      volumen_combustible_gal: 60,
      recorrido_por_galon: 4.7,
      ingreso_por_km: 121.43,
      observaciones: "Entrega exitosa, cliente satisfecho",
    },
  ]

  const getEstadoVehiculoBadge = (estado: string) => {
    const variants = {
      activo: "bg-green-100 text-green-800",
      inactivo: "bg-gray-100 text-gray-800",
      mantenimiento: "bg-yellow-100 text-yellow-800",
    }
    return variants[estado as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const calcularUtilidad = (ingresoTotal: number, gastoTotal: number) => {
    return ingresoTotal - gastoTotal
  }

  const calcularMargenUtilidad = (ingresoTotal: number, gastoTotal: number) => {
    const utilidad = calcularUtilidad(ingresoTotal, gastoTotal)
    return ingresoTotal > 0 ? (utilidad / ingresoTotal) * 100 : 0
  }

  const filteredRutas = rutas.filter(
    (ruta) =>
      ruta.placa_vehiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ruta.conductor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ruta.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ruta.destino.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEditRuta = (ruta: RutaViaje) => {
    setEditingRuta(ruta)
    setIsEditModalOpen(true)
  }

  const handleSaveRuta = (updatedRuta: RutaViaje) => {
    console.log("Saving ruta:", updatedRuta)
    setIsEditModalOpen(false)
    setEditingRuta(null)
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setEditingRuta(null)
  }

  // Calculate statistics
  const totalRutas = rutas.length
  const totalIngresos = rutas.reduce((sum, r) => sum + r.ingreso_total, 0)
  const totalGastos = rutas.reduce((sum, r) => sum + r.gasto_total, 0)
  const totalUtilidad = totalIngresos - totalGastos
  const promedioKmsPorGalon = rutas.reduce((sum, r) => sum + r.recorrido_por_galon, 0) / rutas.length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center mr-4">
                <Truck className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-sm text-gray-600">Volver al Dashboard</span>
              </Link>
              <Route className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Rutas de Viaje</h1>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Ruta
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Rutas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRutas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${totalIngresos.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${totalGastos.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Utilidad Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalUtilidad >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${totalUtilidad.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Promedio Km/Gal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{promedioKmsPorGalon.toFixed(1)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Rutas de Viaje</CardTitle>
                  <CardDescription>Administra los registros de rutas y viajes de la flota</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Buscar rutas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fechas</TableHead>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Conductor</TableHead>
                      <TableHead>Ruta</TableHead>
                      <TableHead>Kilometraje</TableHead>
                      <TableHead>Carga</TableHead>
                      <TableHead>Ingresos</TableHead>
                      <TableHead>Combustible</TableHead>
                      <TableHead>Gastos</TableHead>
                      <TableHead>Utilidad</TableHead>
                      <TableHead>Rendimiento</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRutas.map((ruta) => {
                      const utilidad = calcularUtilidad(ruta.ingreso_total, ruta.gasto_total)
                      const margenUtilidad = calcularMargenUtilidad(ruta.ingreso_total, ruta.gasto_total)
                      return (
                        <TableRow key={ruta.ruta_id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <div className="text-sm">
                                <div className="font-medium">Salida: {formatearFecha(ruta.fecha_salida)}</div>
                                <div className="text-gray-500">Llegada: {formatearFecha(ruta.fecha_llegada)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium font-mono">{ruta.placa_vehiculo}</div>
                              <Badge className={getEstadoVehiculoBadge(ruta.estado_vehiculo)} size="sm">
                                {ruta.estado_vehiculo}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{ruta.conductor}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <div className="text-sm">
                                <div className="font-medium">{ruta.origen}</div>
                                <div className="text-gray-500">→ {ruta.destino}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>Inicial: {ruta.kms_inicial.toLocaleString()}</div>
                              <div>Final: {ruta.kms_final.toLocaleString()}</div>
                              <div className="font-semibold text-blue-600">
                                Recorridos: {ruta.kms_recorridos.toLocaleString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{ruta.peso_carga_kg.toLocaleString()} kg</div>
                              <div className="text-gray-500">${ruta.costo_por_kg}/kg</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-semibold text-green-600">${ruta.ingreso_total.toLocaleString()}</div>
                              <div className="text-gray-500">${ruta.ingreso_por_km.toFixed(2)}/km</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Fuel className="h-4 w-4 text-gray-500" />
                              <div className="text-sm">
                                <div>{ruta.volumen_combustible_gal} gal</div>
                                <div className="text-gray-500">${ruta.total_combustible.toLocaleString()}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="text-red-600 font-semibold">${ruta.gasto_total.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">
                                Peajes: ${ruta.gasto_peajes} | Comidas: ${ruta.gasto_comidas}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className={`font-semibold ${utilidad >= 0 ? "text-green-600" : "text-red-600"}`}>
                                ${utilidad.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">{margenUtilidad.toFixed(1)}% margen</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-semibold text-blue-600">
                                {ruta.recorrido_por_galon.toFixed(1)} km/gal
                              </div>
                              <div className="text-xs text-gray-500">{ruta.tipo_combustible}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleEditRuta(ruta)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        {isEditModalOpen && editingRuta && (
          <EditRutaModal ruta={editingRuta} onSave={handleSaveRuta} onClose={handleCloseModal} />
        )}
      </main>
    </div>
  )
}
