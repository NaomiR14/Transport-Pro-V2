"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Eye, Edit, Truck, Shield, AlertTriangle, Calendar } from "lucide-react"
import Link from "next/link"
import EditSeguroModal from "@/components/EditSeguroModal"

interface SeguroVehiculo {
  seguro_id: string
  vehiculo_id: string
  numero_vehiculo: string
  placa_vehiculo: string
  aseguradora: string
  poliza_seguro: string
  fecha_inicio: string
  fecha_vencimiento: string
  importe_pagado: number
  fecha_pago: string
  estado_poliza: "vigente" | "vencida" | "por_vencer" | "cancelada"
}

export default function SegurosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingSeguro, setEditingSeguro] = useState<SeguroVehiculo | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Mock data
  const seguros: SeguroVehiculo[] = [
    {
      seguro_id: "1",
      vehiculo_id: "1",
      numero_vehiculo: "VEH-001",
      placa_vehiculo: "ABC-123",
      aseguradora: "Seguros Monterrey",
      poliza_seguro: "POL-2024-001",
      fecha_inicio: "2024-01-15",
      fecha_vencimiento: "2025-01-15",
      importe_pagado: 45000,
      fecha_pago: "2024-01-10",
      estado_poliza: "vigente",
    },
    {
      seguro_id: "2",
      vehiculo_id: "2",
      numero_vehiculo: "VEH-002",
      placa_vehiculo: "DEF-456",
      aseguradora: "AXA Seguros",
      poliza_seguro: "POL-2024-002",
      fecha_inicio: "2024-02-01",
      fecha_vencimiento: "2025-02-01",
      importe_pagado: 52000,
      fecha_pago: "2024-01-28",
      estado_poliza: "vigente",
    },
    {
      seguro_id: "3",
      vehiculo_id: "3",
      numero_vehiculo: "VEH-003",
      placa_vehiculo: "GHI-789",
      aseguradora: "Qualitas Seguros",
      poliza_seguro: "POL-2024-003",
      fecha_inicio: "2023-12-01",
      fecha_vencimiento: "2024-12-01",
      importe_pagado: 38000,
      fecha_pago: "2023-11-25",
      estado_poliza: "por_vencer",
    },
    {
      seguro_id: "4",
      vehiculo_id: "4",
      numero_vehiculo: "VEH-004",
      placa_vehiculo: "JKL-012",
      aseguradora: "HDI Seguros",
      poliza_seguro: "POL-2023-015",
      fecha_inicio: "2023-06-15",
      fecha_vencimiento: "2024-06-15",
      importe_pagado: 41000,
      fecha_pago: "2023-06-10",
      estado_poliza: "vencida",
    },
  ]

  const getEstadoPolizaBadge = (estado: string) => {
    const variants = {
      vigente: "bg-green-100 text-green-800",
      vencida: "bg-red-100 text-red-800",
      por_vencer: "bg-yellow-100 text-yellow-800",
      cancelada: "bg-gray-100 text-gray-800",
    }
    return variants[estado as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const getEstadoPolizaText = (estado: string) => {
    const texts = {
      vigente: "Vigente",
      vencida: "Vencida",
      por_vencer: "Por Vencer",
      cancelada: "Cancelada",
    }
    return texts[estado as keyof typeof texts] || estado
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

  const filteredSeguros = seguros.filter(
    (seguro) =>
      seguro.numero_vehiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seguro.placa_vehiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seguro.aseguradora.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seguro.poliza_seguro.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEditSeguro = (seguro: SeguroVehiculo) => {
    setEditingSeguro(seguro)
    setIsEditModalOpen(true)
  }

  const handleSaveSeguro = (updatedSeguro: SeguroVehiculo) => {
    console.log("Saving seguro:", updatedSeguro)
    setIsEditModalOpen(false)
    setEditingSeguro(null)
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setEditingSeguro(null)
  }

  // Calculate statistics
  const segurosVigentes = seguros.filter((s) => s.estado_poliza === "vigente").length
  const segurosPorVencer = seguros.filter((s) => s.estado_poliza === "por_vencer").length
  const segurosVencidos = seguros.filter((s) => s.estado_poliza === "vencida").length

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
              <Shield className="h-8 w-8 text-cyan-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Seguros de Vehículos</h1>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Póliza
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Pólizas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{seguros.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Vigentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{segurosVigentes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{segurosPorVencer}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{segurosVencidos}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Seguros</CardTitle>
                  <CardDescription>Administra las pólizas de seguro de la flota vehicular</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Buscar seguros..."
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
                    <TableHead>Número Vehículo</TableHead>
                    <TableHead>Placa Vehículo</TableHead>
                    <TableHead>Aseguradora</TableHead>
                    <TableHead>Póliza Seguro</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Vencimiento</TableHead>
                    <TableHead>Importe Pagado</TableHead>
                    <TableHead>Fecha Pago</TableHead>
                    <TableHead>Estado Póliza</TableHead>
                    <TableHead>Días Restantes</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSeguros.map((seguro) => {
                    const diasRestantes = calcularDiasVencimiento(seguro.fecha_vencimiento)
                    return (
                      <TableRow key={seguro.seguro_id}>
                        <TableCell className="font-medium">{seguro.numero_vehiculo}</TableCell>
                        <TableCell className="font-mono">{seguro.placa_vehiculo}</TableCell>
                        <TableCell>{seguro.aseguradora}</TableCell>
                        <TableCell className="font-mono">{seguro.poliza_seguro}</TableCell>
                        <TableCell>{formatearFecha(seguro.fecha_inicio)}</TableCell>
                        <TableCell>{formatearFecha(seguro.fecha_vencimiento)}</TableCell>
                        <TableCell className="font-semibold">${seguro.importe_pagado.toLocaleString()}</TableCell>
                        <TableCell>{formatearFecha(seguro.fecha_pago)}</TableCell>
                        <TableCell>
                          <Badge className={getEstadoPolizaBadge(seguro.estado_poliza)}>
                            {getEstadoPolizaText(seguro.estado_poliza)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {diasRestantes <= 30 && diasRestantes > 0 && (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                            {diasRestantes <= 0 && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            <span
                              className={`text-sm ${
                                diasRestantes <= 30
                                  ? diasRestantes <= 0
                                    ? "text-red-600 font-semibold"
                                    : "text-yellow-600 font-semibold"
                                  : ""
                              }`}
                            >
                              {diasRestantes > 0
                                ? `${diasRestantes} días`
                                : `Vencida hace ${Math.abs(diasRestantes)} días`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditSeguro(seguro)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Calendar className="h-4 w-4" />
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
        {isEditModalOpen && editingSeguro && (
          <EditSeguroModal seguro={editingSeguro} onSave={handleSaveSeguro} onClose={handleCloseModal} />
        )}
      </main>
    </div>
  )
}
