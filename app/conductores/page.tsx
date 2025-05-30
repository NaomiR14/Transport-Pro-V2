"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Eye, Edit, Truck, Users, Star, Phone, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"
import EditConductorModal from "@/components/EditConductorModal"

interface Conductor {
  conductor_id: string
  numero_conductor: string
  documento_identidad: string
  nombre_conductor: string
  numero_licencia: string
  direccion: string
  telefono: string
  calificacion: number
  email: string
  activo: boolean
  fecha_vencimiento_licencia: string
  tipo_licencia: string
  estado_licencia: "vigente" | "por_vencer" | "vencida"
}

export default function ConductoresPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingConductor, setEditingConductor] = useState<Conductor | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Mock data
  const conductores: Conductor[] = [
    {
      conductor_id: "1",
      numero_conductor: "COND-001",
      documento_identidad: "CURP123456789012345",
      nombre_conductor: "Juan Carlos Pérez García",
      numero_licencia: "LIC-2024-001",
      direccion: "Av. Revolución 123, Col. Centro, Ciudad de México",
      telefono: "+52 55 1234-5678",
      calificacion: 4.8,
      email: "juan.perez@email.com",
      activo: true,
      fecha_vencimiento_licencia: "2025-06-15",
      tipo_licencia: "Federal",
      estado_licencia: "vigente",
    },
    {
      conductor_id: "2",
      numero_conductor: "COND-002",
      documento_identidad: "CURP987654321098765",
      nombre_conductor: "María Elena García López",
      numero_licencia: "LIC-2024-002",
      direccion: "Calle Morelos 456, Col. Reforma, Guadalajara, Jalisco",
      telefono: "+52 33 9876-5432",
      calificacion: 4.9,
      email: "maria.garcia@email.com",
      activo: true,
      fecha_vencimiento_licencia: "2025-03-20",
      tipo_licencia: "Federal",
      estado_licencia: "vigente",
    },
    {
      conductor_id: "3",
      numero_conductor: "COND-003",
      documento_identidad: "CURP456789123456789",
      nombre_conductor: "Carlos Alberto López Martínez",
      numero_licencia: "LIC-2023-015",
      direccion: "Blvd. Díaz Ordaz 789, Col. Santa María, Monterrey, N.L.",
      telefono: "+52 81 5555-1234",
      calificacion: 4.6,
      email: "carlos.lopez@email.com",
      activo: true,
      fecha_vencimiento_licencia: "2024-12-10",
      tipo_licencia: "Federal",
      estado_licencia: "por_vencer",
    },
    {
      conductor_id: "4",
      numero_conductor: "COND-004",
      documento_identidad: "CURP789123456789123",
      nombre_conductor: "Ana Patricia Rodríguez Hernández",
      numero_licencia: "LIC-2023-008",
      direccion: "Av. Universidad 321, Col. Del Valle, Puebla, Puebla",
      telefono: "+52 22 3333-7890",
      calificacion: 4.7,
      email: "ana.rodriguez@email.com",
      activo: true,
      fecha_vencimiento_licencia: "2024-08-30",
      tipo_licencia: "Federal",
      estado_licencia: "vencida",
    },
    {
      conductor_id: "5",
      numero_conductor: "COND-005",
      documento_identidad: "CURP321654987321654",
      nombre_conductor: "Roberto Miguel Sánchez Torres",
      numero_licencia: "LIC-2024-003",
      direccion: "Calle Hidalgo 654, Col. Centro, Veracruz, Veracruz",
      telefono: "+52 22 9999-4567",
      calificacion: 4.5,
      email: "roberto.sanchez@email.com",
      activo: false,
      fecha_vencimiento_licencia: "2025-09-12",
      tipo_licencia: "Federal",
      estado_licencia: "vigente",
    },
  ]

  const getCalificacionStars = (calificacion: number) => {
    const fullStars = Math.floor(calificacion)
    const hasHalfStar = calificacion % 1 !== 0
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <Star className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-gray-300" />
        ))}
        <span className="ml-2 text-sm font-medium">{calificacion.toFixed(1)}</span>
      </div>
    )
  }

  const getEstadoLicenciaBadge = (estado: string) => {
    const variants = {
      vigente: "bg-green-100 text-green-800",
      por_vencer: "bg-yellow-100 text-yellow-800",
      vencida: "bg-red-100 text-red-800",
    }
    return variants[estado as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const getEstadoLicenciaText = (estado: string) => {
    const texts = {
      vigente: "Vigente",
      por_vencer: "Por Vencer",
      vencida: "Vencida",
    }
    return texts[estado as keyof typeof texts] || estado
  }

  const getActivoBadge = (activo: boolean) => {
    return activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const calcularDiasVencimiento = (fechaVencimiento: string) => {
    const hoy = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diferencia = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24))
    return diferencia
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const filteredConductores = conductores.filter(
    (conductor) =>
      conductor.numero_conductor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conductor.nombre_conductor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conductor.numero_licencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conductor.documento_identidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conductor.telefono.includes(searchTerm),
  )

  const handleEditConductor = (conductor: Conductor) => {
    setEditingConductor(conductor)
    setIsEditModalOpen(true)
  }

  const handleSaveConductor = (updatedConductor: Conductor) => {
    console.log("Saving conductor:", updatedConductor)
    setIsEditModalOpen(false)
    setEditingConductor(null)
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setEditingConductor(null)
  }

  // Calculate statistics
  const conductoresActivos = conductores.filter((c) => c.activo).length
  const conductoresInactivos = conductores.filter((c) => !c.activo).length
  const licenciasVencidas = conductores.filter((c) => c.estado_licencia === "vencida").length
  const calificacionPromedio = conductores.reduce((sum, c) => sum + c.calificacion, 0) / conductores.length || 0

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
              <Users className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Conductores</h1>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Conductor
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Conductores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{conductores.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{conductoresActivos}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Licencias Vencidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{licenciasVencidas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-yellow-600">{calificacionPromedio.toFixed(1)}</div>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 ml-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Conductores</CardTitle>
                  <CardDescription>Administra la información de los conductores de la flota</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Buscar conductores..."
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
                    <TableHead>Número Conductor</TableHead>
                    <TableHead>Documento Identidad</TableHead>
                    <TableHead>Nombre del Conductor</TableHead>
                    <TableHead>Número de Licencia</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead>Estado Licencia</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConductores.map((conductor) => {
                    const diasVencimiento = calcularDiasVencimiento(conductor.fecha_vencimiento_licencia)
                    return (
                      <TableRow key={conductor.conductor_id}>
                        <TableCell className="font-medium">{conductor.numero_conductor}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-gray-500" />
                            <span className="font-mono text-xs">{conductor.documento_identidad}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{conductor.nombre_conductor}</div>
                          <div className="text-sm text-gray-500">{conductor.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono">{conductor.numero_licencia}</div>
                          <div className="text-xs text-gray-500">
                            Vence: {formatearFecha(conductor.fecha_vencimiento_licencia)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start space-x-2 max-w-xs">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{conductor.direccion}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="font-mono text-sm">{conductor.telefono}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getCalificacionStars(conductor.calificacion)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={getEstadoLicenciaBadge(conductor.estado_licencia)}>
                              {getEstadoLicenciaText(conductor.estado_licencia)}
                            </Badge>
                            {diasVencimiento <= 30 && diasVencimiento > 0 && (
                              <div className="text-xs text-yellow-600">Vence en {diasVencimiento} días</div>
                            )}
                            {diasVencimiento <= 0 && (
                              <div className="text-xs text-red-600">Vencida hace {Math.abs(diasVencimiento)} días</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getActivoBadge(conductor.activo)}>
                            {conductor.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditConductor(conductor)}>
                              <Edit className="h-4 w-4" />
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
        {isEditModalOpen && editingConductor && (
          <EditConductorModal conductor={editingConductor} onSave={handleSaveConductor} onClose={handleCloseModal} />
        )}
      </main>
    </div>
  )
}
