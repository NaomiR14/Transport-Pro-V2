"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Truck,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Wrench,
  BarChart3,
  PieChart,
  Calendar,
  Search,
  X,
  FileText,
  Activity,
  Gauge,
} from "lucide-react"
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
import { SiteHeader } from "@/components/site-header"

interface VehicleIndicators {
  vehiculo_id: string
  placa: string
  numero_interno: string
  marca: string
  modelo: string
  // Totales
  numero_viajes: number
  km_recorridos: number
  ingresos_total: number
  gastos_total: number
  combustible_total: number
  carga_transportada: number
  total_mantenimientos: number
  mantenimientos_preventivos: number
  mantenimientos_correctivos: number
  // Indicadores de transporte
  km_por_galon: number
  km_por_viaje: number
  km_por_mantenimiento: number
  carga_media_viaje: number
  // Indicadores financieros
  ingreso_medio_viaje: number
  gasto_medio_viaje: number
  ingresos_por_km: number
  gastos_por_km: number
  utilidad_media_viaje: number
  utilidad_media_km: number
  margen_bruto_porcentaje: number
}

export default function IndicadoresVehiculoPage() {
  const [selectedPlaca, setSelectedPlaca] = useState<string>("ABC-123")
  const [selectedYear, setSelectedYear] = useState<string>("2024")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data
  const vehicleIndicators: VehicleIndicators[] = [
    {
      vehiculo_id: "1",
      placa: "ABC-123",
      numero_interno: "VEH-001",
      marca: "Kenworth",
      modelo: "T680",
      numero_viajes: 45,
      km_recorridos: 125000,
      ingresos_total: 2850000,
      gastos_total: 1950000,
      combustible_total: 485000,
      carga_transportada: 1800000,
      total_mantenimientos: 8,
      mantenimientos_preventivos: 6,
      mantenimientos_correctivos: 2,
      km_por_galon: 6.8,
      km_por_viaje: 2777.78,
      km_por_mantenimiento: 15625,
      carga_media_viaje: 40000,
      ingreso_medio_viaje: 63333.33,
      gasto_medio_viaje: 43333.33,
      ingresos_por_km: 22.8,
      gastos_por_km: 15.6,
      utilidad_media_viaje: 20000,
      utilidad_media_km: 7.2,
      margen_bruto_porcentaje: 31.58,
    },
    {
      vehiculo_id: "2",
      placa: "DEF-456",
      numero_interno: "VEH-002",
      marca: "Freightliner",
      modelo: "Cascadia",
      numero_viajes: 38,
      km_recorridos: 98000,
      ingresos_total: 2280000,
      gastos_total: 1680000,
      combustible_total: 392000,
      carga_transportada: 1520000,
      total_mantenimientos: 12,
      mantenimientos_preventivos: 7,
      mantenimientos_correctivos: 5,
      km_por_galon: 6.2,
      km_por_viaje: 2578.95,
      km_por_mantenimiento: 8166.67,
      carga_media_viaje: 40000,
      ingreso_medio_viaje: 60000,
      gasto_medio_viaje: 44210.53,
      ingresos_por_km: 23.27,
      gastos_por_km: 17.14,
      utilidad_media_viaje: 15789.47,
      utilidad_media_km: 6.12,
      margen_bruto_porcentaje: 26.32,
    },
    {
      vehiculo_id: "3",
      placa: "GHI-789",
      numero_interno: "VEH-003",
      marca: "Mercedes-Benz",
      modelo: "Actros",
      numero_viajes: 52,
      km_recorridos: 87000,
      ingresos_total: 2080000,
      gastos_total: 1456000,
      combustible_total: 348000,
      carga_transportada: 1300000,
      total_mantenimientos: 7,
      mantenimientos_preventivos: 5,
      mantenimientos_correctivos: 2,
      km_por_galon: 7.1,
      km_por_viaje: 1673.08,
      km_por_mantenimiento: 12428.57,
      carga_media_viaje: 25000,
      ingreso_medio_viaje: 40000,
      gasto_medio_viaje: 28000,
      ingresos_por_km: 23.91,
      gastos_por_km: 16.74,
      utilidad_media_viaje: 12000,
      utilidad_media_km: 7.17,
      margen_bruto_porcentaje: 30,
    },
  ]

  const vehiclePlates = ["ABC-123", "DEF-456", "GHI-789"]
  const years = ["2024", "2023", "2022", "2021"]

  const filteredData = vehicleIndicators.filter((vehicle) => {
    const matchesPlaca = !selectedPlaca || vehicle.placa === selectedPlaca
    const matchesSearch =
      !searchTerm ||
      vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.numero_interno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesPlaca && matchesSearch
  })

  // Aggregate data for charts
  const chartData = filteredData.map((vehicle) => ({
    name: vehicle.placa,
    ingresos: vehicle.ingresos_total,
    gastos: vehicle.gastos_total,
    utilidad: vehicle.ingresos_total - vehicle.gastos_total,
    km: vehicle.km_recorridos,
    viajes: vehicle.numero_viajes,
  }))

  const expenseBreakdown = [
    { name: "Combustible", value: 485000, color: "#ef4444" },
    { name: "Mantenimiento", value: 200000, color: "#f97316" },
    { name: "Otros Gastos", value: 315000, color: "#6366f1" },
  ]

  const totals = filteredData.reduce(
    (acc, vehicle) => ({
      numero_viajes: acc.numero_viajes + vehicle.numero_viajes,
      km_recorridos: acc.km_recorridos + vehicle.km_recorridos,
      ingresos_total: acc.ingresos_total + vehicle.ingresos_total,
      gastos_total: acc.gastos_total + vehicle.gastos_total,
      combustible_total: acc.combustible_total + vehicle.combustible_total,
      carga_transportada: acc.carga_transportada + vehicle.carga_transportada,
      total_mantenimientos: acc.total_mantenimientos + vehicle.total_mantenimientos,
      mantenimientos_preventivos: acc.mantenimientos_preventivos + vehicle.mantenimientos_preventivos,
      mantenimientos_correctivos: acc.mantenimientos_correctivos + vehicle.mantenimientos_correctivos,
    }),
    {
      numero_viajes: 0,
      km_recorridos: 0,
      ingresos_total: 0,
      gastos_total: 0,
      combustible_total: 0,
      carga_transportada: 0,
      total_mantenimientos: 0,
      mantenimientos_preventivos: 0,
      mantenimientos_correctivos: 0,
    },
  )

  const averageIndicators = {
    km_por_galon: filteredData.reduce((acc, v) => acc + v.km_por_galon, 0) / filteredData.length || 0,
    km_por_viaje: totals.km_recorridos / totals.numero_viajes || 0,
    km_por_mantenimiento: totals.km_recorridos / totals.total_mantenimientos || 0,
    carga_media_viaje: totals.carga_transportada / totals.numero_viajes || 0,
    ingreso_medio_viaje: totals.ingresos_total / totals.numero_viajes || 0,
    gasto_medio_viaje: totals.gastos_total / totals.numero_viajes || 0,
    ingresos_por_km: totals.ingresos_total / totals.km_recorridos || 0,
    gastos_por_km: totals.gastos_total / totals.km_recorridos || 0,
    utilidad_media_viaje: (totals.ingresos_total - totals.gastos_total) / totals.numero_viajes || 0,
    utilidad_media_km: (totals.ingresos_total - totals.gastos_total) / totals.km_recorridos || 0,
    margen_bruto_porcentaje: ((totals.ingresos_total - totals.gastos_total) / totals.ingresos_total) * 100 || 0,
  }

  const clearFilters = () => {
    setSelectedPlaca("")
    setSearchTerm("")
  }

  const hasActiveFilters = selectedPlaca || searchTerm

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <SiteHeader
        title="Indicadores por Vehículo"
        subtitle="Análisis de rendimiento y eficiencia vehicular"
        showBackLink={true}
      />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filters Section */}
        <Card className="mb-8 border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg dark:text-slate-100">Filtros de Reporte</CardTitle>
                  <CardDescription className="dark:text-slate-400">
                    Personaliza tu análisis de indicadores
                  </CardDescription>
                </div>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Placa del Vehículo</label>
                <Select value={selectedPlaca} onValueChange={setSelectedPlaca}>
                  <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800">
                    <SelectValue placeholder="Todos los vehículos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ABC-123">Todos los vehículos</SelectItem>
                    {vehiclePlates.map((placa) => (
                      <SelectItem key={placa} value={placa}>
                        {placa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Año</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Búsqueda</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por placa, número interno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 w-full text-center">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  {filteredData.length} vehículo(s) encontrado(s)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Viajes</p>
                  <p className="text-3xl font-bold">{totals.numero_viajes}</p>
                  <p className="text-blue-100 text-xs">viajes completados</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Km Recorridos</p>
                  <p className="text-3xl font-bold">{totals.km_recorridos.toLocaleString()}</p>
                  <p className="text-emerald-100 text-xs">kilómetros totales</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-violet-100 text-sm font-medium">Ingresos Totales</p>
                  <p className="text-3xl font-bold">${(totals.ingresos_total / 1000000).toFixed(1)}M</p>
                  <p className="text-violet-100 text-xs">millones de pesos</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Mantenimientos</p>
                  <p className="text-3xl font-bold">{totals.total_mantenimientos}</p>
                  <p className="text-amber-100 text-xs">servicios realizados</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Wrench className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-xl">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: "overview", name: "Resumen General", icon: BarChart3 },
                { id: "transport", name: "Indicadores de Transporte", icon: Gauge },
                { id: "financial", name: "Indicadores Financieros", icon: DollarSign },
                { id: "details", name: "Detalle por Vehículo", icon: Truck },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200"
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
          <div className="space-y-8">
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 dark:text-slate-100">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span>Ingresos vs Gastos</span>
                  </CardTitle>
                  <CardDescription className="dark:text-slate-400">Comparación financiera por vehículo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="gastos" fill="#ef4444" name="Gastos" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 dark:text-slate-100">
                    <PieChart className="h-5 w-5 text-violet-600" />
                    <span>Distribución de Gastos</span>
                  </CardTitle>
                  <CardDescription className="dark:text-slate-400">Breakdown de gastos por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Totales Table */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-slate-100">
                  <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <span>Totales Generales</span>
                </CardTitle>
                <CardDescription className="dark:text-slate-400">Resumen de totales por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      label: "Número de Viajes",
                      value: totals.numero_viajes,
                      unit: "viajes",
                      trend: "up",
                      color: "blue",
                    },
                    {
                      label: "Km Recorridos",
                      value: totals.km_recorridos.toLocaleString(),
                      unit: "km",
                      trend: "up",
                      color: "green",
                    },
                    {
                      label: "Ingresos",
                      value: `$${totals.ingresos_total.toLocaleString()}`,
                      unit: "pesos",
                      trend: "up",
                      color: "emerald",
                    },
                    {
                      label: "Gastos",
                      value: `$${totals.gastos_total.toLocaleString()}`,
                      unit: "pesos",
                      trend: "down",
                      color: "red",
                    },
                    {
                      label: "Combustible",
                      value: `$${totals.combustible_total.toLocaleString()}`,
                      unit: "pesos",
                      trend: "up",
                      color: "orange",
                    },
                    {
                      label: "Carga Transportada",
                      value: totals.carga_transportada.toLocaleString(),
                      unit: "kg",
                      trend: "up",
                      color: "purple",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                        {item.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{item.value}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.unit}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Other tab content would go here... */}
        {activeTab !== "overview" && (
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="text-slate-500 dark:text-slate-400">
                <Gauge className="h-12 w-12 mx-auto mb-4" />
                <p>Contenido de la pestaña "{activeTab}" en desarrollo...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
