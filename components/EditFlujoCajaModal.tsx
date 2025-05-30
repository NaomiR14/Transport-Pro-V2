"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Calculator } from "lucide-react"

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

export function EditFlujoCajaModal({ isOpen, onClose, record }) {
  const [formData, setFormData] = useState({
    año: new Date().getFullYear(),
    mes: "",
    ingresos: 0,
    personal: 0,
    seguros: 0,
    impuestos: 0,
    multas: 0,
    mantenimiento: 0,
    combustible: 0,
    peaje: 0,
    comidas: 0,
    otros_egresos: 0,
  })

  useEffect(() => {
    if (record) {
      setFormData({
        año: record.año,
        mes: record.mes,
        ingresos: record.ingresos,
        personal: record.personal,
        seguros: record.seguros,
        impuestos: record.impuestos,
        multas: record.multas,
        mantenimiento: record.mantenimiento,
        combustible: record.combustible,
        peaje: record.peaje,
        comidas: record.comidas,
        otros_egresos: record.otros_egresos,
      })
    } else {
      setFormData({
        año: new Date().getFullYear(),
        mes: "",
        ingresos: 0,
        personal: 0,
        seguros: 0,
        impuestos: 0,
        multas: 0,
        mantenimiento: 0,
        combustible: 0,
        peaje: 0,
        comidas: 0,
        otros_egresos: 0,
      })
    }
  }, [record])

  // Calculations
  const totalEgresos =
    formData.personal +
    formData.seguros +
    formData.impuestos +
    formData.multas +
    formData.mantenimiento +
    formData.combustible +
    formData.peaje +
    formData.comidas +
    formData.otros_egresos

  const utilidad = formData.ingresos - totalEgresos
  const margen = formData.ingresos > 0 ? (utilidad / formData.ingresos) * 100 : 0

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "año" || field === "mes" ? value : Number.parseFloat(value) || 0,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log("Saving cash flow record:", {
      ...formData,
      egresos: totalEgresos,
      utilidad,
      margen,
    })
    onClose()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            {record ? "Editar Registro de Flujo de Caja" : "Nuevo Registro de Flujo de Caja"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Period Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Período</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="año">Año</Label>
                <Input
                  id="año"
                  type="number"
                  value={formData.año}
                  onChange={(e) => handleInputChange("año", e.target.value)}
                  min="2020"
                  max="2030"
                  required
                />
              </div>
              <div>
                <Label htmlFor="mes">Mes</Label>
                <Select value={formData.mes} onValueChange={(value) => handleInputChange("mes", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((mes) => (
                      <SelectItem key={mes} value={mes}>
                        {mes}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Income Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Ingresos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="ingresos">Ingresos Totales</Label>
                <Input
                  id="ingresos"
                  type="number"
                  value={formData.ingresos}
                  onChange={(e) => handleInputChange("ingresos", e.target.value)}
                  min="0"
                  step="1000"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Expenses Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                Egresos
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="personal">Personal</Label>
                <Input
                  id="personal"
                  type="number"
                  value={formData.personal}
                  onChange={(e) => handleInputChange("personal", e.target.value)}
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <Label htmlFor="seguros">Seguros</Label>
                <Input
                  id="seguros"
                  type="number"
                  value={formData.seguros}
                  onChange={(e) => handleInputChange("seguros", e.target.value)}
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <Label htmlFor="impuestos">Impuestos</Label>
                <Input
                  id="impuestos"
                  type="number"
                  value={formData.impuestos}
                  onChange={(e) => handleInputChange("impuestos", e.target.value)}
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <Label htmlFor="multas">Multas</Label>
                <Input
                  id="multas"
                  type="number"
                  value={formData.multas}
                  onChange={(e) => handleInputChange("multas", e.target.value)}
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <Label htmlFor="mantenimiento">Mantenimiento</Label>
                <Input
                  id="mantenimiento"
                  type="number"
                  value={formData.mantenimiento}
                  onChange={(e) => handleInputChange("mantenimiento", e.target.value)}
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <Label htmlFor="combustible">Combustible</Label>
                <Input
                  id="combustible"
                  type="number"
                  value={formData.combustible}
                  onChange={(e) => handleInputChange("combustible", e.target.value)}
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <Label htmlFor="peaje">Peaje</Label>
                <Input
                  id="peaje"
                  type="number"
                  value={formData.peaje}
                  onChange={(e) => handleInputChange("peaje", e.target.value)}
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <Label htmlFor="comidas">Comidas</Label>
                <Input
                  id="comidas"
                  type="number"
                  value={formData.comidas}
                  onChange={(e) => handleInputChange("comidas", e.target.value)}
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <Label htmlFor="otros_egresos">Otros Egresos</Label>
                <Input
                  id="otros_egresos"
                  type="number"
                  value={formData.otros_egresos}
                  onChange={(e) => handleInputChange("otros_egresos", e.target.value)}
                  min="0"
                  step="1000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                Resumen Financiero
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Ingresos Totales</div>
                  <div className="text-xl font-bold text-green-600">{formatCurrency(formData.ingresos)}</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Egresos Totales</div>
                  <div className="text-xl font-bold text-red-600">{formatCurrency(totalEgresos)}</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Utilidad</div>
                  <div className={`text-xl font-bold ${utilidad >= 0 ? "text-blue-600" : "text-red-600"}`}>
                    {formatCurrency(utilidad)}
                  </div>
                  <Badge
                    variant={margen >= 20 ? "default" : margen >= 10 ? "secondary" : "destructive"}
                    className="mt-2"
                  >
                    Margen: {margen.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              {record ? "Actualizar" : "Guardar"} Registro
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
