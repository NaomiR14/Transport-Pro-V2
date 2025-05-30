"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

interface EditImpuestoModalProps {
  impuesto: ImpuestoVehiculo
  onSave: (impuesto: ImpuestoVehiculo) => void
  onClose: () => void
}

export default function EditImpuestoModal({ impuesto, onSave, onClose }: EditImpuestoModalProps) {
  const [formData, setFormData] = useState<ImpuestoVehiculo>(impuesto)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData(impuesto)
  }, [impuesto])

  const handleInputChange = (field: keyof ImpuestoVehiculo, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }

    // Auto-update payment status based on payment date
    if (field === "fecha_pago") {
      const nuevoEstado = value ? "pagado" : "pendiente"
      setFormData((prev) => ({
        ...prev,
        estado_pago: nuevoEstado,
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.numero_vehiculo.trim()) {
      newErrors.numero_vehiculo = "El número de vehículo es requerido"
    }
    if (!formData.placa_vehiculo.trim()) {
      newErrors.placa_vehiculo = "La placa del vehículo es requerida"
    }
    if (!formData.tipo_impuesto.trim()) {
      newErrors.tipo_impuesto = "El tipo de impuesto es requerido"
    }
    if (formData.anio_impuesto < 2000 || formData.anio_impuesto > new Date().getFullYear() + 1) {
      newErrors.anio_impuesto = "El año debe ser válido"
    }
    if (formData.impuesto_monto <= 0) {
      newErrors.impuesto_monto = "El monto del impuesto debe ser mayor a 0"
    }
    if (formData.estado_pago === "pagado" && !formData.fecha_pago) {
      newErrors.fecha_pago = "La fecha de pago es requerida para impuestos pagados"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSave(formData)
    }
  }

  const tiposImpuesto = [
    "Tenencia",
    "Refrendo",
    "Verificación",
    "Placas",
    "Licencia de Funcionamiento",
    "Impuesto Predial Vehicular",
    "Derechos de Circulación",
    "Multas y Recargos",
  ]

  const estadosPago = [
    { value: "pagado", label: "Pagado" },
    { value: "pendiente", label: "Pendiente" },
    { value: "vencido", label: "Vencido" },
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i + 1)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Impuesto de Vehículo</DialogTitle>
          <DialogDescription>
            Modifica la información del impuesto para el vehículo {formData.numero_vehiculo}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Información del Vehículo */}
            <div className="space-y-2">
              <Label htmlFor="numero_vehiculo">Número de Vehículo *</Label>
              <Input
                id="numero_vehiculo"
                value={formData.numero_vehiculo}
                onChange={(e) => handleInputChange("numero_vehiculo", e.target.value)}
                className={errors.numero_vehiculo ? "border-red-500" : ""}
              />
              {errors.numero_vehiculo && <p className="text-sm text-red-500">{errors.numero_vehiculo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="placa_vehiculo">Placa Vehículo *</Label>
              <Input
                id="placa_vehiculo"
                value={formData.placa_vehiculo}
                onChange={(e) => handleInputChange("placa_vehiculo", e.target.value.toUpperCase())}
                className={errors.placa_vehiculo ? "border-red-500" : ""}
                placeholder="ABC-123"
              />
              {errors.placa_vehiculo && <p className="text-sm text-red-500">{errors.placa_vehiculo}</p>}
            </div>

            {/* Información del Impuesto */}
            <div className="space-y-2">
              <Label htmlFor="tipo_impuesto">Tipo Impuesto *</Label>
              <Select
                value={formData.tipo_impuesto}
                onValueChange={(value) => handleInputChange("tipo_impuesto", value)}
              >
                <SelectTrigger className={errors.tipo_impuesto ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar tipo de impuesto" />
                </SelectTrigger>
                <SelectContent>
                  {tiposImpuesto.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo_impuesto && <p className="text-sm text-red-500">{errors.tipo_impuesto}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="anio_impuesto">Año Impuesto *</Label>
              <Select
                value={formData.anio_impuesto.toString()}
                onValueChange={(value) => handleInputChange("anio_impuesto", Number.parseInt(value))}
              >
                <SelectTrigger className={errors.anio_impuesto ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.anio_impuesto && <p className="text-sm text-red-500">{errors.anio_impuesto}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="impuesto_monto">Impuesto ($) *</Label>
              <Input
                id="impuesto_monto"
                type="number"
                value={formData.impuesto_monto}
                onChange={(e) => handleInputChange("impuesto_monto", Number.parseFloat(e.target.value) || 0)}
                className={errors.impuesto_monto ? "border-red-500" : ""}
                min="0"
                step="0.01"
              />
              {errors.impuesto_monto && <p className="text-sm text-red-500">{errors.impuesto_monto}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_pago">Fecha de Pago</Label>
              <Input
                id="fecha_pago"
                type="date"
                value={formData.fecha_pago}
                onChange={(e) => handleInputChange("fecha_pago", e.target.value)}
                className={errors.fecha_pago ? "border-red-500" : ""}
              />
              {errors.fecha_pago && <p className="text-sm text-red-500">{errors.fecha_pago}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado_pago">Estado de Pago</Label>
              <Select value={formData.estado_pago} onValueChange={(value) => handleInputChange("estado_pago", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosPago.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Información Adicional</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Total a Pagar:</span>
                <span className="ml-2 text-blue-900 font-semibold">${formData.impuesto_monto.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Estado:</span>
                <span
                  className={`ml-2 font-semibold ${
                    formData.estado_pago === "pagado"
                      ? "text-green-600"
                      : formData.estado_pago === "vencido"
                        ? "text-red-600"
                        : "text-yellow-600"
                  }`}
                >
                  {formData.estado_pago === "pagado"
                    ? "Pagado"
                    : formData.estado_pago === "vencido"
                      ? "Vencido"
                      : "Pendiente"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
