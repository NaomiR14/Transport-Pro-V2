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

interface RutaViaje {
  ruta_id: string
  fecha_salida: string
  fecha_llegada: string
  placa_vehiculo: string
  estado_vehiculo: "activo" | "inactivo" | "mantenimiento"
  conductor: string
  origen: string
  destino: string
  kms_inicial: number
  kms_final: number
  kms_recorridos: number
  peso_carga_kg: number
  costo_por_kg: number
  ingreso_total: number
  estacion_combustible: string
  tipo_combustible: string
  precio_por_galon: number
  total_combustible: number
  gasto_peajes: number
  gasto_comidas: number
  otros_gastos: number
  gasto_total: number
  volumen_combustible_gal: number
  recorrido_por_galon: number
  ingreso_por_km: number
  observaciones: string
}

interface EditRutaModalProps {
  ruta: RutaViaje
  onSave: (ruta: RutaViaje) => void
  onClose: () => void
}

export default function EditRutaModal({ ruta, onSave, onClose }: EditRutaModalProps) {
  const [formData, setFormData] = useState<RutaViaje>(ruta)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData(ruta)
  }, [ruta])

  const handleInputChange = (field: keyof RutaViaje, value: string | number) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      }

      // Auto-calculate derived fields
      if (field === "kms_inicial" || field === "kms_final") {
        newData.kms_recorridos = Math.max(0, newData.kms_final - newData.kms_inicial)
      }

      if (field === "peso_carga_kg" || field === "costo_por_kg") {
        newData.ingreso_total = newData.peso_carga_kg * newData.costo_por_kg
      }

      if (field === "volumen_combustible_gal" || field === "precio_por_galon") {
        newData.total_combustible = newData.volumen_combustible_gal * newData.precio_por_galon
      }

      if (field === "kms_recorridos" || field === "volumen_combustible_gal") {
        newData.recorrido_por_galon =
          newData.volumen_combustible_gal > 0 ? newData.kms_recorridos / newData.volumen_combustible_gal : 0
      }

      if (field === "ingreso_total" || field === "kms_recorridos") {
        newData.ingreso_por_km = newData.kms_recorridos > 0 ? newData.ingreso_total / newData.kms_recorridos : 0
      }

      // Calculate total expenses
      newData.gasto_total =
        newData.total_combustible + newData.gasto_peajes + newData.gasto_comidas + newData.otros_gastos

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

    if (!formData.fecha_salida) {
      newErrors.fecha_salida = "La fecha de salida es requerida"
    }
    if (!formData.fecha_llegada) {
      newErrors.fecha_llegada = "La fecha de llegada es requerida"
    }
    if (
      formData.fecha_salida &&
      formData.fecha_llegada &&
      new Date(formData.fecha_llegada) < new Date(formData.fecha_salida)
    ) {
      newErrors.fecha_llegada = "La fecha de llegada debe ser posterior a la fecha de salida"
    }
    if (!formData.placa_vehiculo.trim()) {
      newErrors.placa_vehiculo = "La placa del vehículo es requerida"
    }
    if (!formData.conductor.trim()) {
      newErrors.conductor = "El conductor es requerido"
    }
    if (!formData.origen.trim()) {
      newErrors.origen = "El origen es requerido"
    }
    if (!formData.destino.trim()) {
      newErrors.destino = "El destino es requerido"
    }
    if (formData.kms_final <= formData.kms_inicial) {
      newErrors.kms_final = "Los kilómetros finales deben ser mayores a los iniciales"
    }
    if (formData.peso_carga_kg <= 0) {
      newErrors.peso_carga_kg = "El peso de carga debe ser mayor a 0"
    }
    if (formData.costo_por_kg <= 0) {
      newErrors.costo_por_kg = "El costo por kg debe ser mayor a 0"
    }
    if (!formData.estacion_combustible.trim()) {
      newErrors.estacion_combustible = "La estación de combustible es requerida"
    }
    if (formData.precio_por_galon <= 0) {
      newErrors.precio_por_galon = "El precio por galón debe ser mayor a 0"
    }
    if (formData.volumen_combustible_gal <= 0) {
      newErrors.volumen_combustible_gal = "El volumen de combustible debe ser mayor a 0"
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

  const estadosVehiculo = [
    { value: "activo", label: "Activo" },
    { value: "inactivo", label: "Inactivo" },
    { value: "mantenimiento", label: "En Mantenimiento" },
  ]

  const tiposCombustible = ["Diesel", "Gasolina Magna", "Gasolina Premium", "Gas Natural"]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Ruta de Viaje</DialogTitle>
          <DialogDescription>
            Modifica la información de la ruta {formData.origen} → {formData.destino}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_salida">Fecha de Salida *</Label>
              <Input
                id="fecha_salida"
                type="date"
                value={formData.fecha_salida}
                onChange={(e) => handleInputChange("fecha_salida", e.target.value)}
                className={errors.fecha_salida ? "border-red-500" : ""}
              />
              {errors.fecha_salida && <p className="text-sm text-red-500">{errors.fecha_salida}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_llegada">Fecha de Llegada *</Label>
              <Input
                id="fecha_llegada"
                type="date"
                value={formData.fecha_llegada}
                onChange={(e) => handleInputChange("fecha_llegada", e.target.value)}
                className={errors.fecha_llegada ? "border-red-500" : ""}
              />
              {errors.fecha_llegada && <p className="text-sm text-red-500">{errors.fecha_llegada}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="placa_vehiculo">Placa Vehículo *</Label>
              <Input
                id="placa_vehiculo"
                value={formData.placa_vehiculo}
                onChange={(e) => handleInputChange("placa_vehiculo", e.target.value.toUpperCase())}
                className={errors.placa_vehiculo ? "border-red-500" : ""}
              />
              {errors.placa_vehiculo && <p className="text-sm text-red-500">{errors.placa_vehiculo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado_vehiculo">Estado Vehículo</Label>
              <Select
                value={formData.estado_vehiculo}
                onValueChange={(value) => handleInputChange("estado_vehiculo", value)}
              >
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

            <div className="space-y-2">
              <Label htmlFor="origen">Origen *</Label>
              <Input
                id="origen"
                value={formData.origen}
                onChange={(e) => handleInputChange("origen", e.target.value)}
                className={errors.origen ? "border-red-500" : ""}
              />
              {errors.origen && <p className="text-sm text-red-500">{errors.origen}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="destino">Destino *</Label>
              <Input
                id="destino"
                value={formData.destino}
                onChange={(e) => handleInputChange("destino", e.target.value)}
                className={errors.destino ? "border-red-500" : ""}
              />
              {errors.destino && <p className="text-sm text-red-500">{errors.destino}</p>}
            </div>
          </div>

          {/* Información de Kilometraje */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-4">Información de Kilometraje</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kms_inicial">Kms Inicial (Odómetro) *</Label>
                <Input
                  id="kms_inicial"
                  type="number"
                  value={formData.kms_inicial}
                  onChange={(e) => handleInputChange("kms_inicial", Number.parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kms_final">Kms Final (Odómetro) *</Label>
                <Input
                  id="kms_final"
                  type="number"
                  value={formData.kms_final}
                  onChange={(e) => handleInputChange("kms_final", Number.parseInt(e.target.value) || 0)}
                  className={errors.kms_final ? "border-red-500" : ""}
                  min={formData.kms_inicial}
                />
                {errors.kms_final && <p className="text-sm text-red-500">{errors.kms_final}</p>}
              </div>

              <div className="space-y-2">
                <Label>Kms Recorridos</Label>
                <Input value={formData.kms_recorridos.toLocaleString()} disabled className="bg-gray-100" />
              </div>
            </div>
          </div>

          {/* Información de Carga e Ingresos */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-4">Información de Carga e Ingresos</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="peso_carga_kg">Peso de Carga (Kg) *</Label>
                <Input
                  id="peso_carga_kg"
                  type="number"
                  value={formData.peso_carga_kg}
                  onChange={(e) => handleInputChange("peso_carga_kg", Number.parseFloat(e.target.value) || 0)}
                  className={errors.peso_carga_kg ? "border-red-500" : ""}
                  min="0"
                  step="0.01"
                />
                {errors.peso_carga_kg && <p className="text-sm text-red-500">{errors.peso_carga_kg}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="costo_por_kg">Costo por Kg ($/Kg) *</Label>
                <Input
                  id="costo_por_kg"
                  type="number"
                  value={formData.costo_por_kg}
                  onChange={(e) => handleInputChange("costo_por_kg", Number.parseFloat(e.target.value) || 0)}
                  className={errors.costo_por_kg ? "border-red-500" : ""}
                  min="0"
                  step="0.01"
                />
                {errors.costo_por_kg && <p className="text-sm text-red-500">{errors.costo_por_kg}</p>}
              </div>

              <div className="space-y-2">
                <Label>Ingreso Total ($)</Label>
                <Input
                  value={`$${formData.ingreso_total.toLocaleString()}`}
                  disabled
                  className="bg-gray-100 font-semibold text-green-600"
                />
              </div>

              <div className="space-y-2">
                <Label>Ingreso por Km ($/Km)</Label>
                <Input value={`$${formData.ingreso_por_km.toFixed(2)}`} disabled className="bg-gray-100" />
              </div>
            </div>
          </div>

          {/* Información de Combustible */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-4">Información de Combustible</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estacion_combustible">Estación de Combustible *</Label>
                <Input
                  id="estacion_combustible"
                  value={formData.estacion_combustible}
                  onChange={(e) => handleInputChange("estacion_combustible", e.target.value)}
                  className={errors.estacion_combustible ? "border-red-500" : ""}
                />
                {errors.estacion_combustible && <p className="text-sm text-red-500">{errors.estacion_combustible}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_combustible">Tipo de Combustible</Label>
                <Select
                  value={formData.tipo_combustible}
                  onValueChange={(value) => handleInputChange("tipo_combustible", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposCombustible.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="volumen_combustible_gal">Volumen Combustible (gal) *</Label>
                <Input
                  id="volumen_combustible_gal"
                  type="number"
                  value={formData.volumen_combustible_gal}
                  onChange={(e) => handleInputChange("volumen_combustible_gal", Number.parseFloat(e.target.value) || 0)}
                  className={errors.volumen_combustible_gal ? "border-red-500" : ""}
                  min="0"
                  step="0.01"
                />
                {errors.volumen_combustible_gal && (
                  <p className="text-sm text-red-500">{errors.volumen_combustible_gal}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio_por_galon">Precio x Galón ($/gal) *</Label>
                <Input
                  id="precio_por_galon"
                  type="number"
                  value={formData.precio_por_galon}
                  onChange={(e) => handleInputChange("precio_por_galon", Number.parseFloat(e.target.value) || 0)}
                  className={errors.precio_por_galon ? "border-red-500" : ""}
                  min="0"
                  step="0.01"
                />
                {errors.precio_por_galon && <p className="text-sm text-red-500">{errors.precio_por_galon}</p>}
              </div>

              <div className="space-y-2">
                <Label>Total Combustible ($)</Label>
                <Input
                  value={`$${formData.total_combustible.toLocaleString()}`}
                  disabled
                  className="bg-gray-100 font-semibold text-red-600"
                />
              </div>

              <div className="space-y-2">
                <Label>Recorrido por Galón (Km/gal)</Label>
                <Input value={`${formData.recorrido_por_galon.toFixed(2)} km/gal`} disabled className="bg-gray-100" />
              </div>
            </div>
          </div>

          {/* Información de Gastos */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-4">Información de Gastos</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gasto_peajes">Gasto Peajes ($)</Label>
                <Input
                  id="gasto_peajes"
                  type="number"
                  value={formData.gasto_peajes}
                  onChange={(e) => handleInputChange("gasto_peajes", Number.parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gasto_comidas">Gasto Comidas ($)</Label>
                <Input
                  id="gasto_comidas"
                  type="number"
                  value={formData.gasto_comidas}
                  onChange={(e) => handleInputChange("gasto_comidas", Number.parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otros_gastos">Otros Gastos ($)</Label>
                <Input
                  id="otros_gastos"
                  type="number"
                  value={formData.otros_gastos}
                  onChange={(e) => handleInputChange("otros_gastos", Number.parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label>Gasto Total ($)</Label>
                <Input
                  value={`$${formData.gasto_total.toLocaleString()}`}
                  disabled
                  className="bg-gray-100 font-semibold text-red-600"
                />
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
              placeholder="Comentarios adicionales sobre el viaje..."
            />
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Resumen Financiero</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-800">Ingresos:</span>
                <span className="ml-2 font-semibold text-green-600">${formData.ingreso_total.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Gastos:</span>
                <span className="ml-2 font-semibold text-red-600">${formData.gasto_total.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Utilidad:</span>
                <span
                  className={`ml-2 font-semibold ${(formData.ingreso_total - formData.gasto_total) >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ${(formData.ingreso_total - formData.gasto_total).toLocaleString()}
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
