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

interface EditSeguroModalProps {
  seguro: SeguroVehiculo
  onSave: (seguro: SeguroVehiculo) => void
  onClose: () => void
}

export default function EditSeguroModal({ seguro, onSave, onClose }: EditSeguroModalProps) {
  const [formData, setFormData] = useState<SeguroVehiculo>(seguro)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData(seguro)
  }, [seguro])

  const handleInputChange = (field: keyof SeguroVehiculo, value: string | number) => {
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

    // Auto-calculate estado_poliza based on dates
    if (field === "fecha_vencimiento" || field === "fecha_inicio") {
      const fechaVencimiento =
        field === "fecha_vencimiento" ? new Date(value as string) : new Date(formData.fecha_vencimiento)
      const hoy = new Date()
      const diasRestantes = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24))

      let nuevoEstado: "vigente" | "vencida" | "por_vencer" | "cancelada"
      if (diasRestantes < 0) {
        nuevoEstado = "vencida"
      } else if (diasRestantes <= 30) {
        nuevoEstado = "por_vencer"
      } else {
        nuevoEstado = "vigente"
      }

      setFormData((prev) => ({
        ...prev,
        estado_poliza: nuevoEstado,
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
    if (!formData.aseguradora.trim()) {
      newErrors.aseguradora = "La aseguradora es requerida"
    }
    if (!formData.poliza_seguro.trim()) {
      newErrors.poliza_seguro = "El número de póliza es requerido"
    }
    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = "La fecha de inicio es requerida"
    }
    if (!formData.fecha_vencimiento) {
      newErrors.fecha_vencimiento = "La fecha de vencimiento es requerida"
    }
    if (formData.fecha_inicio && formData.fecha_vencimiento) {
      if (new Date(formData.fecha_vencimiento) <= new Date(formData.fecha_inicio)) {
        newErrors.fecha_vencimiento = "La fecha de vencimiento debe ser posterior a la fecha de inicio"
      }
    }
    if (formData.importe_pagado <= 0) {
      newErrors.importe_pagado = "El importe pagado debe ser mayor a 0"
    }
    if (!formData.fecha_pago) {
      newErrors.fecha_pago = "La fecha de pago es requerida"
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

  const aseguradoras = [
    "Seguros Monterrey",
    "AXA Seguros",
    "Qualitas Seguros",
    "HDI Seguros",
    "GNP Seguros",
    "Mapfre Seguros",
    "Zurich Seguros",
    "Banorte Seguros",
    "BBVA Seguros",
    "Inbursa Seguros",
  ]

  const estadosPoliza = [
    { value: "vigente", label: "Vigente" },
    { value: "vencida", label: "Vencida" },
    { value: "por_vencer", label: "Por Vencer" },
    { value: "cancelada", label: "Cancelada" },
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Seguro de Vehículo</DialogTitle>
          <DialogDescription>
            Modifica la información del seguro para el vehículo {formData.numero_vehiculo}
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

            {/* Información del Seguro */}
            <div className="space-y-2">
              <Label htmlFor="aseguradora">Aseguradora *</Label>
              <Select value={formData.aseguradora} onValueChange={(value) => handleInputChange("aseguradora", value)}>
                <SelectTrigger className={errors.aseguradora ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar aseguradora" />
                </SelectTrigger>
                <SelectContent>
                  {aseguradoras.map((aseguradora) => (
                    <SelectItem key={aseguradora} value={aseguradora}>
                      {aseguradora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.aseguradora && <p className="text-sm text-red-500">{errors.aseguradora}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="poliza_seguro">Póliza Seguro *</Label>
              <Input
                id="poliza_seguro"
                value={formData.poliza_seguro}
                onChange={(e) => handleInputChange("poliza_seguro", e.target.value.toUpperCase())}
                className={errors.poliza_seguro ? "border-red-500" : ""}
                placeholder="POL-2024-001"
              />
              {errors.poliza_seguro && <p className="text-sm text-red-500">{errors.poliza_seguro}</p>}
            </div>

            {/* Fechas */}
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => handleInputChange("fecha_inicio", e.target.value)}
                className={errors.fecha_inicio ? "border-red-500" : ""}
              />
              {errors.fecha_inicio && <p className="text-sm text-red-500">{errors.fecha_inicio}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento *</Label>
              <Input
                id="fecha_vencimiento"
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => handleInputChange("fecha_vencimiento", e.target.value)}
                className={errors.fecha_vencimiento ? "border-red-500" : ""}
              />
              {errors.fecha_vencimiento && <p className="text-sm text-red-500">{errors.fecha_vencimiento}</p>}
            </div>

            {/* Información Financiera */}
            <div className="space-y-2">
              <Label htmlFor="importe_pagado">Importe Pagado ($) *</Label>
              <Input
                id="importe_pagado"
                type="number"
                value={formData.importe_pagado}
                onChange={(e) => handleInputChange("importe_pagado", Number.parseFloat(e.target.value) || 0)}
                className={errors.importe_pagado ? "border-red-500" : ""}
                min="0"
                step="0.01"
              />
              {errors.importe_pagado && <p className="text-sm text-red-500">{errors.importe_pagado}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_pago">Fecha de Pago *</Label>
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
              <Label htmlFor="estado_poliza">Estado Póliza</Label>
              <Select
                value={formData.estado_poliza}
                onValueChange={(value) => handleInputChange("estado_poliza", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosPoliza.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
