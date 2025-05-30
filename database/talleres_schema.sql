/*
# Maintenance Workshops Schema Extension

Add workshop/service center management to the existing transport management system
*/

-- Create workshops table
CREATE TABLE IF NOT EXISTS talleres_mantenimiento (
    taller_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_taller text UNIQUE NOT NULL,
    nombre_taller text NOT NULL,
    direccion text NOT NULL,
    telefono text NOT NULL,
    correo text NOT NULL,
    contacto_principal text NOT NULL,
    telefono_contacto text NOT NULL,
    sitio_web text,
    horario_atencion text NOT NULL,
    calificacion decimal(2,1) DEFAULT 0.0,
    activo boolean DEFAULT true,
    notas text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT check_calificacion_taller CHECK (calificacion >= 0 AND calificacion <= 5),
    CONSTRAINT check_correo_valido CHECK (correo ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create workshop specialties table
CREATE TABLE IF NOT EXISTS especialidades_taller (
    especialidad_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    taller_id uuid REFERENCES talleres_mantenimiento(taller_id) ON DELETE CASCADE,
    nombre_especialidad text NOT NULL,
    descripcion text,
    activa boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    
    UNIQUE(taller_id, nombre_especialidad)
);

-- Create workshop services table
CREATE TABLE IF NOT EXISTS servicios_taller (
    servicio_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    taller_id uuid REFERENCES talleres_mantenimiento(taller_id) ON DELETE CASCADE,
    nombre_servicio text NOT NULL,
    descripcion text,
    precio_estimado decimal(10,2),
    tiempo_estimado_horas integer,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Update existing mantenimientos table to reference workshops
ALTER TABLE mantenimientos 
ADD COLUMN IF NOT EXISTS taller_id uuid REFERENCES talleres_mantenimiento(taller_id),
ADD COLUMN IF NOT EXISTS servicio_realizado text,
ADD COLUMN IF NOT EXISTS tecnico_asignado text,
ADD COLUMN IF NOT EXISTS calificacion_servicio decimal(2,1),
ADD COLUMN IF NOT EXISTS comentarios_cliente text;

-- Create workshop evaluations table
CREATE TABLE IF NOT EXISTS evaluaciones_taller (
    evaluacion_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    taller_id uuid REFERENCES talleres_mantenimiento(taller_id) ON DELETE CASCADE,
    mantenimiento_id uuid REFERENCES mantenimientos(mantenimiento_id),
    calificacion decimal(2,1) NOT NULL,
    comentarios text,
    fecha_evaluacion timestamptz DEFAULT now(),
    evaluado_por text,
    created_at timestamptz DEFAULT now(),
    
    CONSTRAINT check_calificacion_evaluacion_taller CHECK (calificacion >= 0 AND calificacion <= 5)
);

-- Insert sample workshop specialties
INSERT INTO tipos_vehiculo (nombre, descripcion) VALUES
('Motor', 'Reparación y mantenimiento de motores'),
('Transmisión', 'Servicios de transmisión automática y manual'),
('Frenos', 'Sistema de frenos y componentes'),
('Suspensión', 'Amortiguadores y sistema de suspensión'),
('Eléctrico', 'Sistema eléctrico y electrónico'),
('Aire Acondicionado', 'Climatización vehicular'),
('Diagnóstico', 'Diagnóstico computarizado'),
('Carrocería', 'Reparación de carrocería'),
('Pintura', 'Servicios de pintura automotriz'),
('Soldadura', 'Trabajos de soldadura'),
('Llantas', 'Venta y montaje de llantas'),
('Alineación', 'Alineación y balanceo'),
('Motor Diesel', 'Especialista en motores diesel'),
('Inyección', 'Sistema de inyección'),
('Turbo', 'Turbocargadores')
ON CONFLICT (nombre) DO NOTHING;

-- Function to calculate workshop average rating
CREATE OR REPLACE FUNCTION calculate_workshop_rating(p_taller_id uuid)
RETURNS decimal(2,1) AS $$
DECLARE
    avg_rating decimal(2,1);
BEGIN
    SELECT COALESCE(AVG(calificacion), 0.0)
    INTO avg_rating
    FROM evaluaciones_taller
    WHERE taller_id = p_taller_id;
    
    -- Update workshop's rating
    UPDATE talleres_mantenimiento 
    SET calificacion = avg_rating,
        updated_at = now()
    WHERE taller_id = p_taller_id;
    
    RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update workshop rating when evaluation is added
CREATE OR REPLACE FUNCTION update_workshop_rating_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM calculate_workshop_rating(OLD.taller_id);
        RETURN OLD;
    ELSE
        PERFORM calculate_workshop_rating(NEW.taller_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_workshop_rating
    AFTER INSERT OR UPDATE OR DELETE ON evaluaciones_taller
    FOR EACH ROW
    EXECUTE FUNCTION update_workshop_rating_trigger();

-- Function to generate workshop numbers automatically
CREATE OR REPLACE FUNCTION generate_workshop_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number integer;
    new_number text;
BEGIN
    IF NEW.numero_taller IS NULL OR NEW.numero_taller = '' THEN
        SELECT COALESCE(MAX(CAST(SUBSTRING(numero_taller FROM 'TALL-(\d+)') AS integer)), 0) + 1
        INTO next_number
        FROM talleres_mantenimiento
        WHERE numero_taller ~ '^TALL-\d+$';
        
        new_number := 'TALL-' || LPAD(next_number::text, 3, '0');
        NEW.numero_taller := new_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_workshop_number
    BEFORE INSERT ON talleres_mantenimiento
    FOR EACH ROW
    EXECUTE FUNCTION generate_workshop_number();

-- Enable Row Level Security
ALTER TABLE talleres_mantenimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE especialidades_taller ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_taller ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones_taller ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON talleres_mantenimiento
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON especialidades_taller
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON servicios_taller
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON evaluaciones_taller
    FOR SELECT TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_talleres_numero ON talleres_mantenimiento(numero_taller);
CREATE INDEX IF NOT EXISTS idx_talleres_activo ON talleres_mantenimiento(activo);
CREATE INDEX IF NOT EXISTS idx_talleres_calificacion ON talleres_mantenimiento(calificacion);
CREATE INDEX IF NOT EXISTS idx_especialidades_taller ON especialidades_taller(taller_id);
CREATE INDEX IF NOT EXISTS idx_servicios_taller ON servicios_taller(taller_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_taller ON evaluaciones_taller(taller_id);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_taller ON mantenimientos(taller_id);

-- Create comprehensive view for workshop dashboard
CREATE OR REPLACE VIEW vista_talleres_dashboard AS
SELECT 
    t.taller_id,
    t.numero_taller,
    t.nombre_taller,
    t.direccion,
    t.telefono,
    t.correo,
    t.contacto_principal,
    t.telefono_contacto,
    t.sitio_web,
    t.horario_atencion,
    t.calificacion,
    t.activo,
    t.notas,
    COUNT(DISTINCT et.especialidad_id) as total_especialidades,
    COUNT(DISTINCT m.mantenimiento_id) as total_mantenimientos,
    COUNT(CASE WHEN m.estado = 'completado' THEN 1 END) as mantenimientos_completados,
    COUNT(DISTINCT ev.evaluacion_id) as total_evaluaciones,
    COALESCE(AVG(ev.calificacion), 0) as calificacion_promedio,
    ARRAY_AGG(DISTINCT et.nombre_especialidad) FILTER (WHERE et.nombre_especialidad IS NOT NULL) as especialidades
FROM talleres_mantenimiento t
LEFT JOIN especialidades_taller et ON t.taller_id = et.taller_id AND et.activa = true
LEFT JOIN mantenimientos m ON t.taller_id = m.taller_id
LEFT JOIN evaluaciones_taller ev ON t.taller_id = ev.taller_id
GROUP BY t.taller_id, t.numero_taller, t.nombre_taller, t.direccion, t.telefono, 
         t.correo, t.contacto_principal, t.telefono_contacto, t.sitio_web, 
         t.horario_atencion, t.calificacion, t.activo, t.notas
ORDER BY t.numero_taller;

-- Create view for workshop performance metrics
CREATE OR REPLACE VIEW vista_rendimiento_talleres AS
SELECT 
    t.taller_id,
    t.numero_taller,
    t.nombre_taller,
    t.calificacion,
    COUNT(m.mantenimiento_id) as total_servicios,
    COUNT(CASE WHEN m.estado = 'completado' THEN 1 END) as servicios_completados,
    COUNT(CASE WHEN m.estado = 'en_proceso' THEN 1 END) as servicios_en_proceso,
    ROUND(
        (COUNT(CASE WHEN m.estado = 'completado' THEN 1 END)::decimal / 
         NULLIF(COUNT(m.mantenimiento_id), 0)) * 100, 2
    ) as porcentaje_completados,
    AVG(CASE WHEN m.fecha_fin IS NOT NULL AND m.fecha_inicio IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (m.fecha_fin - m.fecha_inicio))/3600 
        END) as tiempo_promedio_horas,
    SUM(m.costo) as ingresos_totales
FROM talleres_mantenimiento t
LEFT JOIN mantenimientos m ON t.taller_id = m.taller_id
WHERE t.activo = true
GROUP BY t.taller_id, t.numero_taller, t.nombre_taller, t.calificacion
ORDER BY t.calificacion DESC, servicios_completados DESC;
