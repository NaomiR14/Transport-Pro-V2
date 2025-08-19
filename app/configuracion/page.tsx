"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings, Bell, Moon, Globe, Shield, Save } from "lucide-react"
import { Layout } from "@/components/layout"
import { useTheme } from "next-themes"

export default function ConfiguracionPage() {
  console.log("🎯 Página de configuración cargada")

  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    desktop: true,
  })

  const [preferences, setPreferences] = useState({
    language: "es",
    timezone: "America/Bogota",
    dateFormat: "dd/mm/yyyy",
    currency: "COP",
  })

  const handleNotificationChange = (type: string, value: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  const handlePreferenceChange = (type: string, value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  const handleSave = () => {
    console.log("Guardando configuraciones...", { notifications, preferences })
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Configuración</h1>
            <p className="text-gray-600 dark:text-gray-400">Personaliza tu experiencia en el sistema</p>
          </div>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>

        <div className="space-y-6">
          {/* Apariencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Apariencia
              </CardTitle>
              <CardDescription>Personaliza la apariencia de la interfaz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Tema</Label>
                  <div className="text-sm text-muted-foreground">Selecciona el tema de la aplicación</div>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notificaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones
              </CardTitle>
              <CardDescription>Configura cómo y cuándo recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificaciones por Email</Label>
                  <div className="text-sm text-muted-foreground">
                    Recibir notificaciones importantes por correo electrónico
                  </div>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(value) => handleNotificationChange("email", value)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificaciones Push</Label>
                  <div className="text-sm text-muted-foreground">Recibir notificaciones push en el navegador</div>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(value) => handleNotificationChange("push", value)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificaciones SMS</Label>
                  <div className="text-sm text-muted-foreground">Recibir notificaciones críticas por SMS</div>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(value) => handleNotificationChange("sms", value)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificaciones de Escritorio</Label>
                  <div className="text-sm text-muted-foreground">Mostrar notificaciones en el escritorio</div>
                </div>
                <Switch
                  checked={notifications.desktop}
                  onCheckedChange={(value) => handleNotificationChange("desktop", value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferencias Regionales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Preferencias Regionales
              </CardTitle>
              <CardDescription>Configura idioma, zona horaria y formatos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => handlePreferenceChange("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Zona Horaria</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => handlePreferenceChange("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Bogota">Bogotá (GMT-5)</SelectItem>
                      <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                      <SelectItem value="America/Lima">Lima (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Formato de Fecha</Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(value) => handlePreferenceChange("dateFormat", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) => handlePreferenceChange("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COP">Peso Colombiano (COP)</SelectItem>
                      <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad
              </CardTitle>
              <CardDescription>Configuraciones de seguridad de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Shield className="h-4 w-4 mr-2" />
                Cambiar Contraseña
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Configurar Autenticación de Dos Factores
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
