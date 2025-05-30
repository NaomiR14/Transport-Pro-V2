/*
# Travel Routes Schema Extension

Add travel routes management to the existing transport management system
*/

-- Create travel routes table
CREATE TABLE IF NOT EXISTS rutas_viaje (
    ruta_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha_salida date NOT NULL,
    fecha_llegada date NOT NULL,
    vehiculo_id uuid REFERENCES vehiculos(vehiculo_id),
    conductor_id uuid REFERENCES conductores(conductor_id),
    origen text NOT NULL,
    destino text NOT NULL,
    kms_inicial integer NOT NULL,
    kms_final integer NOT NULL,
    kms_recorridos integer GENERATED ALWAYS AS (kms_final - kms_inicial) STORED,
    peso_carga_kg decimal(10,2) NOT NULL,
    costo_por_kg decimal(10,2) NOT NULL,
    ingreso_total decimal(12,2) GENERATED ALWAYS AS (peso_carga_kg * costo_por_kg) STORED,
    estacion_combustible text NOT NULL,
    tipo_combustible text NOT NULL,
    volumen_combustible_gal decimal(10,2) NOT NULL,
    precio_por_galon decimal(10,2) NOT NULL,
    total_combustible decimal(12,2) GENERATED ALWAYS AS (volumen_combustible_gal * precio_por_galon) STORED,
    gasto_peajes decimal(10,2) DEFAULT 0,
    gasto_comidas decimal(10,2) DEFAULT 0,
    otros_gastos decimal(10,2) DEFAULT 0,
    gasto_total decimal(12,2) GENERATED ALWAYS AS (total_combustible + gasto_peajes + gasto_comidas + otros_gastos) STORED,
    recorrido_por_galon decimal(10,2) GENERATED ALWAYS AS (
        CASE 
            WHEN volumen_combustible_gal > 0 THEN (kms_final - kms_inicial) / volumen_combustible_gal
            ELSE 0
        END
    ) STORED,
    ingreso_por_km decimal(10,2) GENERATED ALWAYS AS (
        CASE 
            WHEN (kms_final - kms_inicial) > 0 THEN (peso_carga_kg * costo_por_kg) / (kms_final - kms_inicial)
            ELSE 0
        END
    ) STORED,
    observaciones text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT check_fechas_validas CHECK (fecha_llegada >= fecha_salida),
    CONSTRAINT check_kms_validos CHECK (kms_final > kms_inicial),
    CONSTRAINT check_peso_positivo CHECK (peso_carga_kg > 0),
    CONSTRAINT check_costo_positivo CHECK (costo_por_kg > 0),
    CONSTRAINT check_combustible_positivo CHECK (volumen_combustible_gal > 0),
    CONSTRAINT check_precio_galon_positivo CHECK (precio_por_galon > 0),
    CONSTRAINT check_gastos_no_negativos CHECK (gasto_peajes >= 0 AND gasto_comidas >= 0 AND otros_gastos >= 0)
);

-- Create fuel stations catalog
CREATE TABLE IF NOT EXISTS estaciones_combustible (
    estacion_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre text UNIQUE NOT NULL,
    direccion text,
    ciudad text,
    estado text,
    telefono text,
    activa boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Insert common fuel stations
INSERT INTO estaciones_combustible (nombre, ciudad, estado) VALUES
('Pemex Reforma', 'Ciudad de México', 'CDMX'),
('Shell Constitución', 'Monterrey', 'Nuevo León'),
('BP Central', 'Guadalajara', 'Jalisco'),
('Mobil Norte', 'Tijuana', 'Baja California'),
('Total Sur', 'Mérida', 'Yucatán'),
('Chevron Oriente', 'Veracruz', 'Veracruz'),
('Pemex Autopista', 'Puebla', 'Puebla'),
('Shell Express', 'León', 'Guanajuato')
ON CONFLICT (nombre) DO NOTHING;

-- Function to update vehicle odometer after route completion
CREATE OR REPLACE FUNCTION update_vehicle_odometer()
RETURNS TRIGGER AS $$
BEGIN
    -- Update vehicle's current odometer reading
    UPDATE vehiculos 
    SET odometro_actual = NEW.kms_final,
        updated_at = now()
    WHERE vehiculo_id = NEW.vehiculo_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update vehicle odometer
CREATE TRIGGER trg_update_vehicle_odometer
    AFTER INSERT OR UPDATE ON rutas_viaje
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicle_odometer();

-- Function to calculate route efficiency metrics
CREATE OR REPLACE FUNCTION calculate_route_efficiency(p_ruta_id uuid)
RETURNS TABLE (
    utilidad decimal(12,2),
    margen_utilidad decimal(5,2),
    costo_por_km decimal(10,2),
    eficiencia_combustible text
) AS $$
DECLARE
    route_record RECORD;
BEGIN
    SELECT 
        ingreso_total,
        gasto_total,
        kms_recorridos,
        recorrido_por_galon
    INTO route_record
    FROM rutas_viaje
    WHERE ruta_id = p_ruta_id;
    
    IF route_record IS NOT NULL THEN
        utilidad := route_record.ingreso_total - route_record.gasto_total;
        margen_utilidad := CASE 
            WHEN route_record.ingreso_total > 0 THEN 
                (utilidad / route_record.ingreso_total) * 100
            ELSE 0
        END;
        costo_por_km := CASE 
            WHEN route_record.kms_recorridos > 0 THEN 
                route_record.gasto_total / route_record.kms_recorridos
            ELSE 0
        END;
        eficiencia_combustible := CASE 
            WHEN route_record.recorrido_por_galon >= 5.0 THEN 'Excelente'
            WHEN route_record.recorrido_por_galon >= 4.0 THEN 'Buena'
            WHEN route_record.recorrido_por_galon >= 3.0 THEN 'Regular'
            ELSE 'Deficiente'
        END;
    END IF;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE rutas_viaje ENABLE ROW LEVEL SECURITY;
ALTER TABLE estaciones_combustible ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON rutas_viaje
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON estaciones_combustible
    FOR SELECT TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rutas_fecha_salida ON rutas_viaje(fecha_salida);
CREATE INDEX IF NOT EXISTS idx_rutas_vehiculo ON rutas_viaje(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_rutas_conductor ON rutas_viaje(conductor_id);
CREATE INDEX IF NOT EXISTS idx_rutas_origen_destino ON rutas_viaje(origen, destino);
CREATE INDEX IF NOT EXISTS idx_rutas_ingreso_total ON rutas_viaje(ingreso_total);
CREATE INDEX IF NOT EXISTS idx_rutas_gasto_total ON rutas_viaje(gasto_total);

-- Create comprehensive view for routes dashboard
CREATE OR REPLACE VIEW vista_rutas_dashboard AS
SELECT 
    rv.ruta_id,
    rv.fecha_salida,
    rv.fecha_llegada,
    v.placa as placa_vehiculo,
    v.estado as estado_vehiculo,
    c.nombre as conductor,
    rv.origen,
    rv.destino,
    rv.kms_inicial,
    rv.kms_final,
    rv.kms_recorridos,
    rv.peso_carga_kg,
    rv.costo_por_kg,
    rv.ingreso_total,
    rv.estacion_combustible,
    rv.tipo_combustible,
    rv.volumen_combustible_gal,
    rv.precio_por_galon,
    rv.total_combustible,
    rv.gasto_peajes,
    rv.gasto_comidas,
    rv.otros_gastos,
    rv.gasto_total,
    rv.recorrido_por_galon,
    rv.ingreso_por_km,
    (rv.ingreso_total - rv.gasto_total) as utilidad,
    CASE 
        WHEN rv.ingreso_total > 0 THEN 
            ROUND(((rv.ingreso_total - rv.gasto_total) / rv.ingreso_total) * 100, 2)
        ELSE 0
    END as margen_utilidad_porcentaje,
    rv.observaciones
FROM rutas_viaje rv
LEFT JOIN vehiculos v ON rv.vehiculo_id = v.vehiculo_id
LEFT JOIN conductores c ON rv.conductor_id = c.conductor_id
ORDER BY rv.fecha_salida DESC;

-- Create summary view by vehicle
CREATE OR REPLACE VIEW vista_resumen_rutas_vehiculo AS
SELECT 
    v.vehiculo_id,
    v.numero_interno,
    v.placa,
    COUNT(rv.ruta_id) as total_rutas,
    SUM(rv.kms_recorridos) as total_kms_recorridos,
    SUM(rv.ingreso_total) as total_ingresos,
    SUM(rv.gasto_total) as total_gastos,
    SUM(rv.ingreso_total - rv.gasto_total) as utilidad_total,
    AVG(rv.recorrido_por_galon) as promedio_km_por_galon,
    AVG(rv.ingreso_por_km) as promedio_ingreso_por_km
FROM vehiculos v
LEFT JOIN rutas_viaje rv ON v.vehiculo_id = rv.vehiculo_id
GROUP BY v.vehiculo_id, v.numero_interno, v.placa
ORDER BY v.numero_interno;

-- Create summary view by driver
CREATE OR REPLACE VIEW vista_resumen_rutas_conductor AS
SELECT 
    c.conductor_id,
    c.numero_conductor,
    c.nombre,
    COUNT(rv.ruta_id) as total_rutas,
    SUM(rv.kms_recorridos) as total_kms_recorridos,
    SUM(rv.ingreso_total) as total_ingresos,
    SUM(rv.gasto_total) as total_gastos,
    SUM(rv.ingreso_total - rv.gasto_total) as utilidad_total,
    AVG(rv.recorrido_por_galon) as promedio_km_por_galon
FROM conductores c
LEFT JOIN rutas_viaje rv ON c.conductor_id = rv.conductor_id
GROUP BY c.conductor_id, c.numero_conductor, c.nombre
ORDER BY c.numero_conductor;
