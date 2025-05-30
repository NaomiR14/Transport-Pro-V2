-- =====================================================
-- REPORTE DE INDICADORES POR CONDUCTOR
-- Sistema de Gestión de Transporte
-- =====================================================

-- Tabla para registrar viajes por conductor
CREATE TABLE IF NOT EXISTS viajes_conductor (
    id SERIAL PRIMARY KEY,
    conductor_id INTEGER NOT NULL,
    vehiculo_id INTEGER NOT NULL,
    fecha_viaje DATE NOT NULL,
    origen VARCHAR(255) NOT NULL,
    destino VARCHAR(255) NOT NULL,
    km_recorridos DECIMAL(10,2) NOT NULL,
    carga_transportada DECIMAL(10,2) NOT NULL, -- en kg
    ingresos_viaje DECIMAL(12,2) NOT NULL,
    combustible_consumido DECIMAL(8,2), -- en galones
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_viajes_conductor_conductor 
        FOREIGN KEY (conductor_id) REFERENCES conductores(id),
    CONSTRAINT fk_viajes_conductor_vehiculo 
        FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
    CONSTRAINT chk_km_positivos CHECK (km_recorridos > 0),
    CONSTRAINT chk_carga_positiva CHECK (carga_transportada >= 0),
    CONSTRAINT chk_ingresos_positivos CHECK (ingresos_viaje >= 0)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_viajes_conductor_fecha ON viajes_conductor(fecha_viaje);
CREATE INDEX IF NOT EXISTS idx_viajes_conductor_conductor_id ON viajes_conductor(conductor_id);
CREATE INDEX IF NOT EXISTS idx_viajes_conductor_vehiculo_id ON viajes_conductor(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_viajes_conductor_mes_ano ON viajes_conductor(EXTRACT(YEAR FROM fecha_viaje), EXTRACT(MONTH FROM fecha_viaje));

-- Vista para indicadores mensuales por conductor
CREATE OR REPLACE VIEW vista_indicadores_conductor_mensual AS
SELECT 
    c.id as conductor_id,
    c.nombre as conductor_nombre,
    c.cedula as conductor_cedula,
    EXTRACT(YEAR FROM vc.fecha_viaje) as año,
    EXTRACT(MONTH FROM vc.fecha_viaje) as mes,
    
    -- Totales básicos
    COUNT(vc.id) as numero_viajes,
    COALESCE(SUM(vc.km_recorridos), 0) as km_recorridos,
    COALESCE(SUM(vc.carga_transportada), 0) as carga_transportada,
    COALESCE(SUM(vc.ingresos_viaje), 0) as ingresos,
    
    -- Indicadores calculados
    CASE 
        WHEN COUNT(vc.id) > 0 THEN ROUND(SUM(vc.km_recorridos) / COUNT(vc.id), 2)
        ELSE 0 
    END as km_por_viaje,
    
    CASE 
        WHEN SUM(vc.km_recorridos) > 0 THEN ROUND(SUM(vc.carga_transportada) / SUM(vc.km_recorridos), 2)
        ELSE 0 
    END as carga_por_km,
    
    CASE 
        WHEN COUNT(vc.id) > 0 THEN ROUND(SUM(vc.carga_transportada) / COUNT(vc.id), 2)
        ELSE 0 
    END as carga_por_viaje,
    
    CASE 
        WHEN SUM(vc.km_recorridos) > 0 THEN ROUND(SUM(vc.ingresos_viaje) / SUM(vc.km_recorridos), 2)
        ELSE 0 
    END as ingresos_por_km,
    
    CASE 
        WHEN COUNT(vc.id) > 0 THEN ROUND(SUM(vc.ingresos_viaje) / COUNT(vc.id), 2)
        ELSE 0 
    END as ingresos_por_viaje,
    
    -- Información de multas
    COALESCE(multas_info.numero_multas, 0) as numero_multas,
    COALESCE(multas_info.gastos_por_multas, 0) as gastos_por_multas

FROM conductores c
LEFT JOIN viajes_conductor vc ON c.id = vc.conductor_id
LEFT JOIN (
    SELECT 
        conductor_id,
        EXTRACT(YEAR FROM fecha_infraccion) as año,
        EXTRACT(MONTH FROM fecha_infraccion) as mes,
        COUNT(*) as numero_multas,
        SUM(valor_multa) as gastos_por_multas
    FROM multas_conductores 
    WHERE estado_pago IN ('PENDIENTE', 'PAGADA')
    GROUP BY conductor_id, EXTRACT(YEAR FROM fecha_infraccion), EXTRACT(MONTH FROM fecha_infraccion)
) multas_info ON c.id = multas_info.conductor_id 
    AND EXTRACT(YEAR FROM vc.fecha_viaje) = multas_info.año 
    AND EXTRACT(MONTH FROM vc.fecha_viaje) = multas_info.mes

GROUP BY 
    c.id, c.nombre, c.cedula, 
    EXTRACT(YEAR FROM vc.fecha_viaje), 
    EXTRACT(MONTH FROM vc.fecha_viaje),
    multas_info.numero_multas,
    multas_info.gastos_por_multas

HAVING COUNT(vc.id) > 0 OR COALESCE(multas_info.numero_multas, 0) > 0

ORDER BY 
    EXTRACT(YEAR FROM vc.fecha_viaje) DESC, 
    EXTRACT(MONTH FROM vc.fecha_viaje) DESC, 
    SUM(vc.ingresos_viaje) DESC;

-- Vista para indicadores anuales por conductor
CREATE OR REPLACE VIEW vista_indicadores_conductor_anual AS
SELECT 
    c.id as conductor_id,
    c.nombre as conductor_nombre,
    c.cedula as conductor_cedula,
    EXTRACT(YEAR FROM vc.fecha_viaje) as año,
    
    -- Totales básicos
    COUNT(vc.id) as numero_viajes,
    COALESCE(SUM(vc.km_recorridos), 0) as km_recorridos,
    COALESCE(SUM(vc.carga_transportada), 0) as carga_transportada,
    COALESCE(SUM(vc.ingresos_viaje), 0) as ingresos,
    
    -- Indicadores calculados
    CASE 
        WHEN COUNT(vc.id) > 0 THEN ROUND(SUM(vc.km_recorridos) / COUNT(vc.id), 2)
        ELSE 0 
    END as km_por_viaje,
    
    CASE 
        WHEN SUM(vc.km_recorridos) > 0 THEN ROUND(SUM(vc.carga_transportada) / SUM(vc.km_recorridos), 2)
        ELSE 0 
    END as carga_por_km,
    
    CASE 
        WHEN COUNT(vc.id) > 0 THEN ROUND(SUM(vc.carga_transportada) / COUNT(vc.id), 2)
        ELSE 0 
    END as carga_por_viaje,
    
    CASE 
        WHEN SUM(vc.km_recorridos) > 0 THEN ROUND(SUM(vc.ingresos_viaje) / SUM(vc.km_recorridos), 2)
        ELSE 0 
    END as ingresos_por_km,
    
    CASE 
        WHEN COUNT(vc.id) > 0 THEN ROUND(SUM(vc.ingresos_viaje) / COUNT(vc.id), 2)
        ELSE 0 
    END as ingresos_por_viaje,
    
    -- Información de multas
    COALESCE(multas_info.numero_multas, 0) as numero_multas,
    COALESCE(multas_info.gastos_por_multas, 0) as gastos_por_multas

FROM conductores c
LEFT JOIN viajes_conductor vc ON c.id = vc.conductor_id
LEFT JOIN (
    SELECT 
        conductor_id,
        EXTRACT(YEAR FROM fecha_infraccion) as año,
        COUNT(*) as numero_multas,
        SUM(valor_multa) as gastos_por_multas
    FROM multas_conductores 
    WHERE estado_pago IN ('PENDIENTE', 'PAGADA')
    GROUP BY conductor_id, EXTRACT(YEAR FROM fecha_infraccion)
) multas_info ON c.id = multas_info.conductor_id 
    AND EXTRACT(YEAR FROM vc.fecha_viaje) = multas_info.año

GROUP BY 
    c.id, c.nombre, c.cedula, 
    EXTRACT(YEAR FROM vc.fecha_viaje),
    multas_info.numero_multas,
    multas_info.gastos_por_multas

HAVING COUNT(vc.id) > 0 OR COALESCE(multas_info.numero_multas, 0) > 0

ORDER BY 
    EXTRACT(YEAR FROM vc.fecha_viaje) DESC, 
    SUM(vc.ingresos_viaje) DESC;

-- Vista para ranking de conductores por eficiencia
CREATE OR REPLACE VIEW vista_ranking_conductores AS
SELECT 
    conductor_id,
    conductor_nombre,
    conductor_cedula,
    año,
    numero_viajes,
    km_recorridos,
    carga_transportada,
    ingresos,
    km_por_viaje,
    carga_por_km,
    carga_por_viaje,
    ingresos_por_km,
    ingresos_por_viaje,
    numero_multas,
    gastos_por_multas,
    
    -- Rankings
    RANK() OVER (PARTITION BY año ORDER BY ingresos DESC) as ranking_ingresos,
    RANK() OVER (PARTITION BY año ORDER BY km_recorridos DESC) as ranking_km,
    RANK() OVER (PARTITION BY año ORDER BY numero_viajes DESC) as ranking_viajes,
    RANK() OVER (PARTITION BY año ORDER BY ingresos_por_km DESC) as ranking_eficiencia_ingresos,
    RANK() OVER (PARTITION BY año ORDER BY numero_multas ASC, gastos_por_multas ASC) as ranking_seguridad,
    
    -- Calificación general (promedio de rankings normalizados)
    ROUND(
        (
            (RANK() OVER (PARTITION BY año ORDER BY ingresos DESC) * 0.3) +
            (RANK() OVER (PARTITION BY año ORDER BY ingresos_por_km DESC) * 0.25) +
            (RANK() OVER (PARTITION BY año ORDER BY numero_viajes DESC) * 0.2) +
            (RANK() OVER (PARTITION BY año ORDER BY carga_por_viaje DESC) * 0.15) +
            (RANK() OVER (PARTITION BY año ORDER BY numero_multas ASC, gastos_por_multas ASC) * 0.1)
        ), 2
    ) as calificacion_general

FROM vista_indicadores_conductor_anual
WHERE año IS NOT NULL
ORDER BY año DESC, calificacion_general ASC;

-- Función para obtener indicadores por conductor y período
CREATE OR REPLACE FUNCTION obtener_indicadores_conductor(
    p_conductor_id INTEGER DEFAULT NULL,
    p_año INTEGER DEFAULT NULL,
    p_mes INTEGER DEFAULT NULL
)
RETURNS TABLE (
    conductor_id INTEGER,
    conductor_nombre VARCHAR,
    conductor_cedula VARCHAR,
    periodo VARCHAR,
    numero_viajes BIGINT,
    km_recorridos NUMERIC,
    carga_transportada NUMERIC,
    ingresos NUMERIC,
    km_por_viaje NUMERIC,
    carga_por_km NUMERIC,
    carga_por_viaje NUMERIC,
    ingresos_por_km NUMERIC,
    ingresos_por_viaje NUMERIC,
    numero_multas BIGINT,
    gastos_por_multas NUMERIC
) AS $$
BEGIN
    IF p_mes IS NOT NULL AND p_año IS NOT NULL THEN
        -- Consulta mensual
        RETURN QUERY
        SELECT 
            vic.conductor_id,
            vic.conductor_nombre,
            vic.conductor_cedula,
            CONCAT(vic.año, '-', LPAD(vic.mes::TEXT, 2, '0')) as periodo,
            vic.numero_viajes,
            vic.km_recorridos,
            vic.carga_transportada,
            vic.ingresos,
            vic.km_por_viaje,
            vic.carga_por_km,
            vic.carga_por_viaje,
            vic.ingresos_por_km,
            vic.ingresos_por_viaje,
            vic.numero_multas,
            vic.gastos_por_multas
        FROM vista_indicadores_conductor_mensual vic
        WHERE (p_conductor_id IS NULL OR vic.conductor_id = p_conductor_id)
          AND vic.año = p_año
          AND vic.mes = p_mes
        ORDER BY vic.ingresos DESC;
        
    ELSIF p_año IS NOT NULL THEN
        -- Consulta anual
        RETURN QUERY
        SELECT 
            via.conductor_id,
            via.conductor_nombre,
            via.conductor_cedula,
            via.año::TEXT as periodo,
            via.numero_viajes,
            via.km_recorridos,
            via.carga_transportada,
            via.ingresos,
            via.km_por_viaje,
            via.carga_por_km,
            via.carga_por_viaje,
            via.ingresos_por_km,
            via.ingresos_por_viaje,
            via.numero_multas,
            via.gastos_por_multas
        FROM vista_indicadores_conductor_anual via
        WHERE (p_conductor_id IS NULL OR via.conductor_id = p_conductor_id)
          AND via.año = p_año
        ORDER BY via.ingresos DESC;
        
    ELSE
        -- Consulta general (último año disponible)
        RETURN QUERY
        SELECT 
            via.conductor_id,
            via.conductor_nombre,
            via.conductor_cedula,
            'General' as periodo,
            via.numero_viajes,
            via.km_recorridos,
            via.carga_transportada,
            via.ingresos,
            via.km_por_viaje,
            via.carga_por_km,
            via.carga_por_viaje,
            via.ingresos_por_km,
            via.ingresos_por_viaje,
            via.numero_multas,
            via.gastos_por_multas
        FROM vista_indicadores_conductor_anual via
        WHERE (p_conductor_id IS NULL OR via.conductor_id = p_conductor_id)
          AND via.año = (SELECT MAX(año) FROM vista_indicadores_conductor_anual)
        ORDER BY via.ingresos DESC;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION actualizar_timestamp_viajes_conductor()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_timestamp_viajes_conductor
    BEFORE UPDATE ON viajes_conductor
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp_viajes_conductor();

-- Insertar datos de ejemplo para viajes de conductores
INSERT INTO viajes_conductor (conductor_id, vehiculo_id, fecha_viaje, origen, destino, km_recorridos, carga_transportada, ingresos_viaje, combustible_consumido, observaciones) VALUES
-- Carlos Rodríguez (conductor_id: 1)
(1, 1, '2024-01-15', 'Bogotá', 'Medellín', 415.5, 2500.00, 850000, 45.2, 'Viaje sin novedad'),
(1, 1, '2024-01-18', 'Medellín', 'Cali', 424.8, 2200.00, 780000, 48.1, 'Entrega exitosa'),
(1, 2, '2024-01-22', 'Cali', 'Barranquilla', 612.3, 3000.00, 1200000, 68.5, 'Carga completa'),
(1, 1, '2024-01-25', 'Barranquilla', 'Cartagena', 106.2, 1800.00, 450000, 12.8, 'Viaje corto'),
(1, 2, '2024-01-28', 'Cartagena', 'Bogotá', 657.1, 2800.00, 1100000, 72.3, 'Retorno a base'),

-- María González (conductor_id: 2)
(2, 3, '2024-01-16', 'Bogotá', 'Bucaramanga', 347.2, 2100.00, 720000, 38.9, 'Viaje programado'),
(2, 3, '2024-01-19', 'Bucaramanga', 'Cúcuta', 195.4, 1500.00, 480000, 22.1, 'Frontera'),
(2, 4, '2024-01-23', 'Cúcuta', 'Medellín', 562.8, 2600.00, 950000, 61.7, 'Carga pesada'),
(2, 3, '2024-01-26', 'Medellín', 'Pereira', 214.5, 1900.00, 580000, 24.3, 'Eje cafetero'),
(2, 4, '2024-01-29', 'Pereira', 'Bogotá', 263.7, 2000.00, 650000, 29.8, 'Regreso'),

-- José Martínez (conductor_id: 3)
(3, 5, '2024-01-17', 'Bogotá', 'Villavicencio', 118.6, 3200.00, 520000, 14.2, 'Llanos orientales'),
(3, 5, '2024-01-20', 'Villavicencio', 'Yopal', 347.9, 2900.00, 890000, 39.1, 'Casanare'),
(3, 6, '2024-01-24', 'Yopal', 'Arauca', 267.3, 2400.00, 750000, 30.5, 'Frontera venezolana'),
(3, 5, '2024-01-27', 'Arauca', 'Bogotá', 733.8, 3100.00, 1350000, 81.2, 'Viaje largo'),
(3, 6, '2024-01-30', 'Bogotá', 'Ibagué', 203.4, 2200.00, 580000, 23.1, 'Tolima'),

-- Ana López (conductor_id: 4)
(4, 7, '2024-01-14', 'Bogotá', 'Neiva', 288.7, 2300.00, 680000, 32.4, 'Huila'),
(4, 7, '2024-01-21', 'Neiva', 'Florencia', 242.1, 2000.00, 620000, 27.8, 'Caquetá'),
(4, 8, '2024-01-25', 'Florencia', 'Mocoa', 198.5, 1800.00, 550000, 23.2, 'Putumayo'),
(4, 7, '2024-01-28', 'Mocoa', 'Pasto', 147.3, 1600.00, 480000, 17.1, 'Nariño'),
(4, 8, '2024-01-31', 'Pasto', 'Bogotá', 539.2, 2700.00, 1050000, 59.8, 'Retorno largo'),

-- Pedro Sánchez (conductor_id: 5)
(5, 9, '2024-01-13', 'Bogotá', 'Tunja', 137.4, 1900.00, 420000, 16.2, 'Boyacá'),
(5, 9, '2024-01-17', 'Tunja', 'Sogamoso', 89.3, 1500.00, 320000, 10.8, 'Viaje corto'),
(5, 10, '2024-01-20', 'Sogamoso', 'Duitama', 23.7, 1200.00, 180000, 3.1, 'Muy corto'),
(5, 9, '2024-01-24', 'Duitama', 'Chiquinquirá', 78.9, 1400.00, 290000, 9.4, 'Ruta local'),
(5, 10, '2024-01-27', 'Chiquinquirá', 'Bogotá', 134.2, 1700.00, 380000, 15.8, 'Regreso a base');

-- Comentarios sobre el esquema
COMMENT ON TABLE viajes_conductor IS 'Registro de viajes realizados por cada conductor';
COMMENT ON VIEW vista_indicadores_conductor_mensual IS 'Indicadores de rendimiento por conductor agrupados por mes';
COMMENT ON VIEW vista_indicadores_conductor_anual IS 'Indicadores de rendimiento por conductor agrupados por año';
COMMENT ON VIEW vista_ranking_conductores IS 'Ranking de conductores basado en múltiples criterios de rendimiento';
COMMENT ON FUNCTION obtener_indicadores_conductor IS 'Función para obtener indicadores filtrados por conductor y período';
