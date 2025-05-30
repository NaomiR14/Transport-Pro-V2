/*
# Vehicle Taxes Schema Extension

Add tax management tables to the existing transport management system
*/

-- Create enum for tax payment status
CREATE TYPE estado_pago_impuesto AS ENUM ('pagado', 'pendiente', 'vencido');

-- Create vehicle taxes table
CREATE TABLE IF NOT EXISTS impuestos_vehiculos (
    impuesto_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehiculo_id uuid REFERENCES vehiculos(vehiculo_id) ON DELETE CASCADE,
    tipo_impuesto text NOT NULL,
    anio_impuesto integer NOT NULL,
    impuesto_monto decimal(10,2) NOT NULL,
    fecha_vencimiento date,
    fecha_pago date,
    estado_pago estado_pago_impuesto DEFAULT 'pendiente',
    comprobante_url text,
    notas text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT check_anio_valido CHECK (anio_impuesto >= 2000 AND anio_impuesto <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    CONSTRAINT check_monto_positivo CHECK (impuesto_monto > 0),
    CONSTRAINT unique_vehiculo_tipo_anio UNIQUE (vehiculo_id, tipo_impuesto, anio_impuesto)
);

-- Create tax types catalog
CREATE TABLE IF NOT EXISTS tipos_impuesto (
    tipo_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre text UNIQUE NOT NULL,
    descripcion text,
    periodicidad text, -- 'anual', 'semestral', 'mensual'
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Insert common tax types
INSERT INTO tipos_impuesto (nombre, descripcion, periodicidad) VALUES
('Tenencia', 'Impuesto sobre tenencia o uso de vehículos', 'anual'),
('Refrendo', 'Refrendo de placas vehiculares', 'anual'),
('Verificación', 'Verificación vehicular ambiental', 'semestral'),
('Placas', 'Expedición de placas vehiculares', 'anual'),
('Licencia de Funcionamiento', 'Licencia para funcionamiento de vehículo comercial', 'anual'),
('Impuesto Predial Vehicular', 'Impuesto predial sobre vehículos', 'anual'),
('Derechos de Circulación', 'Derechos por circulación en vías públicas', 'anual'),
('Multas y Recargos', 'Multas y recargos por infracciones', 'variable')
ON CONFLICT (nombre) DO NOTHING;

-- Function to automatically update payment status
CREATE OR REPLACE FUNCTION update_tax_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status based on payment date
    IF NEW.fecha_pago IS NOT NULL THEN
        NEW.estado_pago := 'pagado';
    ELSIF NEW.fecha_vencimiento IS NOT NULL AND NEW.fecha_vencimiento < CURRENT_DATE THEN
        NEW.estado_pago := 'vencido';
    ELSE
        NEW.estado_pago := 'pendiente';
    END IF;
    
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update payment status
CREATE TRIGGER trg_update_tax_payment_status
    BEFORE INSERT OR UPDATE ON impuestos_vehiculos
    FOR EACH ROW
    EXECUTE FUNCTION update_tax_payment_status();

-- Function to generate annual taxes for all vehicles
CREATE OR REPLACE FUNCTION generar_impuestos_anuales(p_anio integer)
RETURNS void AS $$
DECLARE
    vehiculo_record RECORD;
    tipo_record RECORD;
BEGIN
    -- Loop through all active vehicles
    FOR vehiculo_record IN 
        SELECT vehiculo_id FROM vehiculos WHERE estado = 'activo'
    LOOP
        -- Loop through annual tax types
        FOR tipo_record IN 
            SELECT nombre FROM tipos_impuesto WHERE periodicidad = 'anual' AND activo = true
        LOOP
            -- Insert tax record if it doesn't exist
            INSERT INTO impuestos_vehiculos (
                vehiculo_id, 
                tipo_impuesto, 
                anio_impuesto, 
                impuesto_monto,
                fecha_vencimiento
            )
            SELECT 
                vehiculo_record.vehiculo_id,
                tipo_record.nombre,
                p_anio,
                CASE 
                    WHEN tipo_record.nombre = 'Tenencia' THEN 8000.00
                    WHEN tipo_record.nombre = 'Refrendo' THEN 1200.00
                    WHEN tipo_record.nombre = 'Verificación' THEN 500.00
                    WHEN tipo_record.nombre = 'Placas' THEN 800.00
                    ELSE 1000.00
                END,
                DATE(p_anio || '-12-31')
            ON CONFLICT (vehiculo_id, tipo_impuesto, anio_impuesto) DO NOTHING;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE impuestos_vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_impuesto ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON impuestos_vehiculos
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON tipos_impuesto
    FOR SELECT TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_impuestos_vehiculo ON impuestos_vehiculos(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_impuestos_tipo ON impuestos_vehiculos(tipo_impuesto);
CREATE INDEX IF NOT EXISTS idx_impuestos_anio ON impuestos_vehiculos(anio_impuesto);
CREATE INDEX IF NOT EXISTS idx_impuestos_estado ON impuestos_vehiculos(estado_pago);
CREATE INDEX IF NOT EXISTS idx_impuestos_vencimiento ON impuestos_vehiculos(fecha_vencimiento);

-- Create view for tax dashboard
CREATE OR REPLACE VIEW vista_impuestos_dashboard AS
SELECT 
    iv.impuesto_id,
    v.numero_interno as numero_vehiculo,
    v.placa as placa_vehiculo,
    iv.tipo_impuesto,
    iv.anio_impuesto,
    iv.impuesto_monto,
    iv.fecha_pago,
    iv.fecha_vencimiento,
    iv.estado_pago,
    CASE 
        WHEN iv.fecha_vencimiento IS NOT NULL AND iv.fecha_vencimiento < CURRENT_DATE AND iv.estado_pago != 'pagado' 
        THEN (CURRENT_DATE - iv.fecha_vencimiento)
        ELSE 0
    END as dias_vencido
FROM impuestos_vehiculos iv
JOIN vehiculos v ON iv.vehiculo_id = v.vehiculo_id
ORDER BY iv.anio_impuesto DESC, v.numero_interno ASC;

-- Create summary view by vehicle
CREATE OR REPLACE VIEW vista_resumen_impuestos_vehiculo AS
SELECT 
    v.vehiculo_id,
    v.numero_interno,
    v.placa,
    COUNT(iv.impuesto_id) as total_impuestos,
    COUNT(CASE WHEN iv.estado_pago = 'pagado' THEN 1 END) as impuestos_pagados,
    COUNT(CASE WHEN iv.estado_pago = 'pendiente' THEN 1 END) as impuestos_pendientes,
    COUNT(CASE WHEN iv.estado_pago = 'vencido' THEN 1 END) as impuestos_vencidos,
    COALESCE(SUM(CASE WHEN iv.estado_pago = 'pagado' THEN iv.impuesto_monto ELSE 0 END), 0) as total_pagado,
    COALESCE(SUM(CASE WHEN iv.estado_pago != 'pagado' THEN iv.impuesto_monto ELSE 0 END), 0) as total_pendiente
FROM vehiculos v
LEFT JOIN impuestos_vehiculos iv ON v.vehiculo_id = iv.vehiculo_id
GROUP BY v.vehiculo_id, v.numero_interno, v.placa
ORDER BY v.numero_interno;
