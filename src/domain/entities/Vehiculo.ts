export interface Vehiculo {
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

export class VehiculoEntity implements Vehiculo {
  constructor(
    public vehiculo_id: string,
    public numero_interno: string,
    public tipo: string,
    public marca: string,
    public modelo: string,
    public placa: string,
    public numero_serie: string,
    public color: string,
    public anio: number,
    public carga_maxima: number,
    public estado: "activo" | "inactivo" | "mantenimiento" | "baja",
    public ciclo_mantenimiento_km: number,
    public odometro_inicial: number,
    public odometro_actual: number,
    public ultimo_mantenimiento_km: number,
    public proximo_mantenimiento_km: number,
    public estado_mantenimiento: "al_dia" | "proximo" | "vencido"
  ) {}

  calcularKmsFaltantes(): number {
    const faltantes = this.proximo_mantenimiento_km - this.odometro_actual
    return faltantes > 0 ? faltantes : 0
  }

  requiereMantenimiento(): boolean {
    return this.calcularKmsFaltantes() <= 5000
  }

  actualizarOdometro(nuevosKm: number): void {
    if (nuevosKm < this.odometro_actual) {
      throw new Error("El nuevo odómetro no puede ser menor al actual")
    }
    this.odometro_actual = nuevosKm
    this.actualizarEstadoMantenimiento()
  }

  private actualizarEstadoMantenimiento(): void {
    const kmsFaltantes = this.calcularKmsFaltantes()
    if (kmsFaltantes <= 0) {
      this.estado_mantenimiento = "vencido"
    } else if (kmsFaltantes <= 5000) {
      this.estado_mantenimiento = "proximo"
    } else {
      this.estado_mantenimiento = "al_dia"
    }
  }
}
