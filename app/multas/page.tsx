"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Eye, Edit, Truck, AlertTriangle, Calendar, User, CreditCard } from "lucide-react"
import Link from "next/link"
import EditMultaModal from "@/components/EditMultaModal"

interface MultaConductor {
  multa_id: string
  fecha: string
  numero_viaje: string
  placa_vehiculo: string
  conductor: string
  infraccion: string
  importe_multa: number
  importe_pagado: number
  debe: number
  estado_pago: "pagado" | "pendiente" | "parcial" | "vencido"
  observaciones: string
}

export default function MultasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingMulta, setEditingMulta] = useState<MultaConductor | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Mock data
  const multas: MultaConductor[] = [
    {
      multa_id: "1",
      fecha: "2024-01-15",
      numero_viaje: "VIAJE-001",
      placa_vehiculo: "ABC-123",
      conductor: "Juan Pérez",
      infraccion: "Exceso de velocidad",
      importe_multa: 2500,
      importe_pagado: 2500,
      debe: 0,
      estado_pago: "pagado",
      observaciones: "Multa pagada en tiempo y forma",
    },
    {
      multa_id: "2",
      fecha: "2024-01-18",
      numero_viaje: "VIAJE-005",
      placa_vehiculo: "DEF-456",
      conductor: "María García",
      infraccion: "No respetar señalamiento",
      importe_multa: 1800,
      importe_pagado: 1000,
      debe: 800,
      estado_pago: "parcial",
      observaciones: "Pago parcial realizado, pendiente saldo",
    },
    {
      multa_id: "3",
      fecha: "2024-01-20",
      numero_viaje: "VIAJE-008",
      placa_vehiculo: "GHI-789",
      conductor: "Carlos López",
      infraccion: "Estacionamiento indebido",
      importe_multa: 1200,
      importe_pagado: 0,
      debe: 1200,
      estado_pago: "pendiente",
      observaciones: "Multa recién recibida, en proceso de revisión",
    },
    {
      multa_id: "4",
      fecha: "2024-01-22",
      numero_viaje: "VIAJE-012",
      placa_vehiculo: "JKL-012",
      conductor: "Ana Rodríguez",
      infraccion: "Circular sin verificación",
      importe_multa: 3500,
      importe_pagado: 0,
      debe: 3500,
      estado_pago: "vencido",
      observaciones: "Multa vencida, aplicar recargos",
    },
    {
      multa_id: "5",
      fecha: "2024-01-25",
      numero_viaje: "VIAJE-015",
      placa_vehiculo: "MNO-345",
      conductor: "Roberto Sánchez",
      infraccion: "Sobrepeso en báscula",
      importe_multa: 5000,
      importe_pagado: 2500,
      debe: 2500,
      estado_pago: "parcial",
      observaciones: "Convenio de pago establecido",
    },
    {
      multa_id: "6",
      fecha: "2024-01-28",
      numero_viaje: "VIAJE-018",
      placa_vehiculo: "PQR-678",
      conductor: "Laura Martínez",
      infraccion: "Documentos vencidos",
      importe_multa: 2200,
      importe_pagado: 0,
      debe: 2200,
      estado_pago: "pendiente",
      observaciones: "Esperando renovación de documentos",
    },
  ]

  const getEstadoPagoBadge = (estado: string) => {
    const variants = {
      pagado: "bg-green-100 text-green-800",
      pendiente: "bg-yellow-100 text-yellow-800",
      parcial: "bg-blue-100 text-blue-800",
      vencido: "bg-red-100 text-red-800",
    }
    return variants[estado as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const getEstadoPagoText = (estado: string) => {
    const texts = {
      pagado: "Pagado",
      pendiente: "Pendiente",
      parcial: "Parcial",
      vencido: "Vencido",
    }
    return texts[estado as keyof typeof texts] || estado
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const calcularPorcentajePago = (importePagado: number, importeMulta: number) => {
    return importeMulta > 0 ? (importePagado / importeMulta) * 100 : 0
  }

  const filteredMultas = multas.filter(
    (multa) =>
      multa.numero_viaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
      multa.placa_vehiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      multa.conductor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      multa.infraccion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEditMulta = (multa: MultaConductor) => {
    setEditingMulta(multa)
    setIsEditModalOpen(true)
  }

  const handleSaveMulta = (updatedMulta: MultaConductor) => {
    console.log("Saving multa:", updatedMulta)
    setIsEditModalOpen(false)
    setEditingMulta(null)
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setEditingMulta(null)
  }

  // Calculate statistics
  const totalMultas = multas.length
  const multasPagadas = multas.filter((m) => m.estado_pago === "pagado").length
  const multasPendientes = multas.filter((m) => m.estado_pago === "pendiente").length
  const multasVencidas = multas.filter((m) => m.estado_pago === "vencido").length
  const totalImporteMultas = multas.reduce((sum, m) => sum + m.importe_multa, 0)
  const totalImportePagado = multas.reduce((sum, m) => sum + m.importe_pagado, 0)
  const totalDebe = multas.reduce((sum, m) => sum + m.debe, 0)

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
              <AlertTriangle className="h-8 w-8 text-amber-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Multas de Conductores</h1>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Multa
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Multas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMultas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{multasPagadas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{multasPendientes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{multasVencidas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Debe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${totalDebe.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Multas de Conductores</CardTitle>
                  <CardDescription>Administra las multas e infracciones de tránsito de los conductores</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Buscar multas..."
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
                    <TableHead>Fecha</TableHead>
                    <TableHead>Número de Viaje</TableHead>
                    <TableHead>Placa Vehículo</TableHead>
                    <TableHead>Conductor</TableHead>
                    <TableHead>Infracción</TableHead>
                    <TableHead>Importe Multa</TableHead>
                    <TableHead>Importe Pagado</TableHead>
                    <TableHead>Debe</TableHead>
                    <TableHead>Estado de Pago</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMultas.map((multa) => {
                    const porcentajePago = calcularPorcentajePago(multa.importe_pagado, multa.importe_multa)
                    return (
                      <TableRow key={multa.multa_id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{formatearFecha(multa.fecha)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{multa.numero_viaje}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono font-medium">{multa.placa_vehiculo}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{multa.conductor}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm">{multa.infraccion}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-red-600">${multa.importe_multa.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold text-green-600">${multa.importe_pagado.toLocaleString()}</div>
                            {multa.importe_multa > 0 && (
                              <div className="text-xs text-gray-500">{porcentajePago.toFixed(1)}% pagado</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className={`font-semibold ${multa.debe > 0 ? "text-red-600" : "text-gray-500"}`}>
                              ${multa.debe.toLocaleString()}
                            </div>
                            {multa.debe > 0 && (
                              <div className="flex items-center space-x-1">
                                <CreditCard className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-500">Pendiente</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getEstadoPagoBadge(multa.estado_pago)}>
                            {getEstadoPagoText(multa.estado_pago)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-600 truncate" title={multa.observaciones}>
                              {multa.observaciones}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditMulta(multa)}>
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen Financiero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Multas:</span>
                    <span className="font-semibold text-red-600">${totalImporteMultas.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Pagado:</span>
                    <span className="font-semibold text-green-600">${totalImportePagado.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Total Debe:</span>
                    <span className="font-bold text-red-600">${totalDebe.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estado de Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pagadas:</span>
                    <span className="font-semibold text-green-600">{multasPagadas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pendientes:</span>
                    <span className="font-semibold text-yellow-600">{multasPendientes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Vencidas:</span>
                    <span className="font-semibold text-red-600">{multasVencidas}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Porcentaje de Cumplimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cumplimiento:</span>
                    <span className="font-semibold text-green-600">
                      {totalMultas > 0 ? ((multasPagadas / totalMultas) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${totalMultas > 0 ? (multasPagadas / totalMultas) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {isEditModalOpen && editingMulta && (
          <EditMultaModal multa={editingMulta} onSave={handleSaveMulta} onClose={handleCloseModal} />
        )}
      </main>
    </div>
  )
}
