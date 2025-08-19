"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Shield, Edit2, Save, X } from "lucide-react"
import { Layout } from "@/components/layout"

export default function PerfilPage() {
  console.log("🎯 Página de perfil cargada")

  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    nombre: "Juan Carlos",
    apellido: "Rodríguez",
    email: "admin@transportpro.com",
    telefono: "+57 300 123 4567",
    direccion: "Calle 123 #45-67, Bogotá",
    fechaIngreso: "2023-01-15",
    rol: "Gerente General",
    departamento: "Administración",
    cedula: "12.345.678",
    fechaNacimiento: "1985-03-20",
  })

  const [editData, setEditData] = useState(userData)

  const handleEdit = () => {
    setIsEditing(true)
    setEditData(userData)
  }

  const handleSave = () => {
    setUserData(editData)
    setIsEditing(false)
    console.log("Guardando datos del usuario:", editData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData(userData)
  }

  const handleInputChange = (field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Mi Perfil</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona tu información personal y configuración de cuenta
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              Editar Perfil
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Guardar
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2 bg-transparent">
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription>Información básica de tu perfil de usuario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    {isEditing ? (
                      <Input
                        id="nombre"
                        value={editData.nombre}
                        onChange={(e) => handleInputChange("nombre", e.target.value)}
                      />
                    ) : (
                      <p className="text-sm font-medium">{userData.nombre}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    {isEditing ? (
                      <Input
                        id="apellido"
                        value={editData.apellido}
                        onChange={(e) => handleInputChange("apellido", e.target.value)}
                      />
                    ) : (
                      <p className="text-sm font-medium">{userData.apellido}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cedula">Cédula</Label>
                  {isEditing ? (
                    <Input
                      id="cedula"
                      value={editData.cedula}
                      onChange={(e) => handleInputChange("cedula", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm font-medium">{userData.cedula}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                  {isEditing ? (
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      value={editData.fechaNacimiento}
                      onChange={(e) => handleInputChange("fechaNacimiento", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {new Date(userData.fechaNacimiento).toLocaleDateString("es-ES")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Corporativo</Label>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{userData.email}</p>
                  <p className="text-xs text-gray-500">
                    El email corporativo no puede ser modificado. Contacta al administrador si necesitas cambiarlo.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  {isEditing ? (
                    <Input
                      id="telefono"
                      value={editData.telefono}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm font-medium">{userData.telefono}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  {isEditing ? (
                    <Input
                      id="direccion"
                      value={editData.direccion}
                      onChange={(e) => handleInputChange("direccion", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm font-medium">{userData.direccion}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                  <AvatarFallback className="text-lg">
                    {userData.nombre.charAt(0)}
                    {userData.apellido.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>
                  {userData.nombre} {userData.apellido}
                </CardTitle>
                <CardDescription>{userData.email}</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <Badge variant="secondary" className="text-sm">
                  <Shield className="h-3 w-3 mr-1" />
                  {userData.rol}
                </Badge>
                <Separator />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ingreso: {new Date(userData.fechaIngreso).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Información Laboral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Departamento</Label>
                  <p className="text-sm font-medium">{userData.departamento}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Rol</Label>
                  <p className="text-sm font-medium">{userData.rol}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Fecha de Ingreso</Label>
                  <p className="text-sm font-medium">{new Date(userData.fechaIngreso).toLocaleDateString("es-ES")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Configuración de Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Cambiar Contraseña
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Preferencias
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
