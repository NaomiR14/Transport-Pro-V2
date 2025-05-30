"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Eye, Edit, Truck } from "lucide-react"
import Link from "next/link"

interface OrdenTransporte {
  orden_id: string
  numero_interno: string
  folio_carta_porte: string
  cliente: string
  conductor: string
  vehiculo: string
  origen: string
  destino: string
  estado: "pendiente" | "en_transito" | "entregado" | "devuelto"
  monto_total: number
  fecha_creacion: string
}

export default function OrdenesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data - in real app this would come from API
  const ordenes: OrdenTransporte[] = [
    {
      orden_id: "1",
      numero_interno: "ORD-2024-001",
      folio_carta_porte: "CP-2024-001",
      cliente: "Empresa ABC S.A.",
      conductor: "Juan Pérez",
      vehiculo: "ABC-123",
      origen: "Ciudad de México",
      destino: "Guadalajara",
      estado: "en_transito",
      monto_total: 15000,
      fecha_creacion: "2024-01-15",
    },
    {
      orden_id: "2",
      numero_interno: "ORD-2024-002",
      folio_carta_porte: "CP-2024-002",
      cliente: "Distribuidora XYZ",
      conductor: "María García",
      vehiculo: "DEF-456",
      origen: "Monterrey",
      destino: "Tijuana",
      estado: "pendiente",
      monto_total: 22000,
      fecha_creacion: "2024-01-16",
    },
    {
      orden_id: "3",
      numero_interno: "ORD-2024-003",
      folio_carta_porte: "CP-2024-003",
      cliente: "Logística 123",
      conductor: "Carlos López",
      vehiculo: "GHI-789",
      origen: "Puebla",
      destino: "Veracruz",
      estado: "entregado",
      monto_total: 8500,
      fecha_creacion: "2024-01-14",
    },
  ]

  const getEstadoBadge = (estado: string) => {
    const variants = {
      pendiente: "bg-yellow-100 text-yellow-800",
      en_transito: "bg-blue-100 text-blue-800",
      entregado: "bg-green-100 text-green-800",
      devuelto: "bg-red-100 text-red-800",
    }
    return variants[estado as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const filteredOrdenes = ordenes.filter(
    (orden) =>
      orden.numero_interno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.conductor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
              <h1 className="text-2xl font-bold text-gray-900">Órdenes de Transporte</h1>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Orden
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Órdenes</CardTitle>
                  <CardDescription>Administra todas las órdenes de transporte</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Buscar órdenes..."
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
                    <TableHead>Número Interno</TableHead>
                    <TableHead>Carta Porte</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Conductor</TableHead>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrdenes.map((orden) => (
                    <TableRow key={orden.orden_id}>
                      <TableCell className="font-medium">{orden.numero_interno}</TableCell>
                      <TableCell>{orden.folio_carta_porte}</TableCell>
                      <TableCell>{orden.cliente}</TableCell>
                      <TableCell>{orden.conductor}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{orden.origen}</div>
                          <div className="text-gray-500">→ {orden.destino}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getEstadoBadge(orden.estado)}>{orden.estado.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>${orden.monto_total.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
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
      </main>
    </div>
  )
}
