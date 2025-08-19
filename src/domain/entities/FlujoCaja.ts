export interface FlujoCaja {
  id: number
  año: number
  mes: string
  ingresos: number
  egresos: number
  personal: number
  seguros: number
  impuestos: number
  multas: number
  mantenimiento: number
  combustible: number
  peaje: number
  comidas: number
  otros_egresos: number
  utilidad: number
  margen: number
}

export class FlujoCajaEntity implements FlujoCaja {
  constructor(
    public id: number,
    public año: number,
    public mes: string,
    public ingresos: number,
    public egresos: number,
    public personal: number,
    public seguros: number,
    public impuestos: number,
    public multas: number,
    public mantenimiento: number,
    public combustible: number,
    public peaje: number,
    public comidas: number,
    public otros_egresos: number,
    public utilidad: number,
    public margen: number
  ) {}

  calcularEgresos(): number {
    return this.personal + this.seguros + this.impuestos + this.multas + 
           this.mantenimiento + this.combustible + this.peaje + 
           this.comidas + this.otros_egresos
  }

  calcularUtilidad(): number {
    return this.ingresos - this.calcularEgresos()
  }

  calcularMargen(): number {
    if (this.ingresos === 0) return 0
    return (this.calcularUtilidad() / this.ingresos) * 100
  }

  actualizarCalculos(): void {
    this.egresos = this.calcularEgresos()
    this.utilidad = this.calcularUtilidad()
    this.margen = this.calcularMargen()
  }
}
