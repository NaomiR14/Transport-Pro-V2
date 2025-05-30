"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

interface EditMultaModalProps {
  multa: MultaConductor
  onSave: (multa: MultaConductor) => void
  onClose: () => void
}

export default function EditMultaModal({ multa, onSave, onClose }: EditMultaModalProps) {
  const [formData, setFormData] = useState<MultaConductor>(multa)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData(multa)
  }, [multa])

  const handleInputChange = (field: keyof MultaConductor, value: string | number) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      }

      // Auto-calculate debe (balance) and payment status
      if (field === "importe_multa" || field === "importe_pagado") {
        newData.debe = Math.max(0, newData.importe_multa - newData.importe_pagado)

        // Auto-update payment status
        if (newData.importe_pagado >= newData.importe_multa) {
          newData.estado_pago = "pagado"
        } else if (newData.importe_pagado > 0) {
          newData.estado_pago = "parcial"
        } else {
          newData.estado_pago = "pendiente"
        }
      }

      return newData
    })

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fecha) {
      newErrors.fecha = "La fecha es requerida"
    }
    if (!formData.numero_viaje.trim()) {
      newErrors.numero_viaje = "El número de viaje es requerido"
    }
    if (!formData.placa_vehiculo.trim()) {
      newErrors.placa_vehiculo = "La placa del vehículo es requerida"
    }
    if (!formData.conductor.trim()) {
      newErrors.conductor = "El conductor es requerido"
    }
    if (!formData.infraccion.trim()) {
      newErrors.infraccion = "La infracción es requerida"
    }
    if (formData.importe_multa <= 0) {
      newErrors.importe_multa = "El importe de la multa debe ser mayor a 0"
    }
    if (formData.importe_pagado < 0) {
      newErrors.importe_pagado = "El importe pagado no puede ser negativo"
    }
    if (formData.importe_pagado > formData.importe_multa) {
      newErrors.importe_pagado = "El importe pagado no puede ser mayor al importe de la multa"
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

  const tiposInfraccion = [
    "Exceso de velocidad",
    "No respetar señalamiento",
    "Estacionamiento indebido",
    "Circular sin verificación",
    "Sobrepeso en báscula",
    "Documentos vencidos",
    "No portar licencia",
    "Circular en carril exclusivo",
    "No respetar semáforo",
    "Uso de celular al conducir",
    "No usar cinturón de seguridad",
    "Circular sin placas",
    "Obstruir la vía pública",
    "Conducir en estado de ebriedad",
    "Falta de documentos del vehículo",
    "Modificaciones no autorizadas",
    "Contaminar el medio ambiente",
    "Transportar carga peligrosa sin permiso",
  ]

  const estadosPago = [
    { value: "pagado", label: "Pagado" },
    { value: "pendiente", label: "Pendiente" },
    { value: "parcial", label: "Parcial" },
    { value: "vencido", label: "Vencido" },
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Multa de Conductor</DialogTitle>
          <DialogDescription>Modifica la información de la multa del conductor {formData.conductor}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Información General */}
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => handleInputChange("fecha", e.target.value)}
                className={errors.fecha ? "border-red-500" : ""}
              />
              {errors.fecha && <p className="text-sm text-red-500">{errors.fecha}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_viaje">Número de Viaje *</Label>
              <Input
                id="numero_viaje"
                value={formData.numero_viaje}
                onChange={(e) => handleInputChange("numero_viaje", e.target.value.toUpperCase())}
                className={errors.numero_viaje ? "border-red-500" : ""}
                placeholder="VIAJE-001"
              />
              {errors.numero_viaje && <p className="text-sm text-red-500">{errors.numero_viaje}</p>}
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

            <div className="space-y-2">
              <Label htmlFor="conductor">Conductor *</Label>
              <Input
                id="conductor"
                value={formData.conductor}
                onChange={(e) => handleInputChange("conductor", e.target.value)}
                className={errors.conductor ? "border-red-500" : ""}
              />
              {errors.conductor && <p className="text-sm text-red-500">{errors.conductor}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="infraccion">Infracción *</Label>
              <Select value={formData.infraccion} onValueChange={(value) => handleInputChange("infraccion", value)}>
                <SelectTrigger className={errors.infraccion ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar infracción" />
                </SelectTrigger>
                <SelectContent>
                  {tiposInfraccion.map((infraccion) => (
                    <SelectItem key={infraccion} value={infraccion}>
                      {infraccion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.infraccion && <p className="text-sm text-red-500">{errors.infraccion}</p>}
            </div>
          </div>

          {/* Información Financiera */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-4">Información Financiera</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="importe_multa">Importe Multa ($) *</Label>
                <Input
                  id="importe_multa"
                  type="number"
                  value={formData.importe_multa}
                  onChange={(e) => handleInputChange("importe_multa", Number.parseFloat(e.target.value) || 0)}
                  className={errors.importe_multa ? "border-red-500" : ""}
                  min="0"
                  step="0.01"
                />
                {errors.importe_multa && <p className="text-sm text-red-500">{errors.importe_multa}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="importe_pagado">Importe Pagado ($)</Label>
                <Input
                  id="importe_pagado"
                  type="number"
                  value={formData.importe_pagado}
                  onChange={(e) => handleInputChange("importe_pagado", Number.parseFloat(e.target.value) || 0)}
                  className={errors.importe_pagado ? "border-red-500" : ""}
                  min="0"
                  max={formData.importe_multa}
                  step="0.01"
                />
                {errors.importe_pagado && <p className="text-sm text-red-500">{errors.importe_pagado}</p>}
              </div>

              <div className="space-y-2">
                <Label>Debe ($)</Label>
                <Input
                  value={`$${formData.debe.toLocaleString()}`}
                  disabled
                  className={`bg-gray-100 font-semibold ${formData.debe > 0 ? "text-red-600" : "text-green-600"}`}
                />
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

            <div className="mt-4 p-3 bg-white rounded border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-800">Porcentaje Pagado:</span>
                  <span className="ml-2 font-semibold text-blue-600">
                    {formData.importe_multa > 0
                      ? ((formData.importe_pagado / formData.importe_multa) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-800">Estado:</span>
                  <span
                    className={`ml-2 font-semibold ${
                      formData.estado_pago === "pagado"
                        ? "text-green-600"
                        : formData.estado_pago === "vencido"
                          ? "text-red-600"
                          : formData.estado_pago === "parcial"
                            ? "text-blue-600"
                            : "text-yellow-600"
                    }`}
                  >
                    {formData.estado_pago === "pagado"
                      ? "Pagado"
                      : formData.estado_pago === "vencido"
                        ? "Vencido"
                        : formData.estado_pago === "parcial"
                          ? "Parcial"
                          : "Pendiente"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-800">Saldo Pendiente:</span>
                  <span className={`ml-2 font-semibold ${formData.debe > 0 ? "text-red-600" : "text-green-600"}`}>
                    ${formData.debe.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleInputChange("observaciones", e.target.value)}
              rows={3}
              placeholder="Comentarios adicionales sobre la multa..."
            />
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
