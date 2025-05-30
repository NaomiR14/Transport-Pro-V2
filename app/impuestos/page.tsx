"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Eye, Edit, Truck, Receipt, AlertTriangle, Calendar } from "lucide-react"
import Link from "next/link"
import EditImpuestoModal from "@/components/EditImpuestoModal"

interface ImpuestoVehiculo {
  impuesto_id: string
  vehiculo_id: string
  numero_vehiculo: string
  placa_vehiculo: string
  tipo_impuesto: string
  anio_impuesto: number
  impuesto_monto: number
  fecha_pago: string
  estado_pago: "pagado" | "pendiente" | "vencido"
}

export default function ImpuestosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingImpuesto, setEditingImpuesto] = useState<ImpuestoVehiculo | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Mock data
  const impuestos: ImpuestoVehiculo[] = [
    {
      impuesto_id: "1",
      vehiculo_id: "1",
      numero_vehiculo: "VEH-001",
      placa_vehiculo: "ABC-123",
      tipo_impuesto: "Tenencia",
      anio_impuesto: 2024,
      impuesto_monto: 8500,
      fecha_pago: "2024-01-15",
      estado_pago: "pagado",
    },
    {
      impuesto_id: "2",
      vehiculo_id: "1",
      numero_vehiculo: "VEH-001",
      placa_vehiculo: "ABC-123",
      tipo_impuesto: "Refrendo",
      anio_impuesto: 2024,
      impuesto_monto: 1200,
      fecha_pago: "2024-03-10",
      estado_pago: "pagado",
    },
    {
      impuesto_id: "3",
      vehiculo_id: "2",
      numero_vehiculo: "VEH-002",
      placa_vehiculo: "DEF-456",
      tipo_impuesto: "Tenencia",
      anio_impuesto: 2024,
      impuesto_monto: 9200,
      fecha_pago: "2024-02-20",
      estado_pago: "pagado",
    },
    {
      impuesto_id: "4",
      vehiculo_id: "2",
      numero_vehiculo: "VEH-002",
      placa_vehiculo: "DEF-456",
      tipo_impuesto: "Verificación",
      anio_impuesto: 2024,
      impuesto_monto: 450,
      fecha_pago: "2024-06-15",
      estado_pago: "pagado",
    },
    {
      impuesto_id: "5",
      vehiculo_id: "3",
      numero_vehiculo: "VEH-003",
      placa_vehiculo: "GHI-789",
      tipo_impuesto: "Tenencia",
      anio_impuesto: 2024,
      impuesto_monto: 7800,
      fecha_pago: "",
      estado_pago: "pendiente",
    },
    {
      impuesto_id: "6",
      vehiculo_id: "3",
      numero_vehiculo: "VEH-003",
      placa_vehiculo: "GHI-789",
      tipo_impuesto: "Refrendo",
      anio_impuesto: 2024,
      impuesto_monto: 1100,
      fecha_pago: "",
      estado_pago: "vencido",
    },
    {
      impuesto_id: "7",
      vehiculo_id: "4",
      numero_vehiculo: "VEH-004",
      placa_vehiculo: "JKL-012",
      tipo_impuesto: "Verificación",
      anio_impuesto: 2024,
      impuesto_monto: 500,
      fecha_pago: "2024-08-22",
      estado_pago: "pagado",
    },
    {
      impuesto_id: "8",
      vehiculo_id: "4",
      numero_vehiculo: "VEH-004",
      placa_vehiculo: "JKL-012",
      tipo_impuesto: "Tenencia",
      anio_impuesto: 2024,
      impuesto_monto: 8900,
      fecha_pago: "",
      estado_pago: "pendiente",
    },
  ]

  const getEstadoPagoBadge = (estado: string) => {
    const variants = {
      pagado: "bg-green-100 text-green-800",
      pendiente: "bg-yellow-100 text-yellow-800",
      vencido: "bg-red-100 text-red-800",
    }
    return variants[estado as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const getEstadoPagoText = (estado: string) => {
    const texts = {
      pagado: "Pagado",
      pendiente: "Pendiente",
      vencido: "Vencido",
    }
    return texts[estado as keyof typeof texts] || estado
  }

  const formatearFecha = (fecha: string) => {
    if (!fecha) return "No pagado"
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const filteredImpuestos = impuestos.filter(
    (impuesto) =>
      impuesto.numero_vehiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      impuesto.placa_vehiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      impuesto.tipo_impuesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      impuesto.anio_impuesto.toString().includes(searchTerm),
  )

  const handleEditImpuesto = (impuesto: ImpuestoVehiculo) => {
    setEditingImpuesto(impuesto)
    setIsEditModalOpen(true)
  }

  const handleSaveImpuesto = (updatedImpuesto: ImpuestoVehiculo) => {
    console.log("Saving impuesto:", updatedImpuesto)
    setIsEditModalOpen(false)
    setEditingImpuesto(null)
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setEditingImpuesto(null)
  }

  // Calculate statistics
  const impuestosPagados = impuestos.filter((i) => i.estado_pago === "pagado").length
  const impuestosPendientes = impuestos.filter((i) => i.estado_pago === "pendiente").length
  const impuestosVencidos = impuestos.filter((i) => i.estado_pago === "vencido").length
  const totalMontoPagado = impuestos
    .filter((i) => i.estado_pago === "pagado")
    .reduce((sum, i) => sum + i.impuesto_monto, 0)

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
              <Receipt className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Impuestos de Vehículos</h1>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Impuesto
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Impuestos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{impuestos.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pagados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{impuestosPagados}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{impuestosPendientes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">${totalMontoPagado.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Impuestos</CardTitle>
                  <CardDescription>Administra los impuestos y contribuciones de la flota vehicular</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Buscar impuestos..."
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
                    <TableHead>Tipo Impuesto</TableHead>
                    <TableHead>Año Impuesto</TableHead>
                    <TableHead>Impuesto ($)</TableHead>
                    <TableHead>Fecha de Pago</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredImpuestos.map((impuesto) => (
                    <TableRow key={impuesto.impuesto_id}>
                      <TableCell className="font-medium">{impuesto.numero_vehiculo}</TableCell>
                      <TableCell className="font-mono">{impuesto.placa_vehiculo}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Receipt className="h-4 w-4 text-gray-500" />
                          <span>{impuesto.tipo_impuesto}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{impuesto.anio_impuesto}</TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        ${impuesto.impuesto_monto.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {impuesto.estado_pago !== "pagado" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                          <span
                            className={
                              impuesto.estado_pago === "pagado" ? "text-gray-900" : "text-yellow-600 font-semibold"
                            }
                          >
                            {formatearFecha(impuesto.fecha_pago)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getEstadoPagoBadge(impuesto.estado_pago)}>
                          {getEstadoPagoText(impuesto.estado_pago)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditImpuesto(impuesto)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4" />
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
        {isEditModalOpen && editingImpuesto && (
          <EditImpuestoModal impuesto={editingImpuesto} onSave={handleSaveImpuesto} onClose={handleCloseModal} />
        )}
      </main>
    </div>
  )
}
