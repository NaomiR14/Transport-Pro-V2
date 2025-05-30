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
import { Star } from "lucide-react"

interface Conductor {
  conductor_id: string
  numero_conductor: string
  documento_identidad: string
  nombre_conductor: string
  numero_licencia: string
  direccion: string
  telefono: string
  calificacion: number
  email: string
  activo: boolean
  fecha_vencimiento_licencia: string
  tipo_licencia: string
  estado_licencia: "vigente" | "por_vencer" | "vencida"
}

interface EditConductorModalProps {
  conductor: Conductor
  onSave: (conductor: Conductor) => void
  onClose: () => void
}

export default function EditConductorModal({ conductor, onSave, onClose }: EditConductorModalProps) {
  const [formData, setFormData] = useState<Conductor>(conductor)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData(conductor)
  }, [conductor])

  const handleInputChange = (field: keyof Conductor, value: string | number | boolean) => {
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

    // Auto-calculate license status based on expiration date
    if (field === "fecha_vencimiento_licencia") {
      const fechaVencimiento = new Date(value as string)
      const hoy = new Date()
      const diasRestantes = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24))

      let nuevoEstado: "vigente" | "por_vencer" | "vencida"
      if (diasRestantes < 0) {
        nuevoEstado = "vencida"
      } else if (diasRestantes <= 30) {
        nuevoEstado = "por_vencer"
      } else {
        nuevoEstado = "vigente"
      }

      setFormData((prev) => ({
        ...prev,
        estado_licencia: nuevoEstado,
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.numero_conductor.trim()) {
      newErrors.numero_conductor = "El número de conductor es requerido"
    }
    if (!formData.documento_identidad.trim()) {
      newErrors.documento_identidad = "El documento de identidad es requerido"
    }
    if (!formData.nombre_conductor.trim()) {
      newErrors.nombre_conductor = "El nombre del conductor es requerido"
    }
    if (!formData.numero_licencia.trim()) {
      newErrors.numero_licencia = "El número de licencia es requerido"
    }
    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es requerida"
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido"
    }
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }
    if (formData.calificacion < 0 || formData.calificacion > 5) {
      newErrors.calificacion = "La calificación debe estar entre 0 y 5"
    }
    if (!formData.fecha_vencimiento_licencia) {
      newErrors.fecha_vencimiento_licencia = "La fecha de vencimiento de licencia es requerida"
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

  const tiposLicencia = ["Federal", "Estatal", "Particular", "Chofer", "Automovilista"]

  const estadosLicencia = [
    { value: "vigente", label: "Vigente" },
    { value: "por_vencer", label: "Por Vencer" },
    { value: "vencida", label: "Vencida" },
  ]

  const renderStarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleInputChange("calificacion", star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= formData.calificacion
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-400"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium">{formData.calificacion.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Conductor</DialogTitle>
          <DialogDescription>Modifica la información del conductor {formData.numero_conductor}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Información Básica */}
            <div className="space-y-2">
              <Label htmlFor="numero_conductor">Número de Conductor *</Label>
              <Input
                id="numero_conductor"
                value={formData.numero_conductor}
                onChange={(e) => handleInputChange("numero_conductor", e.target.value)}
                className={errors.numero_conductor ? "border-red-500" : ""}
              />
              {errors.numero_conductor && <p className="text-sm text-red-500">{errors.numero_conductor}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento_identidad">Documento de Identidad *</Label>
              <Input
                id="documento_identidad"
                value={formData.documento_identidad}
                onChange={(e) => handleInputChange("documento_identidad", e.target.value.toUpperCase())}
                className={errors.documento_identidad ? "border-red-500" : ""}
                placeholder="CURP o RFC"
              />
              {errors.documento_identidad && <p className="text-sm text-red-500">{errors.documento_identidad}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre_conductor">Nombre del Conductor *</Label>
              <Input
                id="nombre_conductor"
                value={formData.nombre_conductor}
                onChange={(e) => handleInputChange("nombre_conductor", e.target.value)}
                className={errors.nombre_conductor ? "border-red-500" : ""}
              />
              {errors.nombre_conductor && <p className="text-sm text-red-500">{errors.nombre_conductor}</p>}
            </div>

            {/* Información de Licencia */}
            <div className="space-y-2">
              <Label htmlFor="numero_licencia">Número de Licencia *</Label>
              <Input
                id="numero_licencia"
                value={formData.numero_licencia}
                onChange={(e) => handleInputChange("numero_licencia", e.target.value.toUpperCase())}
                className={errors.numero_licencia ? "border-red-500" : ""}
              />
              {errors.numero_licencia && <p className="text-sm text-red-500">{errors.numero_licencia}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_licencia">Tipo de Licencia</Label>
              <Select
                value={formData.tipo_licencia}
                onValueChange={(value) => handleInputChange("tipo_licencia", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposLicencia.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_vencimiento_licencia">Fecha Vencimiento Licencia *</Label>
              <Input
                id="fecha_vencimiento_licencia"
                type="date"
                value={formData.fecha_vencimiento_licencia}
                onChange={(e) => handleInputChange("fecha_vencimiento_licencia", e.target.value)}
                className={errors.fecha_vencimiento_licencia ? "border-red-500" : ""}
              />
              {errors.fecha_vencimiento_licencia && (
                <p className="text-sm text-red-500">{errors.fecha_vencimiento_licencia}</p>
              )}
            </div>

            {/* Información de Contacto */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                className={errors.telefono ? "border-red-500" : ""}
                placeholder="+52 55 1234-5678"
              />
              {errors.telefono && <p className="text-sm text-red-500">{errors.telefono}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado_licencia">Estado Licencia</Label>
              <Select
                value={formData.estado_licencia}
                onValueChange={(value) => handleInputChange("estado_licencia", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosLicencia.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dirección - Span full width */}
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label htmlFor="direccion">Dirección *</Label>
              <Textarea
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleInputChange("direccion", e.target.value)}
                className={errors.direccion ? "border-red-500" : ""}
                rows={2}
              />
              {errors.direccion && <p className="text-sm text-red-500">{errors.direccion}</p>}
            </div>

            {/* Calificación y Estado */}
            <div className="space-y-2">
              <Label>Calificación</Label>
              {renderStarRating()}
              {errors.calificacion && <p className="text-sm text-red-500">{errors.calificacion}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="activo">Estado del Conductor</Label>
              <Select
                value={formData.activo.toString()}
                onValueChange={(value) => handleInputChange("activo", value === "true")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Resumen del Conductor</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Estado:</span>
                <span className={`ml-2 font-semibold ${formData.activo ? "text-green-600" : "text-gray-600"}`}>
                  {formData.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Licencia:</span>
                <span
                  className={`ml-2 font-semibold ${
                    formData.estado_licencia === "vigente"
                      ? "text-green-600"
                      : formData.estado_licencia === "vencida"
                        ? "text-red-600"
                        : "text-yellow-600"
                  }`}
                >
                  {formData.estado_licencia === "vigente"
                    ? "Vigente"
                    : formData.estado_licencia === "vencida"
                      ? "Vencida"
                      : "Por Vencer"}
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
