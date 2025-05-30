"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Eye, Edit, Truck, Wrench, AlertTriangle } from "lucide-react"
import Link from "next/link"
import EditVehicleModal from "@/components/EditVehicleModal"

interface Vehiculo {
  vehiculo_id: string
  numero_interno: string
  tipo: string
  marca: string
  modelo: string
  placa: string
  numero_serie: string
  color: string
  anio: number
  carga_maxima: number
  estado: "activo" | "inactivo" | "mantenimiento" | "baja"
  ciclo_mantenimiento_km: number
  odometro_inicial: number
  odometro_actual: number
  ultimo_mantenimiento_km: number
  proximo_mantenimiento_km: number
  estado_mantenimiento: "al_dia" | "proximo" | "vencido"
}

export default function VehiculosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingVehicle, setEditingVehicle] = useState<Vehiculo | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Mock data
  const vehiculos: Vehiculo[] = [
    {
      vehiculo_id: "1",
      numero_interno: "VEH-001",
      tipo: "Tractocamión",
      marca: "Kenworth",
      modelo: "T680",
      placa: "ABC-123",
      numero_serie: "1XKWDB0X5LJ123456",
      color: "Blanco",
      anio: 2020,
      carga_maxima: 40000,
      estado: "activo",
      ciclo_mantenimiento_km: 15000,
      odometro_inicial: 0,
      odometro_actual: 125000,
      ultimo_mantenimiento_km: 120000,
      proximo_mantenimiento_km: 135000,
      estado_mantenimiento: "al_dia",
    },
    {
      vehiculo_id: "2",
      numero_interno: "VEH-002",
      tipo: "Tractocamión",
      marca: "Freightliner",
      modelo: "Cascadia",
      placa: "DEF-456",
      numero_serie: "1FUJGBDV8KLSP7890",
      color: "Azul",
      anio: 2019,
      carga_maxima: 38000,
      estado: "mantenimiento",
      ciclo_mantenimiento_km: 15000,
      odometro_inicial: 0,
      odometro_actual: 98000,
      ultimo_mantenimiento_km: 90000,
      proximo_mantenimiento_km: 105000,
      estado_mantenimiento: "vencido",
    },
    {
      vehiculo_id: "3",
      numero_interno: "VEH-003",
      tipo: "Camión Rígido",
      marca: "Mercedes-Benz",
      modelo: "Actros",
      placa: "GHI-789",
      numero_serie: "WDB9340461L123789",
      color: "Rojo",
      anio: 2021,
      carga_maxima: 25000,
      estado: "activo",
      ciclo_mantenimiento_km: 12000,
      odometro_inicial: 0,
      odometro_actual: 87000,
      ultimo_mantenimiento_km: 84000,
      proximo_mantenimiento_km: 96000,
      estado_mantenimiento: "proximo",
    },
  ]

  const getEstadoBadge = (estado: string) => {
    const variants = {
      activo: "bg-green-100 text-green-800",
      inactivo: "bg-gray-100 text-gray-800",
      mantenimiento: "bg-yellow-100 text-yellow-800",
      baja: "bg-red-100 text-red-800",
    }
    return variants[estado as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const needsMaintenance = (odometro: number, proximo: number) => {
    return proximo - odometro <= 5000
  }

  const calcularKmsFaltantes = (odometroActual: number, proximoMantenimiento: number) => {
    const faltantes = proximoMantenimiento - odometroActual
    return faltantes > 0 ? faltantes : 0
  }

  const getEstadoMantenimientoBadge = (estado: string) => {
    const variants = {
      al_dia: "bg-green-100 text-green-800",
      proximo: "bg-yellow-100 text-yellow-800",
      vencido: "bg-red-100 text-red-800",
    }
    return variants[estado as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const getEstadoMantenimientoText = (estado: string) => {
    const texts = {
      al_dia: "Al día",
      proximo: "Próximo",
      vencido: "Vencido",
    }
    return texts[estado as keyof typeof texts] || estado
  }

  const filteredVehiculos = vehiculos.filter(
    (vehiculo) =>
      vehiculo.numero_interno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEditVehicle = (vehiculo: Vehiculo) => {
    setEditingVehicle(vehiculo)
    setIsEditModalOpen(true)
  }

  const handleSaveVehicle = (updatedVehicle: Vehiculo) => {
    // Here you would typically make an API call to update the vehicle
    console.log("Saving vehicle:", updatedVehicle)
    setIsEditModalOpen(false)
    setEditingVehicle(null)
    // In a real app, you would update the vehicles list here
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setEditingVehicle(null)
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Flota de Vehículos</h1>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Vehículo
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Vehículos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">25</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">18</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">4</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Requieren Mantenimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">3</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Vehículos</CardTitle>
                  <CardDescription>Administra la flota de vehículos y su mantenimiento</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Buscar vehículos..."
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Número</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>No. Serie</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Carga Máx (kg)</TableHead>
                    <TableHead>Estado Vehículo</TableHead>
                    <TableHead>Ciclo Mnnto (km)</TableHead>
                    <TableHead>Km Inicial</TableHead>
                    <TableHead>Km Mnnto Prev</TableHead>
                    <TableHead>Km Actual</TableHead>
                    <TableHead>Falta Mnnto (km)</TableHead>
                    <TableHead>Estado Mnnto</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehiculos.map((vehiculo) => (
                    <TableRow key={vehiculo.vehiculo_id}>
                      <TableCell className="font-medium">{vehiculo.numero_interno}</TableCell>
                      <TableCell>{vehiculo.tipo}</TableCell>
                      <TableCell>{vehiculo.marca}</TableCell>
                      <TableCell>{vehiculo.modelo}</TableCell>
                      <TableCell className="font-mono">{vehiculo.placa}</TableCell>
                      <TableCell className="font-mono text-xs">{vehiculo.numero_serie}</TableCell>
                      <TableCell>{vehiculo.color}</TableCell>
                      <TableCell>{vehiculo.anio}</TableCell>
                      <TableCell>{vehiculo.carga_maxima.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getEstadoBadge(vehiculo.estado)}>{vehiculo.estado}</Badge>
                      </TableCell>
                      <TableCell>{vehiculo.ciclo_mantenimiento_km.toLocaleString()}</TableCell>
                      <TableCell>{vehiculo.odometro_inicial.toLocaleString()}</TableCell>
                      <TableCell>{vehiculo.proximo_mantenimiento_km.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">{vehiculo.odometro_actual.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {calcularKmsFaltantes(vehiculo.odometro_actual, vehiculo.proximo_mantenimiento_km) <=
                            5000 && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          <span
                            className={`text-sm ${calcularKmsFaltantes(vehiculo.odometro_actual, vehiculo.proximo_mantenimiento_km) <= 5000 ? "text-red-600 font-semibold" : ""}`}
                          >
                            {calcularKmsFaltantes(
                              vehiculo.odometro_actual,
                              vehiculo.proximo_mantenimiento_km,
                            ).toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getEstadoMantenimientoBadge(vehiculo.estado_mantenimiento)}>
                          {getEstadoMantenimientoText(vehiculo.estado_mantenimiento)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditVehicle(vehiculo)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Wrench className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        {isEditModalOpen && editingVehicle && (
          <EditVehicleModal vehiculo={editingVehicle} onSave={handleSaveVehicle} onClose={handleCloseModal} />
        )}
      </main>
    </div>
  )
}
