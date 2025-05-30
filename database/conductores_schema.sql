/*
# Drivers Management Schema Extension

Add comprehensive driver management to the existing transport management system
*/

-- Create enum for license status
CREATE TYPE estado_licencia AS ENUM ('vigente', 'por_vencer', 'vencida');

-- Update existing conductores table with additional fields
ALTER TABLE conductores 
ADD COLUMN IF NOT EXISTS numero_conductor text UNIQUE,
ADD COLUMN IF NOT EXISTS documento_identidad text UNIQUE,
ADD COLUMN IF NOT EXISTS direccion text,
ADD COLUMN IF NOT EXISTS calificacion decimal(2,1) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS fecha_vencimiento_licencia date,
ADD COLUMN IF NOT EXISTS tipo_licencia text DEFAULT 'Federal',
ADD COLUMN IF NOT EXISTS estado_licencia estado_licencia DEFAULT 'vigente',
ADD COLUMN IF NOT EXISTS fecha_contratacion date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS notas text;

-- Add constraints
ALTER TABLE conductores 
ADD CONSTRAINT IF NOT EXISTS check_calificacion_valida CHECK (calificacion >= 0 AND calificacion <= 5);

-- Create driver documents table
CREATE TABLE IF NOT EXISTS documentos_conductores (
    documento_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conductor_id uuid REFERENCES conductores(conductor_id) ON DELETE CASCADE,
    tipo_documento text NOT NULL,
    numero_documento text NOT NULL,
    fecha_expedicion date,
    fecha_vencimiento date,
    url_documento text,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create driver evaluations table
CREATE TABLE IF NOT EXISTS evaluaciones_conductores (
    evaluacion_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conductor_id uuid REFERENCES conductores(conductor_id) ON DELETE CASCADE,
    orden_id uuid REFERENCES ordenes_transporte(orden_id),
    calificacion decimal(2,1) NOT NULL,
    comentarios text,
    fecha_evaluacion timestamptz DEFAULT now(),
    evaluado_por text,
    created_at timestamptz DEFAULT now(),
    
    CONSTRAINT check_calificacion_evaluacion CHECK (calificacion >= 0 AND calificacion <= 5)
);

-- Create driver training records table
CREATE TABLE IF NOT EXISTS capacitaciones_conductores (
    capacitacion_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conductor_id uuid REFERENCES conductores(conductor_id) ON DELETE CASCADE,
    nombre_curso text NOT NULL,
    institucion text,
    fecha_inicio date NOT NULL,
    fecha_fin date,
    certificado_url text,
    aprobado boolean DEFAULT false,
    calificacion decimal(5,2),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Function to automatically update license status
CREATE OR REPLACE FUNCTION update_license_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate days until license expiration
    DECLARE
        dias_restantes integer;
    BEGIN
        IF NEW.fecha_vencimiento_licencia IS NOT NULL THEN
            dias_restantes := (NEW.fecha_vencimiento_licencia - CURRENT_DATE);
            
            -- Update status based on expiration
            IF dias_restantes < 0 THEN
                NEW.estado_licencia := 'vencida';
            ELSIF dias_restantes <= 30 THEN
                NEW.estado_licencia := 'por_vencer';
            ELSE
                NEW.estado_licencia := 'vigente';
            END IF;
        END IF;
        
        NEW.updated_at := now();
        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update license status
CREATE TRIGGER trg_update_license_status
    BEFORE INSERT OR UPDATE ON conductores
    FOR EACH ROW
    EXECUTE FUNCTION update_license_status();

-- Function to calculate average driver rating
CREATE OR REPLACE FUNCTION calculate_driver_rating(p_conductor_id uuid)
RETURNS decimal(2,1) AS $$
DECLARE
    avg_rating decimal(2,1);
BEGIN
    SELECT COALESCE(AVG(calificacion), 0.0)
    INTO avg_rating
    FROM evaluaciones_conductores
    WHERE conductor_id = p_conductor_id;
    
    -- Update driver's rating
    UPDATE conductores 
    SET calificacion = avg_rating,
        updated_at = now()
    WHERE conductor_id = p_conductor_id;
    
    RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update driver rating when evaluation is added
CREATE OR REPLACE FUNCTION update_driver_rating_trigger()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_driver_rating(NEW.conductor_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_driver_rating
    AFTER INSERT OR UPDATE OR DELETE ON evaluaciones_conductores
    FOR EACH ROW
    EXECUTE FUNCTION update_driver_rating_trigger();

-- Insert sample data for conductor numbers (if not exists)
DO $$
DECLARE
    conductor_record RECORD;
    contador INTEGER := 1;
BEGIN
    FOR conductor_record IN 
        SELECT conductor_id FROM conductores WHERE numero_conductor IS NULL
    LOOP
        UPDATE conductores 
        SET numero_conductor = 'COND-' || LPAD(contador::text, 3, '0')
        WHERE conductor_id = conductor_record.conductor_id;
        contador := contador + 1;
    END LOOP;
END $$;

-- Enable Row Level Security on new tables
ALTER TABLE documentos_conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones_conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacitaciones_conductores ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON documentos_conductores
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON evaluaciones_conductores
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON capacitaciones_conductores
    FOR SELECT TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conductores_numero ON conductores(numero_conductor);
CREATE INDEX IF NOT EXISTS idx_conductores_documento ON conductores(documento_identidad);
CREATE INDEX IF NOT EXISTS idx_conductores_estado_licencia ON conductores(estado_licencia);
CREATE INDEX IF NOT EXISTS idx_conductores_activo ON conductores(activo);
CREATE INDEX IF NOT EXISTS idx_documentos_conductor ON documentos_conductores(conductor_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_conductor ON evaluaciones_conductores(conductor_id);
CREATE INDEX IF NOT EXISTS idx_capacitaciones_conductor ON capacitaciones_conductores(conductor_id);

-- Create comprehensive view for driver dashboard
CREATE OR REPLACE VIEW vista_conductores_dashboard AS
SELECT 
    c.conductor_id,
    c.numero_conductor,
    c.documento_identidad,
    c.nombre as nombre_conductor,
    c.licencia as numero_licencia,
    c.direccion,
    c.telefono,
    c.email,
    c.calificacion,
    c.activo,
    c.fecha_vencimiento_licencia,
    c.tipo_licencia,
    c.estado_licencia,
    c.fecha_contratacion,
    (c.fecha_vencimiento_licencia - CURRENT_DATE) as dias_vencimiento_licencia,
    COUNT(ot.orden_id) as total_ordenes,
    COUNT(CASE WHEN ot.estado = 'entregado' THEN 1 END) as ordenes_completadas,
    COUNT(ec.evaluacion_id) as total_evaluaciones,
    COALESCE(AVG(ec.calificacion), 0) as calificacion_promedio
FROM conductores c
LEFT JOIN ordenes_transporte ot ON c.conductor_id = ot.conductor_id
LEFT JOIN evaluaciones_conductores ec ON c.conductor_id = ec.conductor_id
GROUP BY c.conductor_id, c.numero_conductor, c.documento_identidad, c.nombre, 
         c.licencia, c.direccion, c.telefono, c.email, c.calificacion, c.activo,
         c.fecha_vencimiento_licencia, c.tipo_licencia, c.estado_licencia, c.fecha_contratacion
ORDER BY c.numero_conductor;

-- Create view for license expiration alerts
CREATE OR REPLACE VIEW vista_alertas_licencias AS
SELECT 
    c.conductor_id,
    c.numero_conductor,
    c.nombre as nombre_conductor,
    c.licencia as numero_licencia,
    c.fecha_vencimiento_licencia,
    c.estado_licencia,
    (c.fecha_vencimiento_licencia - CURRENT_DATE) as dias_restantes,
    CASE 
        WHEN c.fecha_vencimiento_licencia < CURRENT_DATE THEN 'VENCIDA'
        WHEN (c.fecha_vencimiento_licencia - CURRENT_DATE) <= 7 THEN 'CRITICA'
        WHEN (c.fecha_vencimiento_licencia - CURRENT_DATE) <= 30 THEN 'ALERTA'
        ELSE 'NORMAL'
    END as nivel_alerta
FROM conductores c
WHERE c.activo = true
  AND c.fecha_vencimiento_licencia IS NOT NULL
ORDER BY c.fecha_vencimiento_licencia ASC;
