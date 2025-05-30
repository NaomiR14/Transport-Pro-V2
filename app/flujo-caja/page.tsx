"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus, Search, BarChart3, PieChart } from "lucide-react"
import { EditFlujoCajaModal } from "@/components/EditFlujoCajaModal"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts"

// Sample data for demonstration
const flujoCajaData = [
  {
    id: 1,
    año: 2024,
    mes: "Enero",
    ingresos: 125000,
    egresos: 98500,
    personal: 45000,
    seguros: 8500,
    impuestos: 12000,
    multas: 2500,
    mantenimiento: 15000,
    combustible: 8000,
    peaje: 3500,
    comidas: 2000,
    otros_egresos: 2000,
    utilidad: 26500,
    margen: 21.2,
  },
  {
    id: 2,
    año: 2024,
    mes: "Febrero",
    ingresos: 138000,
    egresos: 105000,
    personal: 45000,
    seguros: 8500,
    impuestos: 15000,
    multas: 1500,
    mantenimiento: 18000,
    combustible: 9000,
    peaje: 4000,
    comidas: 2500,
    otros_egresos: 1500,
    utilidad: 33000,
    margen: 23.9,
  },
  {
    id: 3,
    año: 2024,
    mes: "Marzo",
    ingresos: 142000,
    egresos: 108000,
    personal: 47000,
    seguros: 8500,
    impuestos: 13000,
    multas: 3000,
    mantenimiento: 20000,
    combustible: 8500,
    peaje: 4500,
    comidas: 2000,
    otros_egresos: 1500,
    utilidad: 34000,
    margen: 23.9,
  },
]

// Chart data for monthly income
const chartData = flujoCajaData.map((item) => ({
  mes: item.mes,
  ingresos: item.ingresos,
  utilidad: item.utilidad,
}))

// Expense breakdown data
const expenseData = [
  { name: "Personal", value: 45000, color: "#8884d8" },
  { name: "Mantenimiento", value: 18000, color: "#82ca9d" },
  { name: "Impuestos", value: 13000, color: "#ffc658" },
  { name: "Combustible", value: 8500, color: "#ff7300" },
  { name: "Seguros", value: 8500, color: "#00ff88" },
  { name: "Otros", value: 14500, color: "#ff0088" },
]

export default function FlujoCajaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState("2024")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  const filteredData = flujoCajaData.filter((record) => {
    const matchesSearch = record.mes.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = selectedYear === "all" || record.año.toString() === selectedYear
    const matchesMonth = selectedMonth === "all" || record.mes === selectedMonth
    return matchesSearch && matchesYear && matchesMonth
  })

  const totalIngresos = filteredData.reduce((sum, record) => sum + record.ingresos, 0)
  const totalEgresos = filteredData.reduce((sum, record) => sum + record.egresos, 0)
  const totalUtilidad = filteredData.reduce((sum, record) => sum + record.utilidad, 0)
  const promedioMargen =
    filteredData.length > 0 ? filteredData.reduce((sum, record) => sum + record.margen, 0) / filteredData.length : 0

  const handleEdit = (record) => {
    setEditingRecord(record)
    setIsEditModalOpen(true)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-emerald-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Flujo de Caja Mensual</h1>
                <p className="text-gray-600">Gestión y análisis financiero mensual</p>
              </div>
            </div>
            <Button onClick={() => setIsEditModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Registro
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIngresos)}</div>
                <p className="text-xs text-gray-600">Período seleccionado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalEgresos)}</div>
                <p className="text-xs text-gray-600">Período seleccionado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilidad Total</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalUtilidad)}</div>
                <p className="text-xs text-gray-600">Período seleccionado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Margen Promedio</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{promedioMargen.toFixed(1)}%</div>
                <p className="text-xs text-gray-600">Período seleccionado</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Income Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Ingresos Mensuales
                </CardTitle>
                <CardDescription>Evolución de ingresos y utilidad por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
                    <Bar dataKey="utilidad" fill="#3b82f6" name="Utilidad" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense Breakdown Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Distribución de Egresos
                </CardTitle>
                <CardDescription>Desglose de gastos por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Expense Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Resumen de Egresos</CardTitle>
              <CardDescription>Desglose detallado de gastos por año y mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredData.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">
                        {record.mes} {record.año}
                      </h4>
                      <Calendar className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gastos Personal:</span>
                        <span className="font-medium">{formatCurrency(record.personal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Otros Gastos:</span>
                        <span className="font-medium">{formatCurrency(record.egresos - record.personal)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Total Egresos:</span>
                        <span className="font-bold">{formatCurrency(record.egresos)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtros y Búsqueda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por mes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar año" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los años</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar mes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los meses</SelectItem>
                    <SelectItem value="Enero">Enero</SelectItem>
                    <SelectItem value="Febrero">Febrero</SelectItem>
                    <SelectItem value="Marzo">Marzo</SelectItem>
                    <SelectItem value="Abril">Abril</SelectItem>
                    <SelectItem value="Mayo">Mayo</SelectItem>
                    <SelectItem value="Junio">Junio</SelectItem>
                    <SelectItem value="Julio">Julio</SelectItem>
                    <SelectItem value="Agosto">Agosto</SelectItem>
                    <SelectItem value="Septiembre">Septiembre</SelectItem>
                    <SelectItem value="Octubre">Octubre</SelectItem>
                    <SelectItem value="Noviembre">Noviembre</SelectItem>
                    <SelectItem value="Diciembre">Diciembre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow Table */}
          <Card>
            <CardHeader>
              <CardTitle>Registros de Flujo de Caja</CardTitle>
              <CardDescription>Mostrando {filteredData.length} registros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead>Ingresos</TableHead>
                      <TableHead>Egresos</TableHead>
                      <TableHead>Personal</TableHead>
                      <TableHead>Seguros</TableHead>
                      <TableHead>Impuestos</TableHead>
                      <TableHead>Multas</TableHead>
                      <TableHead>Mantenimiento</TableHead>
                      <TableHead>Combustible</TableHead>
                      <TableHead>Peaje</TableHead>
                      <TableHead>Comidas</TableHead>
                      <TableHead>Otros</TableHead>
                      <TableHead>Utilidad</TableHead>
                      <TableHead>Margen</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            <div>
                              <div className="font-medium">{record.mes}</div>
                              <div className="text-sm text-gray-500">{record.año}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">{formatCurrency(record.ingresos)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-red-600">{formatCurrency(record.egresos)}</div>
                        </TableCell>
                        <TableCell>{formatCurrency(record.personal)}</TableCell>
                        <TableCell>{formatCurrency(record.seguros)}</TableCell>
                        <TableCell>{formatCurrency(record.impuestos)}</TableCell>
                        <TableCell>{formatCurrency(record.multas)}</TableCell>
                        <TableCell>{formatCurrency(record.mantenimiento)}</TableCell>
                        <TableCell>{formatCurrency(record.combustible)}</TableCell>
                        <TableCell>{formatCurrency(record.peaje)}</TableCell>
                        <TableCell>{formatCurrency(record.comidas)}</TableCell>
                        <TableCell>{formatCurrency(record.otros_egresos)}</TableCell>
                        <TableCell>
                          <div className={`font-medium ${record.utilidad >= 0 ? "text-blue-600" : "text-red-600"}`}>
                            {formatCurrency(record.utilidad)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.margen >= 20 ? "default" : record.margen >= 10 ? "secondary" : "destructive"
                            }
                          >
                            {record.margen.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <EditFlujoCajaModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingRecord(null)
        }}
        record={editingRecord}
      />
    </div>
  )
}
