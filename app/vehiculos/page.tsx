"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Eye, Edit, Truck, Wrench, AlertTriangle, Loader2 } from 'lucide-react'
import Link from "next/link"
import EditVehicleModal from "@/components/EditVehicleModal"
import { useVehiculos } from "@/hooks/use-vehiculos"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { VehiculoEntity } from "../../src/domain/entities/Vehiculo"

export default function VehiculosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingVehicle, setEditingVehicle] = useState<VehiculoEntity | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  const { 
    vehiculos, 
    estadisticas, 
    loading, 
    error, 
    updateVehiculo 
  } = useVehiculos()

  const getEstadoBadge = (estado: string) => {
    const variants = {
      activo: "bg-green-100 text-green-800",
      inactivo: "bg-gray-100 text-gray-800",
      mantenimiento: "bg-yellow-100 text-yellow-800",
      baja: "bg-red-100 text-red-800",
    }
    return variants[estado as keyof typeof variants] || "bg-gray-100 text-gray-800"
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

  const handleEditVehicle = (vehiculo: VehiculoEntity) => {
    setEditingVehicle(vehiculo)
    setIsEditModalOpen(true)
  }

  const handleSaveVehicle = async (updatedVehicle: VehiculoEntity) => {
    try {
      await updateVehiculo(updatedVehicle.vehiculo_id, updatedVehicle)
      setIsEditModalOpen(false)
      setEditingVehicle(null)
    } catch (error) {
      console.error('Error al actualizar vehículo:', error)
    }
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setEditingVehicle(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando vehículos...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar los vehículos: {error}
          </AlertDescription>
        </Alert>
      </div>
    )
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
                <div className="text-2xl font-bold">{estadisticas?.total || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{estadisticas?.activos || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{estadisticas?.enMantenimiento || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Requieren Mantenimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{estadisticas?.requierenMantenimiento || 0}</div>
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
                  {filteredVehiculos.map((vehiculo) => {
                    const vehiculoEntity = new VehiculoEntity(
                      vehiculo.vehiculo_id,
                      vehiculo.numero_interno,
                      vehiculo.tipo,
                      vehiculo.marca,
                      vehiculo.modelo,
                      vehiculo.placa,
                      vehiculo.numero_serie,
                      vehiculo.color,
                      vehiculo.anio,
                      vehiculo.carga_maxima,
                      vehiculo.estado,
                      vehiculo.ciclo_mantenimiento_km,
                      vehiculo.odometro_inicial,
                      vehiculo.odometro_actual,
                      vehiculo.ultimo_mantenimiento_km,
                      vehiculo.proximo_mantenimiento_km,
                      vehiculo.estado_mantenimiento
                    )

                    return (
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
                            {vehiculoEntity.requiereMantenimiento() && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            <span
                              className={`text-sm ${vehiculoEntity.requiereMantenimiento() ? "text-red-600 font-semibold" : ""}`}
                            >
                              {vehiculoEntity.calcularKmsFaltantes().toLocaleString()}
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
                    )
                  })}
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
