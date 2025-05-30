"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  Search,
  Filter,
  Download,
  User,
  DollarSign,
  AlertTriangle,
  Package,
  Route,
  X,
  Activity,
  Award,
  Target,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"

// Datos de ejemplo para conductores
const conductoresData = [
  {
    id: 1,
    nombre: "Carlos Rodríguez",
    cedula: "12345678",
    numeroViajes: 45,
    kmRecorridos: 12500,
    cargaTransportada: 89000, // kg
    ingresos: 15750000, // pesos
    numeroMultas: 2,
    gastosPorMultas: 450000, // pesos
    calificacion: 4.8,
    experiencia: "5 años",
  },
  {
    id: 2,
    nombre: "María González",
    cedula: "87654321",
    numeroViajes: 38,
    kmRecorridos: 9800,
    cargaTransportada: 76000,
    ingresos: 13200000,
    numeroMultas: 0,
    gastosPorMultas: 0,
    calificacion: 4.9,
    experiencia: "3 años",
  },
  {
    id: 3,
    nombre: "José Martínez",
    cedula: "11223344",
    numeroViajes: 52,
    kmRecorridos: 14200,
    cargaTransportada: 98500,
    ingresos: 18900000,
    numeroMultas: 1,
    gastosPorMultas: 180000,
    calificacion: 4.7,
    experiencia: "8 años",
  },
  {
    id: 4,
    nombre: "Ana López",
    cedula: "44332211",
    numeroViajes: 41,
    kmRecorridos: 11300,
    cargaTransportada: 82000,
    ingresos: 14800000,
    numeroMultas: 3,
    gastosPorMultas: 720000,
    calificacion: 4.2,
    experiencia: "2 años",
  },
  {
    id: 5,
    nombre: "Pedro Sánchez",
    cedula: "55667788",
    numeroViajes: 35,
    kmRecorridos: 8900,
    cargaTransportada: 65000,
    ingresos: 11500000,
    numeroMultas: 1,
    gastosPorMultas: 250000,
    calificacion: 4.6,
    experiencia: "4 años",
  },
]

export default function IndicadoresConductorPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedYear, setSelectedYear] = useState("2024")
  const [filteredData, setFilteredData] = useState(conductoresData)
  const [activeTab, setActiveTab] = useState("overview")

  // Función para calcular indicadores
  const calcularIndicadores = (conductor: any) => {
    const kmPorViaje = conductor.numeroViajes > 0 ? conductor.kmRecorridos / conductor.numeroViajes : 0
    const cargaPorKm = conductor.kmRecorridos > 0 ? conductor.cargaTransportada / conductor.kmRecorridos : 0
    const cargaPorViaje = conductor.numeroViajes > 0 ? conductor.cargaTransportada / conductor.numeroViajes : 0
    const ingresosPorKm = conductor.kmRecorridos > 0 ? conductor.ingresos / conductor.kmRecorridos : 0
    const ingresosPorViaje = conductor.numeroViajes > 0 ? conductor.ingresos / conductor.numeroViajes : 0

    return {
      ...conductor,
      kmPorViaje,
      cargaPorKm,
      cargaPorViaje,
      ingresosPorKm,
      ingresosPorViaje,
    }
  }

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    let filtered = conductoresData

    if (searchTerm) {
      filtered = filtered.filter(
        (conductor) =>
          conductor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || conductor.cedula.includes(searchTerm),
      )
    }

    setFilteredData(filtered)
  }

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setSearchTerm("")
    setSelectedMonth("all")
    setSelectedYear("2024")
    setFilteredData(conductoresData)
  }

  // Función para formatear números
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-CO").format(num)
  }

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calcular totales
  const totales = filteredData.reduce(
    (acc, conductor) => {
      return {
        totalViajes: acc.totalViajes + conductor.numeroViajes,
        totalKm: acc.totalKm + conductor.kmRecorridos,
        totalCarga: acc.totalCarga + conductor.cargaTransportada,
        totalIngresos: acc.totalIngresos + conductor.ingresos,
        totalMultas: acc.totalMultas + conductor.numeroMultas,
        totalGastosMultas: acc.totalGastosMultas + conductor.gastosPorMultas,
      }
    },
    {
      totalViajes: 0,
      totalKm: 0,
      totalCarga: 0,
      totalIngresos: 0,
      totalMultas: 0,
      totalGastosMultas: 0,
    },
  )

  const hasActiveFilters = searchTerm || selectedMonth !== "all" || selectedYear !== "2024"

  const getPerformanceColor = (calificacion: number) => {
    if (calificacion >= 4.5) return "text-green-600 bg-green-100"
    if (calificacion >= 4.0) return "text-blue-600 bg-blue-100"
    if (calificacion >= 3.5) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const getSafetyBadge = (multas: number) => {
    if (multas === 0) return { text: "Excelente", color: "bg-green-100 text-green-800 border-green-200" }
    if (multas <= 2) return { text: "Bueno", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
    return { text: "Requiere Atención", color: "bg-red-100 text-red-800 border-red-200" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <SiteHeader 
        title="Indicadores por Conductor" 
        subtitle="Análisis de rendimiento y productividad de conductores" 
        showBackLink={true} 
      />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filters Section */}
        <Card className="mb-8 border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Filter className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <CardTitle className="text-lg dark:text-slate-100">Filtros de Búsqueda</CardTitle>
                  <CardDescription className="dark:text-slate-400">
                    Personaliza tu análisis de conductores
                  </CardDescription>
                </div>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={limpiarFiltros}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-slate-700">
                  Buscar Conductor
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Nombre o cédula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-rose-500 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="month" className="text-sm font-medium text-slate-700">
                  Mes
                </Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="border-slate-200 focus:border-rose-500 focus:ring-rose-500/20">
                    <SelectValue placeholder="Todos los meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los meses</SelectItem>
                    <SelectItem value="01">Enero</SelectItem>
                    <SelectItem value="02">Febrero</SelectItem>
                    <SelectItem value="03">Marzo</SelectItem>
                    <SelectItem value="04">Abril</SelectItem>
                    <SelectItem value="05">Mayo</SelectItem>
                    <SelectItem value="06">Junio</SelectItem>
                    <SelectItem value="07">Julio</SelectItem>
                    <SelectItem value="08">Agosto</SelectItem>
                    <SelectItem value="09">Septiembre</SelectItem>
                    <SelectItem value="10">Octubre</SelectItem>
                    <SelectItem value="11">Noviembre</SelectItem>
                    <SelectItem value="12">Diciembre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-medium text-slate-700">
                  Año
                </Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="border-slate-200 focus:border-rose-500 focus:ring-rose-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={aplicarFiltros} className="w-full bg-rose-600 hover:bg-rose-700">
                  <Search className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </div>

              <div className="flex items-end">
                <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full text-center">
                  <Users className="h-4 w-4 inline mr-2" />
                  {filteredData.length} conductor(es)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium">Total Viajes</p>
                  <p className="text-2xl font-bold">{formatNumber(totales.totalViajes)}</p>
                </div>
                <Route className="h-6 w-6 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs font-medium">Total Km</p>
                  <p className="text-2xl font-bold">{formatNumber(totales.totalKm)}</p>
                </div>
                <Activity className="h-6 w-6 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs font-medium">Carga (kg)</p>
                  <p className="text-2xl font-bold">{(totales.totalCarga / 1000).toFixed(0)}K</p>
                </div>
                <Package className="h-6 w-6 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-violet-100 text-xs font-medium">Ingresos</p>
                  <p className="text-2xl font-bold">${(totales.totalIngresos / 1000000).toFixed(1)}M</p>
                </div>
                <DollarSign className="h-6 w-6 text-violet-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-xs font-medium">Multas</p>
                  <p className="text-2xl font-bold">{formatNumber(totales.totalMultas)}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-xs font-medium">Gastos Multas</p>
                  <p className="text-2xl font-bold">${(totales.totalGastosMultas / 1000).toFixed(0)}K</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-xl">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: "overview", name: "Resumen General", icon: Users },
                { id: "performance", name: "Rendimiento", icon: Target },
                { id: "safety", name: "Seguridad", icon: Award },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-rose-500 text-rose-600 bg-rose-50"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-rose-600" />
                  <span>Indicadores por Conductor</span>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
              <CardDescription>
                Análisis detallado de rendimiento por conductor ({filteredData.length} conductores)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead className="font-semibold text-slate-700 min-w-[200px]">Conductor</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Viajes</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Km Recorridos</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Km/Viaje</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Carga (kg)</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Carga/Km</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Carga/Viaje</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Ingresos</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Ingresos/Km</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Ingresos/Viaje</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Multas</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Gastos Multas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((conductor) => {
                      const indicadores = calcularIndicadores(conductor)
                      const safetyBadge = getSafetyBadge(conductor.numeroMultas)
                      return (
                        <TableRow key={conductor.id} className="border-slate-200 hover:bg-slate-50/50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${getPerformanceColor(conductor.calificacion)}`}>
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">{conductor.nombre}</div>
                                <div className="text-sm text-slate-500">CC: {conductor.cedula}</div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    ⭐ {conductor.calificacion}
                                  </Badge>
                                  <span className="text-xs text-slate-500">{conductor.experiencia}</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {formatNumber(conductor.numeroViajes)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-medium">{formatNumber(conductor.kmRecorridos)} km</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <Activity className="h-3 w-3 text-green-500" />
                              <span className="text-green-600 font-medium">
                                {formatNumber(Math.round(indicadores.kmPorViaje))}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-medium">{formatNumber(conductor.cargaTransportada)} kg</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-purple-600 font-medium">
                              {formatNumber(Math.round(indicadores.cargaPorKm))}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-purple-600 font-medium">
                              {formatNumber(Math.round(indicadores.cargaPorViaje))}
                            </span>
                          </TableCell>\
