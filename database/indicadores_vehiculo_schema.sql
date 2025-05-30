-- Vehicle Indicators Schema
-- Comprehensive database schema for vehicle performance indicators and reporting

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for vehicle indicators
CREATE TYPE tipo_mantenimiento AS ENUM ('preventivo', 'correctivo', 'emergencia');
CREATE TYPE estado_viaje AS ENUM ('programado', 'en_curso', 'completado', 'cancelado');

-- Vehicle Performance Tracking Tables
CREATE TABLE IF NOT EXISTS viajes_vehiculo (
    viaje_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehiculo_id uuid REFERENCES vehiculos(vehiculo_id),
    conductor_id uuid REFERENCES conductores(conductor_id),
    fecha_inicio timestamptz NOT NULL,
    fecha_fin timestamptz,
    origen text NOT NULL,
    destino text NOT NULL,
    km_inicial integer NOT NULL,
    km_final integer,
    km_recorridos integer GENERATED ALWAYS AS (km_final - km_inicial) STORED,
    carga_kg decimal(10,2) NOT NULL DEFAULT 0,
    ingreso_viaje decimal(10,2) NOT NULL DEFAULT 0,
    gasto_combustible decimal(10,2) NOT NULL DEFAULT 0,
    gasto_peajes decimal(10,2) NOT NULL DEFAULT 0,
    gasto_comidas decimal(10,2) NOT NULL DEFAULT 0,
    otros_gastos decimal(10,2) NOT NULL DEFAULT 0,
    gasto_total decimal(10,2) GENERATED ALWAYS AS (
        gasto_combustible + gasto_peajes + gasto_comidas + otros_gastos
    ) STORED,
    utilidad decimal(10,2) GENERATED ALWAYS AS (
        ingreso_viaje - (gasto_combustible + gasto_peajes + gasto_comidas + otros_gastos)
    ) STORED,
    litros_combustible decimal(8,2) NOT NULL DEFAULT 0,
    estado estado_viaje DEFAULT 'programado',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT valid_km_range CHECK (km_final >= km_inicial),
    CONSTRAINT valid_dates CHECK (fecha_fin >= fecha_inicio OR fecha_fin IS NULL),
    CONSTRAINT positive_amounts CHECK (
        carga_kg >= 0 AND ingreso_viaje >= 0 AND 
        gasto_combustible >= 0 AND gasto_peajes >= 0 AND 
        gasto_comidas >= 0 AND otros_gastos >= 0 AND litros_combustible >= 0
    )
);

-- Maintenance Records for Indicators
CREATE TABLE IF NOT EXISTS mantenimientos_vehiculo_detalle (
    mantenimiento_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehiculo_id uuid REFERENCES vehiculos(vehiculo_id),
    fecha_mantenimiento timestamptz NOT NULL,
    tipo_mantenimiento tipo_mantenimiento NOT NULL,
    km_vehiculo integer NOT NULL,
    descripcion text,
    costo decimal(10,2) NOT NULL DEFAULT 0,
    taller_id uuid REFERENCES talleres_mantenimiento(taller_id),
    proximo_mantenimiento_km integer,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT positive_cost CHECK (costo >= 0),
    CONSTRAINT positive_km CHECK (km_vehiculo >= 0)
);

-- Fuel Consumption Tracking
CREATE TABLE IF NOT EXISTS consumo_combustible (
    consumo_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehiculo_id uuid REFERENCES vehiculos(vehiculo_id),
    viaje_id uuid REFERENCES viajes_vehiculo(viaje_id),
    fecha_carga timestamptz NOT NULL,
    litros decimal(8,2) NOT NULL,
    precio_por_litro decimal(6,2) NOT NULL,
    costo_total decimal(10,2) GENERATED ALWAYS AS (litros * precio_por_litro) STORED,
    km_vehiculo integer NOT NULL,
    estacion_servicio text,
    created_at timestamptz DEFAULT now(),
    
    CONSTRAINT positive_fuel CHECK (litros > 0 AND precio_por_litro > 0),
    CONSTRAINT positive_km CHECK (km_vehiculo >= 0)
);

-- Vehicle Indicators Summary View
CREATE OR REPLACE VIEW vista_indicadores_vehiculo AS
SELECT 
    v.vehiculo_id,
    v.placa,
    v.numero_interno,
    mv.nombre as marca,
    v.modelo,
    EXTRACT(YEAR FROM vv.fecha_inicio) as anio,
    
    -- Totales
    COUNT(vv.viaje_id) as numero_viajes,
    COALESCE(SUM(vv.km_recorridos), 0) as km_recorridos,
    COALESCE(SUM(vv.ingreso_viaje), 0) as ingresos_total,
    COALESCE(SUM(vv.gasto_total), 0) as gastos_total,
    COALESCE(SUM(vv.gasto_combustible), 0) as combustible_total,
    COALESCE(SUM(vv.carga_kg), 0) as carga_transportada,
    COALESCE(COUNT(mv_det.mantenimiento_id), 0) as total_mantenimientos,
    COALESCE(COUNT(mv_det.mantenimiento_id) FILTER (WHERE mv_det.tipo_mantenimiento = 'preventivo'), 0) as mantenimientos_preventivos,
    COALESCE(COUNT(mv_det.mantenimiento_id) FILTER (WHERE mv_det.tipo_mantenimiento = 'correctivo'), 0) as mantenimientos_correctivos,
    
    -- Indicadores de transporte
    CASE 
        WHEN SUM(vv.litros_combustible) > 0 
        THEN ROUND((SUM(vv.km_recorridos)::decimal / SUM(vv.litros_combustible) * 3.78541), 2)
        ELSE 0 
    END as km_por_galon,
    
    CASE 
        WHEN COUNT(vv.viaje_id) > 0 
        THEN ROUND((SUM(vv.km_recorridos)::decimal / COUNT(vv.viaje_id)), 2)
        ELSE 0 
    END as km_por_viaje,
    
    CASE 
        WHEN COUNT(mv_det.mantenimiento_id) > 0 
        THEN ROUND((SUM(vv.km_recorridos)::decimal / COUNT(mv_det.mantenimiento_id)), 2)
        ELSE 0 
    END as km_por_mantenimiento,
    
    CASE 
        WHEN COUNT(vv.viaje_id) > 0 
        THEN ROUND((SUM(vv.carga_kg)::decimal / COUNT(vv.viaje_id)), 2)
        ELSE 0 
    END as carga_media_viaje,
    
    -- Indicadores financieros
    CASE 
        WHEN COUNT(vv.viaje_id) > 0 
        THEN ROUND((SUM(vv.ingreso_viaje)::decimal / COUNT(vv.viaje_id)), 2)
        ELSE 0 
    END as ingreso_medio_viaje,
    
    CASE 
        WHEN COUNT(vv.viaje_id) > 0 
        THEN ROUND((SUM(vv.gasto_total)::decimal / COUNT(vv.viaje_id)), 2)
        ELSE 0 
    END as gasto_medio_viaje,
    
    CASE 
        WHEN SUM(vv.km_recorridos) > 0 
        THEN ROUND((SUM(vv.ingreso_viaje)::decimal / SUM(vv.km_recorridos)), 2)
        ELSE 0 
    END as ingresos_por_km,
    
    CASE 
        WHEN SUM(vv.km_recorridos) > 0 
        THEN ROUND((SUM(vv.gasto_total)::decimal / SUM(vv.km_recorridos)), 2)
        ELSE 0 
    END as gastos_por_km,
    
    CASE 
        WHEN COUNT(vv.viaje_id) > 0 
        THEN ROUND((SUM(vv.utilidad)::decimal / COUNT(vv.viaje_id)), 2)
        ELSE 0 
    END as utilidad_media_viaje,
    
    CASE 
        WHEN SUM(vv.km_recorridos) > 0 
        THEN ROUND((SUM(vv.utilidad)::decimal / SUM(vv.km_recorridos)), 2)
        ELSE 0 
    END as utilidad_media_km,
    
    CASE 
        WHEN SUM(vv.ingreso_viaje) > 0 
        THEN ROUND(((SUM(vv.utilidad)::decimal / SUM(vv.ingreso_viaje)) * 100), 2)
        ELSE 0 
    END as margen_bruto_porcentaje

FROM vehiculos v
LEFT JOIN marcas_vehiculo mv ON v.marca_id = mv.marca_id
LEFT JOIN viajes_vehiculo vv ON v.vehiculo_id = vv.vehiculo_id
LEFT JOIN mantenimientos_vehiculo_detalle mv_det ON v.vehiculo_id = mv_det.vehiculo_id 
    AND EXTRACT(YEAR FROM mv_det.fecha_mantenimiento) = EXTRACT(YEAR FROM vv.fecha_inicio)
GROUP BY 
    v.vehiculo_id, v.placa, v.numero_interno, mv.nombre, v.modelo, 
    EXTRACT(YEAR FROM vv.fecha_inicio);

-- Monthly Performance Summary View
CREATE OR REPLACE VIEW vista_rendimiento_mensual AS
SELECT 
    v.vehiculo_id,
    v.placa,
    EXTRACT(YEAR FROM vv.fecha_inicio) as anio,
    EXTRACT(MONTH FROM vv.fecha_inicio) as mes,
    COUNT(vv.viaje_id) as viajes_mes,
    SUM(vv.km_recorridos) as km_mes,
    SUM(vv.ingreso_viaje) as ingresos_mes,
    SUM(vv.gasto_total) as gastos_mes,
    SUM(vv.utilidad) as utilidad_mes,
    AVG(vv.km_recorridos) as km_promedio_viaje,
    SUM(vv.litros_combustible) as litros_mes,
    CASE 
        WHEN SUM(vv.litros_combustible) > 0 
        THEN ROUND((SUM(vv.km_recorridos)::decimal / SUM(vv.litros_combustible) * 3.78541), 2)
        ELSE 0 
    END as rendimiento_mes
FROM vehiculos v
LEFT JOIN viajes_vehiculo vv ON v.vehiculo_id = vv.vehiculo_id
WHERE vv.estado = 'completado'
GROUP BY 
    v.vehiculo_id, v.placa, 
    EXTRACT(YEAR FROM vv.fecha_inicio), 
    EXTRACT(MONTH FROM vv.fecha_inicio)
ORDER BY anio DESC, mes DESC;

-- Fleet Performance Dashboard View
CREATE OR REPLACE VIEW vista_dashboard_flota AS
SELECT 
    EXTRACT(YEAR FROM vv.fecha_inicio) as anio,
    COUNT(DISTINCT v.vehiculo_id) as vehiculos_activos,
    COUNT(vv.viaje_id) as total_viajes,
    SUM(vv.km_recorridos) as total_km,
    SUM(vv.ingreso_viaje) as total_ingresos,
    SUM(vv.gasto_total) as total_gastos,
    SUM(vv.utilidad) as total_utilidad,
    ROUND(AVG(vv.km_recorridos), 2) as km_promedio_viaje,
    ROUND(AVG(vv.utilidad), 2) as utilidad_promedio_viaje,
    CASE 
        WHEN SUM(vv.ingreso_viaje) > 0 
        THEN ROUND(((SUM(vv.utilidad) / SUM(vv.ingreso_viaje)) * 100), 2)
        ELSE 0 
    END as margen_promedio,
    COUNT(mv.mantenimiento_id) as total_mantenimientos,
    ROUND(AVG(
        CASE 
            WHEN SUM(vv.litros_combustible) > 0 
            THEN (SUM(vv.km_recorridos)::decimal / SUM(vv.litros_combustible) * 3.78541)
            ELSE 0 
        END
    ), 2) as rendimiento_promedio_flota
FROM vehiculos v
LEFT JOIN viajes_vehiculo vv ON v.vehiculo_id = vv.vehiculo_id
LEFT JOIN mantenimientos_vehiculo_detalle mv ON v.vehiculo_id = mv.vehiculo_id 
    AND EXTRACT(YEAR FROM mv.fecha_mantenimiento) = EXTRACT(YEAR FROM vv.fecha_inicio)
WHERE vv.estado = 'completado'
GROUP BY EXTRACT(YEAR FROM vv.fecha_inicio)
ORDER BY anio DESC;

-- Efficiency Benchmarks View
CREATE OR REPLACE VIEW vista_benchmarks_eficiencia AS
SELECT 
    'Excelente' as categoria,
    '>= 7.0' as km_por_galon,
    '>= 30%' as margen_bruto,
    '<= 10000' as km_por_mantenimiento,
    '>= 35000' as carga_media_viaje
UNION ALL
SELECT 
    'Bueno' as categoria,
    '5.5 - 6.9' as km_por_galon,
    '20% - 29%' as margen_bruto,
    '10001 - 15000' as km_por_mantenimiento,
    '25000 - 34999' as carga_media_viaje
UNION ALL
SELECT 
    'Regular' as categoria,
    '4.0 - 5.4' as km_por_galon,
    '10% - 19%' as margen_bruto,
    '15001 - 20000' as km_por_mantenimiento,
    '15000 - 24999' as carga_media_viaje
UNION ALL
SELECT 
    'Deficiente' as categoria,
    '< 4.0' as km_por_galon,
    '< 10%' as margen_bruto,
    '> 20000' as km_por_mantenimiento,
    '< 15000' as carga_media_viaje;

-- Triggers for automatic calculations
CREATE OR REPLACE FUNCTION actualizar_odometro_vehiculo()
RETURNS TRIGGER AS $$
BEGIN
    -- Update vehicle odometer when trip is completed
    IF NEW.estado = 'completado' AND NEW.km_final IS NOT NULL THEN
        UPDATE vehiculos 
        SET odometro_actual = NEW.km_final,
            updated_at = now()
        WHERE vehiculo_id = NEW.vehiculo_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_odometro
    AFTER UPDATE ON viajes_vehiculo
    FOR EACH ROW
    WHEN (NEW.estado = 'completado')
    EXECUTE FUNCTION actualizar_odometro_vehiculo();

-- Function to calculate vehicle efficiency rating
CREATE OR REPLACE FUNCTION calcular_rating_eficiencia(
    p_km_por_galon decimal,
    p_margen_bruto decimal,
    p_km_por_mantenimiento decimal
) RETURNS text AS $$
DECLARE
    rating_score integer := 0;
BEGIN
    -- Score based on fuel efficiency
    IF p_km_por_galon >= 7.0 THEN rating_score := rating_score + 3;
    ELSIF p_km_por_galon >= 5.5 THEN rating_score := rating_score + 2;
    ELSIF p_km_por_galon >= 4.0 THEN rating_score := rating_score + 1;
    END IF;
    
    -- Score based on profit margin
    IF p_margen_bruto >= 30 THEN rating_score := rating_score + 3;
    ELSIF p_margen_bruto >= 20 THEN rating_score := rating_score + 2;
    ELSIF p_margen_bruto >= 10 THEN rating_score := rating_score + 1;
    END IF;
    
    -- Score based on maintenance efficiency
    IF p_km_por_mantenimiento <= 10000 THEN rating_score := rating_score + 3;
    ELSIF p_km_por_mantenimiento <= 15000 THEN rating_score := rating_score + 2;
    ELSIF p_km_por_mantenimiento <= 20000 THEN rating_score := rating_score + 1;
    END IF;
    
    -- Return rating based on total score
    CASE 
        WHEN rating_score >= 8 THEN RETURN 'Excelente';
        WHEN rating_score >= 6 THEN RETURN 'Bueno';
        WHEN rating_score >= 3 THEN RETURN 'Regular';
        ELSE RETURN 'Deficiente';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_viajes_vehiculo_vehiculo_fecha 
    ON viajes_vehiculo(vehiculo_id, fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_viajes_vehiculo_estado 
    ON viajes_vehiculo(estado);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_vehiculo_fecha 
    ON mantenimientos_vehiculo_detalle(vehiculo_id, fecha_mantenimiento);
CREATE INDEX IF NOT EXISTS idx_consumo_combustible_vehiculo 
    ON consumo_combustible(vehiculo_id, fecha_carga);

-- Sample data for testing
INSERT INTO viajes_vehiculo (
    vehiculo_id, conductor_id, fecha_inicio, fecha_fin, origen, destino,
    km_inicial, km_final, carga_kg, ingreso_viaje, gasto_combustible,
    gasto_peajes, gasto_comidas, otros_gastos, litros_combustible, estado
) VALUES 
(
    (SELECT vehiculo_id FROM vehiculos WHERE placa = 'ABC-123' LIMIT 1),
    (SELECT conductor_id FROM conductores LIMIT 1),
    '2024-01-15 08:00:00',
    '2024-01-15 18:00:00',
    'Ciudad de México',
    'Guadalajara',
    120000,
    122800,
    40000,
    65000,
    8500,
    2500,
    800,
    1200,
    180,
    'completado'
),
(
    (SELECT vehiculo_id FROM vehiculos WHERE placa = 'DEF-456' LIMIT 1),
    (SELECT conductor_id FROM conductores LIMIT 1),
    '2024-01-16 06:00:00',
    '2024-01-16 16:30:00',
    'Guadalajara',
    'Monterrey',
    95000,
    97500,
    38000,
    58000,
    7800,
    2200,
    750,
    1100,
    165,
    'completado'
);

-- Enable RLS
ALTER TABLE viajes_vehiculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE mantenimientos_vehiculo_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumo_combustible ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view vehicle trips" ON viajes_vehiculo
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert vehicle trips" ON viajes_vehiculo
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update vehicle trips" ON viajes_vehiculo
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view maintenance records" ON mantenimientos_vehiculo_detalle
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert maintenance records" ON mantenimientos_vehiculo_detalle
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view fuel consumption" ON consumo_combustible
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert fuel consumption" ON consumo_combustible
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
