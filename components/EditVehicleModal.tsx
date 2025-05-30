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

interface Vehiculo {
  vehiculo_id: string
  numero_interno: string
  tipo: string
  marca: string
  modelo: string
  placa: string
  numero_serie: string
  color: string
  anio: number
  carga_maxima: number
  estado: "activo" | "inactivo" | "mantenimiento" | "baja"
  ciclo_mantenimiento_km: number
  odometro_inicial: number
  odometro_actual: number
  ultimo_mantenimiento_km: number
  proximo_mantenimiento_km: number
  estado_mantenimiento: "al_dia" | "proximo" | "vencido"
}

interface EditVehicleModalProps {
  vehiculo: Vehiculo
  onSave: (vehiculo: Vehiculo) => void
  onClose: () => void
}

export default function EditVehicleModal({ vehiculo, onSave, onClose }: EditVehicleModalProps) {
  const [formData, setFormData] = useState<Vehiculo>(vehiculo)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData(vehiculo)
  }, [vehiculo])

  const handleInputChange = (field: keyof Vehiculo, value: string | number) => {
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
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.numero_interno.trim()) {
      newErrors.numero_interno = "El número interno es requerido"
    }
    if (!formData.placa.trim()) {
      newErrors.placa = "La placa es requerida"
    }
    if (!formData.numero_serie.trim()) {
      newErrors.numero_serie = "El número de serie es requerido"
    }
    if (!formData.marca.trim()) {
      newErrors.marca = "La marca es requerida"
    }
    if (!formData.modelo.trim()) {
      newErrors.modelo = "El modelo es requerido"
    }
    if (formData.anio < 1900 || formData.anio > new Date().getFullYear() + 1) {
      newErrors.anio = "El año debe ser válido"
    }
    if (formData.carga_maxima <= 0) {
      newErrors.carga_maxima = "La carga máxima debe ser mayor a 0"
    }
    if (formData.ciclo_mantenimiento_km <= 0) {
      newErrors.ciclo_mantenimiento_km = "El ciclo de mantenimiento debe ser mayor a 0"
    }
    if (formData.odometro_actual < formData.odometro_inicial) {
      newErrors.odometro_actual = "El odómetro actual no puede ser menor al inicial"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Calculate next maintenance based on current odometer and cycle
      const nextMaintenance =
        Math.ceil(formData.odometro_actual / formData.ciclo_mantenimiento_km) * formData.ciclo_mantenimiento_km

      const updatedVehicle = {
        ...formData,
        proximo_mantenimiento_km: nextMaintenance,
      }

      onSave(updatedVehicle)
    }
  }

  const tiposVehiculo = ["Tractocamión", "Camión Rígido", "Furgoneta", "Camioneta", "Remolque"]

  const marcasVehiculo = [
    "Kenworth",
    "Freightliner",
    "Volvo",
    "Mercedes-Benz",
    "International",
    "Peterbilt",
    "Scania",
    "MAN",
  ]

  const estadosVehiculo = [
    { value: "activo", label: "Activo" },
    { value: "inactivo", label: "Inactivo" },
    { value: "mantenimiento", label: "En Mantenimiento" },
    { value: "baja", label: "Dado de Baja" },
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Vehículo</DialogTitle>
          <DialogDescription>Modifica la información del vehículo {formData.numero_interno}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Información Básica */}
            <div className="space-y-2">
              <Label htmlFor="numero_interno">Número Interno *</Label>
              <Input
                id="numero_interno"
                value={formData.numero_interno}
                onChange={(e) => handleInputChange("numero_interno", e.target.value)}
                className={errors.numero_interno ? "border-red-500" : ""}
              />
              {errors.numero_interno && <p className="text-sm text-red-500">{errors.numero_interno}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Vehículo</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposVehiculo.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Select value={formData.marca} onValueChange={(value) => handleInputChange("marca", value)}>
                <SelectTrigger className={errors.marca ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar marca" />
                </SelectTrigger>
                <SelectContent>
                  {marcasVehiculo.map((marca) => (
                    <SelectItem key={marca} value={marca}>
                      {marca}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.marca && <p className="text-sm text-red-500">{errors.marca}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => handleInputChange("modelo", e.target.value)}
                className={errors.modelo ? "border-red-500" : ""}
              />
              {errors.modelo && <p className="text-sm text-red-500">{errors.modelo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                value={formData.placa}
                onChange={(e) => handleInputChange("placa", e.target.value.toUpperCase())}
                className={errors.placa ? "border-red-500" : ""}
                placeholder="ABC-123"
              />
              {errors.placa && <p className="text-sm text-red-500">{errors.placa}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_serie">Número de Serie *</Label>
              <Input
                id="numero_serie"
                value={formData.numero_serie}
                onChange={(e) => handleInputChange("numero_serie", e.target.value.toUpperCase())}
                className={errors.numero_serie ? "border-red-500" : ""}
              />
              {errors.numero_serie && <p className="text-sm text-red-500">{errors.numero_serie}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" value={formData.color} onChange={(e) => handleInputChange("color", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anio">Año *</Label>
              <Input
                id="anio"
                type="number"
                value={formData.anio}
                onChange={(e) => handleInputChange("anio", Number.parseInt(e.target.value) || 0)}
                className={errors.anio ? "border-red-500" : ""}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
              {errors.anio && <p className="text-sm text-red-500">{errors.anio}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="carga_maxima">Carga Máxima (kg) *</Label>
              <Input
                id="carga_maxima"
                type="number"
                value={formData.carga_maxima}
                onChange={(e) => handleInputChange("carga_maxima", Number.parseInt(e.target.value) || 0)}
                className={errors.carga_maxima ? "border-red-500" : ""}
                min="0"
              />
              {errors.carga_maxima && <p className="text-sm text-red-500">{errors.carga_maxima}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado del Vehículo</Label>
              <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosVehiculo.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Información de Mantenimiento */}
            <div className="space-y-2">
              <Label htmlFor="ciclo_mantenimiento_km">Ciclo Mantenimiento (km) *</Label>
              <Input
                id="ciclo_mantenimiento_km"
                type="number"
                value={formData.ciclo_mantenimiento_km}
                onChange={(e) => handleInputChange("ciclo_mantenimiento_km", Number.parseInt(e.target.value) || 0)}
                className={errors.ciclo_mantenimiento_km ? "border-red-500" : ""}
                min="1000"
              />
              {errors.ciclo_mantenimiento_km && <p className="text-sm text-red-500">{errors.ciclo_mantenimiento_km}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="odometro_inicial">Odómetro Inicial (km)</Label>
              <Input
                id="odometro_inicial"
                type="number"
                value={formData.odometro_inicial}
                onChange={(e) => handleInputChange("odometro_inicial", Number.parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="odometro_actual">Odómetro Actual (km) *</Label>
              <Input
                id="odometro_actual"
                type="number"
                value={formData.odometro_actual}
                onChange={(e) => handleInputChange("odometro_actual", Number.parseInt(e.target.value) || 0)}
                className={errors.odometro_actual ? "border-red-500" : ""}
                min={formData.odometro_inicial}
              />
              {errors.odometro_actual && <p className="text-sm text-red-500">{errors.odometro_actual}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ultimo_mantenimiento_km">Último Mantenimiento (km)</Label>
              <Input
                id="ultimo_mantenimiento_km"
                type="number"
                value={formData.ultimo_mantenimiento_km}
                onChange={(e) => handleInputChange("ultimo_mantenimiento_km", Number.parseInt(e.target.value) || 0)}
                min="0"
              />
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
