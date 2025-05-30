"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, DollarSign, Settings, Wrench } from "lucide-react"

interface MantenimientoVehiculo {
  id?: number
  placaVehiculo: string
  taller: string
  fechaEntrada: string
  fechaSalida: string | null
  tipo: string
  kilometraje: number
  paqueteMantenimiento: string
  causas: string
  costoTotal: number
  fechaPago: string | null
  observaciones: string
  estado: string
}

interface EditMantenimientoVehiculoModalProps {
  mantenimiento: MantenimientoVehiculo | null
  isOpen: boolean
  onClose: () => void
}

export function EditMantenimientoVehiculoModal({
  mantenimiento,
  isOpen,
  onClose,
}: EditMantenimientoVehiculoModalProps) {
  const [formData, setFormData] = useState<MantenimientoVehiculo>({
    placaVehiculo: "",
    taller: "",
    fechaEntrada: "",
    fechaSalida: null,
    tipo: "",
    kilometraje: 0,
    paqueteMantenimiento: "",
    causas: "",
    costoTotal: 0,
    fechaPago: null,
    observaciones: "",
    estado: "En Proceso",
  })

  useEffect(() => {
    if (mantenimiento) {
      setFormData(mantenimiento)
    } else {
      setFormData({
        placaVehiculo: "",
        taller: "",
        fechaEntrada: new Date().toISOString().split("T")[0],
        fechaSalida: null,
        tipo: "",
        kilometraje: 0,
        paqueteMantenimiento: "",
        causas: "",
        costoTotal: 0,
        fechaPago: null,
        observaciones: "",
        estado: "En Proceso",
      })
    }
  }, [mantenimiento])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Datos del mantenimiento:", formData)
    onClose()
  }

  const getEstadoBadge = (estado: string) => {
    const variants = {
      Completado: "bg-green-100 text-green-800",
      "En Proceso": "bg-blue-100 text-blue-800",
      "Pendiente Pago": "bg-yellow-100 text-yellow-800",
    }
    return variants[estado] || "bg-gray-100 text-gray-800"
  }

  const vehiculosDisponibles = ["ABC-123", "DEF-456", "GHI-789", "JKL-012", "MNO-345"]
  const talleresDisponibles = ["Taller Central", "AutoServicio Norte", "Mecánica Express", "Taller Sur"]
  const paquetesMantenimiento = [
    "Mantenimiento 15K",
    "Mantenimiento 30K",
    "Mantenimiento 45K",
    "Mantenimiento 60K",
    "Reparación Motor",
    "Reparación Frenos",
    "Reparación Transmisión",
    "Reparación Suspensión",
    "Cambio de Aceite",
    "Revisión General",
    "Reparación Eléctrica",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {mantenimiento ? "Editar Mantenimiento" : "Nuevo Mantenimiento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Información General
              </CardTitle>
              <CardDescription>Datos básicos del mantenimiento del vehículo</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placaVehiculo">Placa del Vehículo</Label>
                <Select
                  value={formData.placaVehiculo}
                  onValueChange={(value) => handleInputChange("placaVehiculo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiculosDisponibles.map((placa) => (
                      <SelectItem key={placa} value={placa}>
                        {placa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taller">Taller</Label>
                <Select value={formData.taller} onValueChange={(value) => handleInputChange("taller", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar taller" />
                  </SelectTrigger>
                  <SelectContent>
                    {talleresDisponibles.map((taller) => (
                      <SelectItem key={taller} value={taller}>
                        {taller}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaEntrada">Fecha de Entrada</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="fechaEntrada"
                    type="date"
                    value={formData.fechaEntrada}
                    onChange={(e) => handleInputChange("fechaEntrada", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaSalida">Fecha de Salida</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="fechaSalida"
                    type="date"
                    value={formData.fechaSalida || ""}
                    onChange={(e) => handleInputChange("fechaSalida", e.target.value || null)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Mantenimiento</Label>
                <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventivo">Preventivo</SelectItem>
                    <SelectItem value="Correctivo">Correctivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kilometraje">Kilometraje del Odómetro</Label>
                <Input
                  id="kilometraje"
                  type="number"
                  value={formData.kilometraje}
                  onChange={(e) => handleInputChange("kilometraje", Number.parseInt(e.target.value) || 0)}
                  placeholder="Ej: 45000"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Detalles del Mantenimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Detalles del Mantenimiento
              </CardTitle>
              <CardDescription>Información específica sobre el trabajo realizado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paqueteMantenimiento">Paquete de Mantenimiento</Label>
                <Select
                  value={formData.paqueteMantenimiento}
                  onValueChange={(value) => handleInputChange("paqueteMantenimiento", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar paquete" />
                  </SelectTrigger>
                  <SelectContent>
                    {paquetesMantenimiento.map((paquete) => (
                      <SelectItem key={paquete} value={paquete}>
                        {paquete}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="causas">Causas del Mantenimiento</Label>
                <Textarea
                  id="causas"
                  value={formData.causas}
                  onChange={(e) => handleInputChange("causas", e.target.value)}
                  placeholder="Describir las causas que motivaron el mantenimiento..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange("observaciones", e.target.value)}
                  placeholder="Observaciones adicionales sobre el mantenimiento..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Información Financiera */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Información Financiera
              </CardTitle>
              <CardDescription>Costos y estado de pago del mantenimiento</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costoTotal">Costo Total ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="costoTotal"
                    type="number"
                    step="0.01"
                    value={formData.costoTotal}
                    onChange={(e) => handleInputChange("costoTotal", Number.parseFloat(e.target.value) || 0)}
                    className="pl-10"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaPago">Fecha de Pago</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="fechaPago"
                    type="date"
                    value={formData.fechaPago || ""}
                    onChange={(e) => handleInputChange("fechaPago", e.target.value || null)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado del Mantenimiento</Label>
                <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En Proceso">En Proceso</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="Pendiente Pago">Pendiente Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estado Actual</Label>
                <div className="pt-2">
                  <Badge className={getEstadoBadge(formData.estado)}>{formData.estado}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{mantenimiento ? "Actualizar" : "Crear"} Mantenimiento</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
