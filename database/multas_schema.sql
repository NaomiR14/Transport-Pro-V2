/*
# Driver Fines Schema Extension

Add driver fines management to the existing transport management system
*/

-- Create enum for fine payment status
CREATE TYPE estado_pago_multa AS ENUM ('pagado', 'pendiente', 'parcial', 'vencido');

-- Create driver fines table
CREATE TABLE IF NOT EXISTS multas_conductores (
    multa_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha date NOT NULL,
    numero_viaje text NOT NULL,
    vehiculo_id uuid REFERENCES vehiculos(vehiculo_id),
    conductor_id uuid REFERENCES conductores(conductor_id),
    ruta_id uuid REFERENCES rutas_viaje(ruta_id),
    infraccion text NOT NULL,
    importe_multa decimal(10,2) NOT NULL,
    importe_pagado decimal(10,2) DEFAULT 0,
    debe decimal(10,2) GENERATED ALWAYS AS (importe_multa - importe_pagado) STORED,
    estado_pago estado_pago_multa DEFAULT 'pendiente',
    fecha_vencimiento date,
    fecha_pago date,
    autoridad_emisora text,
    folio_infraccion text,
    lugar_infraccion text,
    observaciones text,
    comprobante_pago_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT check_importe_multa_positivo CHECK (importe_multa > 0),
    CONSTRAINT check_importe_pagado_no_negativo CHECK (importe_pagado >= 0),
    CONSTRAINT check_importe_pagado_no_mayor CHECK (importe_pagado <= importe_multa),
    CONSTRAINT check_fecha_pago_posterior CHECK (fecha_pago IS NULL OR fecha_pago >= fecha)
);

-- Create infractions catalog
CREATE TABLE IF NOT EXISTS tipos_infraccion (
    infraccion_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_infraccion text UNIQUE NOT NULL,
    descripcion text NOT NULL,
    categoria text NOT NULL, -- 'leve', 'grave', 'muy_grave'
    importe_base decimal(10,2) NOT NULL,
    puntos_licencia integer DEFAULT 0,
    activa boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Insert common traffic infractions
INSERT INTO tipos_infraccion (codigo_infraccion, descripcion, categoria, importe_base, puntos_licencia) VALUES
('VEL001', 'Exceso de velocidad hasta 20 km/h', 'leve', 1500.00, 2),
('VEL002', 'Exceso de velocidad de 21 a 40 km/h', 'grave', 2500.00, 4),
('VEL003', 'Exceso de velocidad mayor a 40 km/h', 'muy_grave', 5000.00, 8),
('SEM001', 'No respetar señalamiento', 'grave', 1800.00, 3),
('EST001', 'Estacionamiento indebido', 'leve', 1200.00, 0),
('VER001', 'Circular sin verificación', 'grave', 3500.00, 0),
('PES001', 'Sobrepeso en báscula', 'muy_grave', 5000.00, 0),
('DOC001', 'Documentos vencidos', 'grave', 2200.00, 0),
('LIC001', 'No portar licencia', 'grave', 2800.00, 0),
('CAR001', 'Circular en carril exclusivo', 'leve', 1600.00, 2),
('SEM002', 'No respetar semáforo', 'muy_grave', 4000.00, 6),
('CEL001', 'Uso de celular al conducir', 'grave', 2000.00, 3),
('CIN001', 'No usar cinturón de seguridad', 'leve', 800.00, 2),
('PLA001', 'Circular sin placas', 'muy_grave', 4500.00, 0),
('VIA001', 'Obstruir la vía pública', 'grave', 2500.00, 0),
('EBR001', 'Conducir en estado de ebriedad', 'muy_grave', 8000.00, 12),
('DOC002', 'Falta de documentos del vehículo', 'grave', 1800.00, 0),
('MOD001', 'Modificaciones no autorizadas', 'grave', 3000.00, 0),
('AMB001', 'Contaminar el medio ambiente', 'muy_grave', 6000.00, 0),
('PEL001', 'Transportar carga peligrosa sin permiso', 'muy_grave', 10000.00, 0)
ON CONFLICT (codigo_infraccion) DO NOTHING;

-- Function to automatically update payment status
CREATE OR REPLACE FUNCTION update_fine_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update payment status based on amount paid
    IF NEW.importe_pagado >= NEW.importe_multa THEN
        NEW.estado_pago := 'pagado';
        IF NEW.fecha_pago IS NULL THEN
            NEW.fecha_pago := CURRENT_DATE;
        END IF;
    ELSIF NEW.importe_pagado > 0 THEN
        NEW.estado_pago := 'parcial';
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
CREATE TRIGGER trg_update_fine_payment_status
    BEFORE INSERT OR UPDATE ON multas_conductores
    FOR EACH ROW
    EXECUTE FUNCTION update_fine_payment_status();

-- Function to calculate driver fine statistics
CREATE OR REPLACE FUNCTION calculate_driver_fine_stats(p_conductor_id uuid)
RETURNS TABLE (
    total_multas integer,
    total_importe decimal(12,2),
    total_pagado decimal(12,2),
    total_debe decimal(12,2),
    multas_pendientes integer,
    multas_vencidas integer
) AS $$
BEGIN
    SELECT 
        COUNT(*)::integer,
        COALESCE(SUM(importe_multa), 0),
        COALESCE(SUM(importe_pagado), 0),
        COALESCE(SUM(debe), 0),
        COUNT(CASE WHEN estado_pago = 'pendiente' THEN 1 END)::integer,
        COUNT(CASE WHEN estado_pago = 'vencido' THEN 1 END)::integer
    INTO 
        total_multas,
        total_importe,
        total_pagado,
        total_debe,
        multas_pendientes,
        multas_vencidas
    FROM multas_conductores
    WHERE conductor_id = p_conductor_id;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to generate automatic fine expiration dates
CREATE OR REPLACE FUNCTION set_fine_expiration()
RETURNS TRIGGER AS $$
BEGIN
    -- Set expiration date to 30 days from fine date if not specified
    IF NEW.fecha_vencimiento IS NULL THEN
        NEW.fecha_vencimiento := NEW.fecha + INTERVAL '30 days';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set automatic expiration dates
CREATE TRIGGER trg_set_fine_expiration
    BEFORE INSERT ON multas_conductores
    FOR EACH ROW
    EXECUTE FUNCTION set_fine_expiration();

-- Enable Row Level Security
ALTER TABLE multas_conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_infraccion ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON multas_conductores
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON tipos_infraccion
    FOR SELECT TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_multas_fecha ON multas_conductores(fecha);
CREATE INDEX IF NOT EXISTS idx_multas_conductor ON multas_conductores(conductor_id);
CREATE INDEX IF NOT EXISTS idx_multas_vehiculo ON multas_conductores(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_multas_estado_pago ON multas_conductores(estado_pago);
CREATE INDEX IF NOT EXISTS idx_multas_numero_viaje ON multas_conductores(numero_viaje);
CREATE INDEX IF NOT EXISTS idx_multas_vencimiento ON multas_conductores(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_multas_folio ON multas_conductores(folio_infraccion);

-- Create comprehensive view for fines dashboard
CREATE OR REPLACE VIEW vista_multas_dashboard AS
SELECT 
    mc.multa_id,
    mc.fecha,
    mc.numero_viaje,
    v.placa as placa_vehiculo,
    v.estado as estado_vehiculo,
    c.nombre as conductor,
    c.numero_conductor,
    mc.infraccion,
    mc.importe_multa,
    mc.importe_pagado,
    mc.debe,
    mc.estado_pago,
    mc.fecha_vencimiento,
    mc.fecha_pago,
    mc.autoridad_emisora,
    mc.folio_infraccion,
    mc.lugar_infraccion,
    mc.observaciones,
    CASE 
        WHEN mc.fecha_vencimiento IS NOT NULL AND mc.fecha_vencimiento < CURRENT_DATE AND mc.estado_pago != 'pagado'
        THEN (CURRENT_DATE - mc.fecha_vencimiento)
        ELSE 0
    END as dias_vencido,
    CASE 
        WHEN mc.importe_multa > 0 THEN 
            ROUND((mc.importe_pagado / mc.importe_multa) * 100, 2)
        ELSE 0
    END as porcentaje_pagado
FROM multas_conductores mc
LEFT JOIN vehiculos v ON mc.vehiculo_id = v.vehiculo_id
LEFT JOIN conductores c ON mc.conductor_id = c.conductor_id
ORDER BY mc.fecha DESC;

-- Create summary view by driver
CREATE OR REPLACE VIEW vista_resumen_multas_conductor AS
SELECT 
    c.conductor_id,
    c.numero_conductor,
    c.nombre as conductor,
    COUNT(mc.multa_id) as total_multas,
    COUNT(CASE WHEN mc.estado_pago = 'pagado' THEN 1 END) as multas_pagadas,
    COUNT(CASE WHEN mc.estado_pago = 'pendiente' THEN 1 END) as multas_pendientes,
    COUNT(CASE WHEN mc.estado_pago = 'vencido' THEN 1 END) as multas_vencidas,
    COALESCE(SUM(mc.importe_multa), 0) as total_importe_multas,
    COALESCE(SUM(mc.importe_pagado), 0) as total_importe_pagado,
    COALESCE(SUM(mc.debe), 0) as total_debe,
    CASE 
        WHEN COUNT(mc.multa_id) > 0 THEN 
            ROUND((COUNT(CASE WHEN mc.estado_pago = 'pagado' THEN 1 END)::decimal / COUNT(mc.multa_id)) * 100, 2)
        ELSE 0
    END as porcentaje_cumplimiento
FROM conductores c
LEFT JOIN multas_conductores mc ON c.conductor_id = mc.conductor_id
GROUP BY c.conductor_id, c.numero_conductor, c.nombre
ORDER BY c.numero_conductor;

-- Create summary view by vehicle
CREATE OR REPLACE VIEW vista_resumen_multas_vehiculo AS
SELECT 
    v.vehiculo_id,
    v.numero_interno,
    v.placa,
    COUNT(mc.multa_id) as total_multas,
    COUNT(CASE WHEN mc.estado_pago = 'pagado' THEN 1 END) as multas_pagadas,
    COUNT(CASE WHEN mc.estado_pago = 'pendiente' THEN 1 END) as multas_pendientes,
    COUNT(CASE WHEN mc.estado_pago = 'vencido' THEN 1 END) as multas_vencidas,
    COALESCE(SUM(mc.importe_multa), 0) as total_importe_multas,
    COALESCE(SUM(mc.importe_pagado), 0) as total_importe_pagado,
    COALESCE(SUM(mc.debe), 0) as total_debe
FROM vehiculos v
LEFT JOIN multas_conductores mc ON v.vehiculo_id = mc.vehiculo_id
GROUP BY v.vehiculo_id, v.numero_interno, v.placa
ORDER BY v.numero_interno;

-- Create alerts view for overdue fines
CREATE OR REPLACE VIEW vista_alertas_multas AS
SELECT 
    mc.multa_id,
    mc.fecha,
    mc.numero_viaje,
    v.placa as placa_vehiculo,
    c.nombre as conductor,
    mc.infraccion,
    mc.importe_multa,
    mc.debe,
    mc.fecha_vencimiento,
    (CURRENT_DATE - mc.fecha_vencimiento) as dias_vencido,
    CASE 
        WHEN (CURRENT_DATE - mc.fecha_vencimiento) > 90 THEN 'CRITICA'
        WHEN (CURRENT_DATE - mc.fecha_vencimiento) > 30 THEN 'ALTA'
        WHEN (CURRENT_DATE - mc.fecha_vencimiento) > 0 THEN 'MEDIA'
        WHEN (mc.fecha_vencimiento - CURRENT_DATE) <= 7 THEN 'PREVENTIVA'
        ELSE 'NORMAL'
    END as nivel_alerta
FROM multas_conductores mc
LEFT JOIN vehiculos v ON mc.vehiculo_id = v.vehiculo_id
LEFT JOIN conductores c ON mc.conductor_id = c.conductor_id
WHERE mc.estado_pago != 'pagado'
  AND mc.fecha_vencimiento IS NOT NULL
ORDER BY mc.fecha_vencimiento ASC;
