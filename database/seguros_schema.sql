/*
# Vehicle Insurance Schema Extension

Add insurance management tables to the existing transport management system
*/

-- Create enum for insurance policy status
CREATE TYPE estado_poliza AS ENUM ('vigente', 'vencida', 'por_vencer', 'cancelada');

-- Create vehicle insurance table
CREATE TABLE IF NOT EXISTS seguros_vehiculos (
    seguro_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehiculo_id uuid REFERENCES vehiculos(vehiculo_id) ON DELETE CASCADE,
    aseguradora text NOT NULL,
    poliza_seguro text UNIQUE NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_vencimiento date NOT NULL,
    importe_pagado decimal(10,2) NOT NULL,
    fecha_pago date NOT NULL,
    estado_poliza estado_poliza DEFAULT 'vigente',
    notas text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT check_fechas_validas CHECK (fecha_vencimiento > fecha_inicio),
    CONSTRAINT check_importe_positivo CHECK (importe_pagado > 0)
);

-- Create insurance companies catalog
CREATE TABLE IF NOT EXISTS aseguradoras (
    aseguradora_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre text UNIQUE NOT NULL,
    telefono text,
    email text,
    direccion text,
    activa boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Insert common insurance companies
INSERT INTO aseguradoras (nombre, telefono, email) VALUES
('Seguros Monterrey', '81-8000-0000', 'contacto@segurosmonterrey.com'),
('AXA Seguros', '55-5000-0000', 'info@axa.com.mx'),
('Qualitas Seguros', '55-5555-0000', 'atencion@qualitas.com.mx'),
('HDI Seguros', '55-4000-0000', 'contacto@hdi.com.mx'),
('GNP Seguros', '55-3000-0000', 'info@gnp.com.mx'),
('Mapfre Seguros', '55-2000-0000', 'contacto@mapfre.com.mx'),
('Zurich Seguros', '55-1000-0000', 'info@zurich.com.mx'),
('Banorte Seguros', '81-8100-0000', 'seguros@banorte.com'),
('BBVA Seguros', '55-2200-0000', 'seguros@bbva.com'),
('Inbursa Seguros', '55-1100-0000', 'contacto@inbursa.com')
ON CONFLICT (nombre) DO NOTHING;

-- Function to automatically update policy status based on expiration date
CREATE OR REPLACE FUNCTION update_policy_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate days until expiration
    DECLARE
        dias_restantes integer;
    BEGIN
        dias_restantes := (NEW.fecha_vencimiento - CURRENT_DATE);
        
        -- Update status based on expiration
        IF dias_restantes < 0 THEN
            NEW.estado_poliza := 'vencida';
        ELSIF dias_restantes <= 30 THEN
            NEW.estado_poliza := 'por_vencer';
        ELSE
            NEW.estado_poliza := 'vigente';
        END IF;
        
        NEW.updated_at := now();
        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update policy status
CREATE TRIGGER trg_update_policy_status
    BEFORE INSERT OR UPDATE ON seguros_vehiculos
    FOR EACH ROW
    EXECUTE FUNCTION update_policy_status();

-- Enable Row Level Security
ALTER TABLE seguros_vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aseguradoras ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON seguros_vehiculos
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON aseguradoras
    FOR SELECT TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seguros_vehiculo ON seguros_vehiculos(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_seguros_estado ON seguros_vehiculos(estado_poliza);
CREATE INDEX IF NOT EXISTS idx_seguros_vencimiento ON seguros_vehiculos(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_seguros_poliza ON seguros_vehiculos(poliza_seguro);

-- Create view for insurance dashboard
CREATE OR REPLACE VIEW vista_seguros_dashboard AS
SELECT 
    sv.seguro_id,
    v.numero_interno as numero_vehiculo,
    v.placa as placa_vehiculo,
    sv.aseguradora,
    sv.poliza_seguro,
    sv.fecha_inicio,
    sv.fecha_vencimiento,
    sv.importe_pagado,
    sv.fecha_pago,
    sv.estado_poliza,
    (sv.fecha_vencimiento - CURRENT_DATE) as dias_restantes,
    CASE 
        WHEN (sv.fecha_vencimiento - CURRENT_DATE) < 0 THEN 'Vencida'
        WHEN (sv.fecha_vencimiento - CURRENT_DATE) <= 30 THEN 'Por Vencer'
        ELSE 'Vigente'
    END as estado_texto
FROM seguros_vehiculos sv
JOIN vehiculos v ON sv.vehiculo_id = v.vehiculo_id
ORDER BY sv.fecha_vencimiento ASC;
