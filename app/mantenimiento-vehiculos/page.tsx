"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Truck, Search, Plus, Edit, Calendar, Wrench, DollarSign, Clock, CheckCircle, Settings } from "lucide-react"
import Link from "next/link"
import { EditMantenimientoVehiculoModal } from "@/components/EditMantenimientoVehiculoModal"

// Datos de ejemplo para mantenimientos de vehículos
const mantenimientosData = [
  {
    id: 1,
    placaVehiculo: "ABC-123",
    taller: "Taller Central",
    fechaEntrada: "2024-01-15",
    fechaSalida: "2024-01-17",
    tipo: "Preventivo",
    kilometraje: 45000,
    paqueteMantenimiento: "Mantenimiento 45K",
    causas: "Mantenimiento programado según kilometraje",
    costoTotal: 850.0,
    fechaPago: "2024-01-20",
    observaciones: "Cambio de aceite, filtros y revisión general",
    estado: "Completado",
  },
  {
    id: 2,
    placaVehiculo: "DEF-456",
    taller: "AutoServicio Norte",
    fechaEntrada: "2024-01-20",
    fechaSalida: null,
    tipo: "Correctivo",
    kilometraje: 67500,
    paqueteMantenimiento: "Reparación Motor",
    causas: "Sobrecalentamiento del motor",
    costoTotal: 1250.0,
    fechaPago: null,
    observaciones: "Reparación de sistema de refrigeración en proceso",
    estado: "En Proceso",
  },
  {
    id: 3,
    placaVehiculo: "GHI-789",
    taller: "Mecánica Express",
    fechaEntrada: "2024-01-18",
    fechaSalida: "2024-01-19",
    tipo: "Preventivo",
    kilometraje: 30000,
    paqueteMantenimiento: "Mantenimiento 30K",
    causas: "Mantenimiento programado",
    costoTotal: 650.0,
    fechaPago: "2024-01-22",
    observaciones: "Cambio de aceite y filtro de aire",
    estado: "Completado",
  },
  {
    id: 4,
    placaVehiculo: "JKL-012",
    taller: "Taller Central",
    fechaEntrada: "2024-01-22",
    fechaSalida: "2024-01-24",
    tipo: "Correctivo",
    kilometraje: 89000,
    paqueteMantenimiento: "Reparación Frenos",
    causas: "Desgaste excesivo de pastillas de freno",
    costoTotal: 420.0,
    fechaPago: null,
    observaciones: "Cambio de pastillas y discos de freno",
    estado: "Pendiente Pago",
  },
  {
    id: 5,
    placaVehiculo: "MNO-345",
    taller: "AutoServicio Norte",
    fechaEntrada: "2024-01-25",
    fechaSalida: null,
    tipo: "Preventivo",
    kilometraje: 60000,
    paqueteMantenimiento: "Mantenimiento 60K",
    causas: "Mantenimiento mayor programado",
    costoTotal: 1100.0,
    fechaPago: null,
    observaciones: "Mantenimiento mayor: cambio de correa de distribución",
    estado: "En Proceso",
  },
]

export default function MantenimientoVehiculosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState("all")
  const [filterEstado, setFilterEstado] = useState("all")
  const [selectedMantenimiento, setSelectedMantenimiento] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Filtrar mantenimientos
  const filteredMantenimientos = mantenimientosData.filter((mantenimiento) => {
    const matchesSearch =
      mantenimiento.placaVehiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mantenimiento.taller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mantenimiento.paqueteMantenimiento.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTipo = filterTipo === "all" || mantenimiento.tipo === filterTipo
    const matchesEstado = filterEstado === "all" || mantenimiento.estado === filterEstado

    return matchesSearch && matchesTipo && matchesEstado
  })

  // Estadísticas
  const totalMantenimientos = mantenimientosData.length
  const mantenimientosCompletados = mantenimientosData.filter((m) => m.estado === "Completado").length
  const mantenimientosEnProceso = mantenimientosData.filter((m) => m.estado === "En Proceso").length
  const mantenimientosPendientes = mantenimientosData.filter((m) => m.estado === "Pendiente Pago").length
  const costoTotalPendiente = mantenimientosData.filter((m) => !m.fechaPago).reduce((sum, m) => sum + m.costoTotal, 0)

  const handleEditMantenimiento = (mantenimiento) => {
    setSelectedMantenimiento(mantenimiento)
    setIsEditModalOpen(true)
  }

  const getEstadoBadge = (estado) => {
    const variants = {
      Completado: "bg-green-100 text-green-800",
      "En Proceso": "bg-blue-100 text-blue-800",
      "Pendiente Pago": "bg-yellow-100 text-yellow-800",
    }
    return variants[estado] || "bg-gray-100 text-gray-800"
  }

  const getTipoBadge = (tipo) => {
    const variants = {
      Preventivo: "bg-blue-100 text-blue-800",
      Correctivo: "bg-red-100 text-red-800",
    }
    return variants[tipo] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center mr-4">
                <Truck className="h-8 w-8 text-blue-600 mr-3" />
                <span className="text-xl font-semibold text-gray-900">Sistema de Transporte</span>
              </Link>
              <div className="flex items-center">
                <Settings className="h-6 w-6 text-gray-600 mr-2" />
                <h1 className="text-2xl font-bold text-gray-900">Mantenimiento de Vehículos</h1>
              </div>
            </div>
            <Button onClick={() => handleEditMantenimiento(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Mantenimiento
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mantenimientos</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMantenimientos}</div>
              <p className="text-xs text-muted-foreground">Registros totales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{mantenimientosCompletados}</div>
              <Progress value={(mantenimientosCompletados / totalMantenimientos) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{mantenimientosEnProceso}</div>
              <p className="text-xs text-muted-foreground">Actualmente en taller</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Costo Pendiente</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">${costoTotalPendiente.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{mantenimientosPendientes} pagos pendientes</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros de Búsqueda</CardTitle>
            <CardDescription>Buscar y filtrar registros de mantenimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por placa, taller o paquete..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Tipo de mantenimiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="Preventivo">Preventivo</SelectItem>
                  <SelectItem value="Correctivo">Correctivo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="Completado">Completado</SelectItem>
                  <SelectItem value="En Proceso">En Proceso</SelectItem>
                  <SelectItem value="Pendiente Pago">Pendiente Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de mantenimientos */}
        <Card>
          <CardHeader>
            <CardTitle>Registros de Mantenimiento</CardTitle>
            <CardDescription>
              Mostrando {filteredMantenimientos.length} de {totalMantenimientos} registros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Taller</TableHead>
                    <TableHead>Fechas</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Kilometraje</TableHead>
                    <TableHead>Paquete</TableHead>
                    <TableHead>Costo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMantenimientos.map((mantenimiento) => (
                    <TableRow key={mantenimiento.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 mr-2 text-gray-500" />
                          {mantenimiento.placaVehiculo}
                        </div>
                      </TableCell>
                      <TableCell>{mantenimiento.taller}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-green-600" />
                            <span className="text-green-600">Entrada: {mantenimiento.fechaEntrada}</span>
                          </div>
                          {mantenimiento.fechaSalida && (
                            <div className="flex items-center text-sm">
                              <Calendar className="h-3 w-3 mr-1 text-blue-600" />
                              <span className="text-blue-600">Salida: {mantenimiento.fechaSalida}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTipoBadge(mantenimiento.tipo)}>{mantenimiento.tipo}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Settings className="h-4 w-4 mr-1 text-gray-500" />
                          {mantenimiento.kilometraje.toLocaleString()} km
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-32">
                          <div className="font-medium text-sm">{mantenimiento.paqueteMantenimiento}</div>
                          <div className="text-xs text-gray-500 truncate" title={mantenimiento.causas}>
                            {mantenimiento.causas}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">${mantenimiento.costoTotal.toFixed(2)}</div>
                          {mantenimiento.fechaPago ? (
                            <div className="text-xs text-green-600">Pagado: {mantenimiento.fechaPago}</div>
                          ) : (
                            <div className="text-xs text-red-600">Pendiente</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getEstadoBadge(mantenimiento.estado)}>{mantenimiento.estado}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleEditMantenimiento(mantenimiento)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modal de edición */}
      <EditMantenimientoVehiculoModal
        mantenimiento={selectedMantenimiento}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedMantenimiento(null)
        }}
      />
    </div>
  )
}
