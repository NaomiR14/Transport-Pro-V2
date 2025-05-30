-- Flujo de Caja Mensual Schema
-- Sistema de Gestión de Transporte

-- Tabla principal de flujo de caja mensual
CREATE TABLE flujo_caja_mensual (
    id SERIAL PRIMARY KEY,
    año INTEGER NOT NULL,
    mes VARCHAR(20) NOT NULL,
    
    -- Ingresos
    ingresos DECIMAL(15,2) NOT NULL DEFAULT 0,
    
    -- Egresos detallados
    personal DECIMAL(15,2) NOT NULL DEFAULT 0,
    seguros DECIMAL(15,2) NOT NULL DEFAULT 0,
    impuestos DECIMAL(15,2) NOT NULL DEFAULT 0,
    multas DECIMAL(15,2) NOT NULL DEFAULT 0,
    mantenimiento DECIMAL(15,2) NOT NULL DEFAULT 0,
    combustible DECIMAL(15,2) NOT NULL DEFAULT 0,
    peaje DECIMAL(15,2) NOT NULL DEFAULT 0,
    comidas DECIMAL(15,2) NOT NULL DEFAULT 0,
    otros_egresos DECIMAL(15,2) NOT NULL DEFAULT 0,
    
    -- Campos calculados
    egresos_totales DECIMAL(15,2) GENERATED ALWAYS AS (
        personal + seguros + impuestos + multas + mantenimiento + 
        combustible + peaje + comidas + otros_egresos
    ) STORED,
    
    utilidad DECIMAL(15,2) GENERATED ALWAYS AS (
        ingresos - (personal + seguros + impuestos + multas + mantenimiento + 
                   combustible + peaje + comidas + otros_egresos)
    ) STORED,
    
    margen_porcentaje DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN ingresos > 0 THEN 
                ((ingresos - (personal + seguros + impuestos + multas + mantenimiento + 
                             combustible + peaje + comidas + otros_egresos)) / ingresos) * 100
            ELSE 0
        END
    ) STORED,
    
    -- Metadatos
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100),
    usuario_actualizacion VARCHAR(100),
    observaciones TEXT,
    
    -- Constraints
    CONSTRAINT uk_flujo_caja_periodo UNIQUE (año, mes),
    CONSTRAINT ck_flujo_caja_año CHECK (año >= 2020 AND año <= 2050),
    CONSTRAINT ck_flujo_caja_mes CHECK (mes IN (
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    )),
    CONSTRAINT ck_flujo_caja_montos_positivos CHECK (
        ingresos >= 0 AND personal >= 0 AND seguros >= 0 AND impuestos >= 0 AND
        multas >= 0 AND mantenimiento >= 0 AND combustible >= 0 AND peaje >= 0 AND
        comidas >= 0 AND otros_egresos >= 0
    )
);

-- Tabla de categorías de egresos (para referencia y reportes)
CREATE TABLE categorias_egresos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    color_hex VARCHAR(7) DEFAULT '#6B7280',
    orden_visualizacion INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar categorías predefinidas
INSERT INTO categorias_egresos (nombre, descripcion, color_hex, orden_visualizacion) VALUES
('Personal', 'Gastos de nómina y personal', '#8B5CF6', 1),
('Seguros', 'Pólizas de seguro vehicular', '#10B981', 2),
('Impuestos', 'Impuestos vehiculares y otros', '#F59E0B', 3),
('Multas', 'Multas de tránsito', '#EF4444', 4),
('Mantenimiento', 'Mantenimiento y reparaciones', '#3B82F6', 5),
('Combustible', 'Gastos de combustible', '#F97316', 6),
('Peaje', 'Gastos de peajes', '#06B6D4', 7),
('Comidas', 'Gastos de alimentación', '#84CC16', 8),
('Otros Egresos', 'Otros gastos operacionales', '#6B7280', 9);

-- Tabla de presupuesto mensual (para comparación)
CREATE TABLE presupuesto_mensual (
    id SERIAL PRIMARY KEY,
    año INTEGER NOT NULL,
    mes VARCHAR(20) NOT NULL,
    
    -- Presupuesto de ingresos
    presupuesto_ingresos DECIMAL(15,2) NOT NULL DEFAULT 0,
    
    -- Presupuesto de egresos por categoría
    presupuesto_personal DECIMAL(15,2) NOT NULL DEFAULT 0,
    presupuesto_seguros DECIMAL(15,2) NOT NULL DEFAULT 0,
    presupuesto_impuestos DECIMAL(15,2) NOT NULL DEFAULT 0,
    presupuesto_multas DECIMAL(15,2) NOT NULL DEFAULT 0,
    presupuesto_mantenimiento DECIMAL(15,2) NOT NULL DEFAULT 0,
    presupuesto_combustible DECIMAL(15,2) NOT NULL DEFAULT 0,
    presupuesto_peaje DECIMAL(15,2) NOT NULL DEFAULT 0,
    presupuesto_comidas DECIMAL(15,2) NOT NULL DEFAULT 0,
    presupuesto_otros_egresos DECIMAL(15,2) NOT NULL DEFAULT 0,
    
    -- Campos calculados
    presupuesto_egresos_totales DECIMAL(15,2) GENERATED ALWAYS AS (
        presupuesto_personal + presupuesto_seguros + presupuesto_impuestos + 
        presupuesto_multas + presupuesto_mantenimiento + presupuesto_combustible + 
        presupuesto_peaje + presupuesto_comidas + presupuesto_otros_egresos
    ) STORED,
    
    presupuesto_utilidad DECIMAL(15,2) GENERATED ALWAYS AS (
        presupuesto_ingresos - (presupuesto_personal + presupuesto_seguros + 
        presupuesto_impuestos + presupuesto_multas + presupuesto_mantenimiento + 
        presupuesto_combustible + presupuesto_peaje + presupuesto_comidas + 
        presupuesto_otros_egresos)
    ) STORED,
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_presupuesto_periodo UNIQUE (año, mes)
);

-- Vista para comparación presupuesto vs real
CREATE VIEW vista_presupuesto_vs_real AS
SELECT 
    f.año,
    f.mes,
    f.ingresos as ingresos_reales,
    p.presupuesto_ingresos,
    f.ingresos - p.presupuesto_ingresos as variacion_ingresos,
    
    f.egresos_totales as egresos_reales,
    p.presupuesto_egresos_totales,
    f.egresos_totales - p.presupuesto_egresos_totales as variacion_egresos,
    
    f.utilidad as utilidad_real,
    p.presupuesto_utilidad,
    f.utilidad - p.presupuesto_utilidad as variacion_utilidad,
    
    f.margen_porcentaje as margen_real,
    CASE 
        WHEN p.presupuesto_ingresos > 0 THEN 
            (p.presupuesto_utilidad / p.presupuesto_ingresos) * 100
        ELSE 0
    END as margen_presupuestado
FROM flujo_caja_mensual f
LEFT JOIN presupuesto_mensual p ON f.año = p.año AND f.mes = p.mes;

-- Vista para dashboard de flujo de caja
CREATE VIEW vista_dashboard_flujo_caja AS
SELECT 
    año,
    COUNT(*) as meses_registrados,
    SUM(ingresos) as ingresos_anuales,
    SUM(egresos_totales) as egresos_anuales,
    SUM(utilidad) as utilidad_anual,
    AVG(margen_porcentaje) as margen_promedio,
    
    -- Desglose de egresos
    SUM(personal) as total_personal,
    SUM(seguros) as total_seguros,
    SUM(impuestos) as total_impuestos,
    SUM(multas) as total_multas,
    SUM(mantenimiento) as total_mantenimiento,
    SUM(combustible) as total_combustible,
    SUM(peaje) as total_peaje,
    SUM(comidas) as total_comidas,
    SUM(otros_egresos) as total_otros_egresos,
    
    -- Porcentajes de participación
    CASE 
        WHEN SUM(egresos_totales) > 0 THEN (SUM(personal) / SUM(egresos_totales)) * 100
        ELSE 0
    END as porcentaje_personal,
    
    CASE 
        WHEN SUM(egresos_totales) > 0 THEN (SUM(mantenimiento) / SUM(egresos_totales)) * 100
        ELSE 0
    END as porcentaje_mantenimiento,
    
    CASE 
        WHEN SUM(egresos_totales) > 0 THEN (SUM(combustible) / SUM(egresos_totales)) * 100
        ELSE 0
    END as porcentaje_combustible
    
FROM flujo_caja_mensual
GROUP BY año
ORDER BY año DESC;

-- Vista para análisis de tendencias mensuales
CREATE VIEW vista_tendencias_mensuales AS
SELECT 
    año,
    mes,
    ingresos,
    egresos_totales,
    utilidad,
    margen_porcentaje,
    
    -- Comparación con mes anterior
    LAG(ingresos) OVER (ORDER BY año, 
        CASE mes 
            WHEN 'Enero' THEN 1 WHEN 'Febrero' THEN 2 WHEN 'Marzo' THEN 3
            WHEN 'Abril' THEN 4 WHEN 'Mayo' THEN 5 WHEN 'Junio' THEN 6
            WHEN 'Julio' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Septiembre' THEN 9
            WHEN 'Octubre' THEN 10 WHEN 'Noviembre' THEN 11 WHEN 'Diciembre' THEN 12
        END
    ) as ingresos_mes_anterior,
    
    LAG(utilidad) OVER (ORDER BY año, 
        CASE mes 
            WHEN 'Enero' THEN 1 WHEN 'Febrero' THEN 2 WHEN 'Marzo' THEN 3
            WHEN 'Abril' THEN 4 WHEN 'Mayo' THEN 5 WHEN 'Junio' THEN 6
            WHEN 'Julio' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Septiembre' THEN 9
            WHEN 'Octubre' THEN 10 WHEN 'Noviembre' THEN 11 WHEN 'Diciembre' THEN 12
        END
    ) as utilidad_mes_anterior,
    
    -- Crecimiento porcentual
    CASE 
        WHEN LAG(ingresos) OVER (ORDER BY año, 
            CASE mes 
                WHEN 'Enero' THEN 1 WHEN 'Febrero' THEN 2 WHEN 'Marzo' THEN 3
                WHEN 'Abril' THEN 4 WHEN 'Mayo' THEN 5 WHEN 'Junio' THEN 6
                WHEN 'Julio' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Septiembre' THEN 9
                WHEN 'Octubre' THEN 10 WHEN 'Noviembre' THEN 11 WHEN 'Diciembre' THEN 12
            END
        ) > 0 THEN 
            ((ingresos - LAG(ingresos) OVER (ORDER BY año, 
                CASE mes 
                    WHEN 'Enero' THEN 1 WHEN 'Febrero' THEN 2 WHEN 'Marzo' THEN 3
                    WHEN 'Abril' THEN 4 WHEN 'Mayo' THEN 5 WHEN 'Junio' THEN 6
                    WHEN 'Julio' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Septiembre' THEN 9
                    WHEN 'Octubre' THEN 10 WHEN 'Noviembre' THEN 11 WHEN 'Diciembre' THEN 12
                END
            )) / LAG(ingresos) OVER (ORDER BY año, 
                CASE mes 
                    WHEN 'Enero' THEN 1 WHEN 'Febrero' THEN 2 WHEN 'Marzo' THEN 3
                    WHEN 'Abril' THEN 4 WHEN 'Mayo' THEN 5 WHEN 'Junio' THEN 6
                    WHEN 'Julio' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Septiembre' THEN 9
                    WHEN 'Octubre' THEN 10 WHEN 'Noviembre' THEN 11 WHEN 'Diciembre' THEN 12
                END
            )) * 100
        ELSE 0
    END as crecimiento_ingresos_porcentual
    
FROM flujo_caja_mensual
ORDER BY año, CASE mes 
    WHEN 'Enero' THEN 1 WHEN 'Febrero' THEN 2 WHEN 'Marzo' THEN 3
    WHEN 'Abril' THEN 4 WHEN 'Mayo' THEN 5 WHEN 'Junio' THEN 6
    WHEN 'Julio' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Septiembre' THEN 9
    WHEN 'Octubre' THEN 10 WHEN 'Noviembre' THEN 11 WHEN 'Diciembre' THEN 12
END;

-- Trigger para actualizar fecha de modificación
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_flujo_caja_fecha_actualizacion
    BEFORE UPDATE ON flujo_caja_mensual
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_presupuesto_fecha_actualizacion
    BEFORE UPDATE ON presupuesto_mensual
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Función para obtener resumen anual
CREATE OR REPLACE FUNCTION obtener_resumen_anual(p_año INTEGER)
RETURNS TABLE (
    categoria VARCHAR(50),
    monto_total DECIMAL(15,2),
    porcentaje_participacion DECIMAL(5,2),
    promedio_mensual DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Ingresos'::VARCHAR(50) as categoria,
        SUM(f.ingresos) as monto_total,
        100.00::DECIMAL(5,2) as porcentaje_participacion,
        AVG(f.ingresos) as promedio_mensual
    FROM flujo_caja_mensual f
    WHERE f.año = p_año
    
    UNION ALL
    
    SELECT 
        'Personal'::VARCHAR(50),
        SUM(f.personal),
        CASE WHEN SUM(f.egresos_totales) > 0 THEN 
            (SUM(f.personal) / SUM(f.egresos_totales)) * 100 
        ELSE 0 END,
        AVG(f.personal)
    FROM flujo_caja_mensual f
    WHERE f.año = p_año
    
    UNION ALL
    
    SELECT 
        'Seguros'::VARCHAR(50),
        SUM(f.seguros),
        CASE WHEN SUM(f.egresos_totales) > 0 THEN 
            (SUM(f.seguros) / SUM(f.egresos_totales)) * 100 
        ELSE 0 END,
        AVG(f.seguros)
    FROM flujo_caja_mensual f
    WHERE f.año = p_año
    
    UNION ALL
    
    SELECT 
        'Impuestos'::VARCHAR(50),
        SUM(f.impuestos),
        CASE WHEN SUM(f.egresos_totales) > 0 THEN 
            (SUM(f.impuestos) / SUM(f.egresos_totales)) * 100 
        ELSE 0 END,
        AVG(f.impuestos)
    FROM flujo_caja_mensual f
    WHERE f.año = p_año
    
    UNION ALL
    
    SELECT 
        'Multas'::VARCHAR(50),
        SUM(f.multas),
        CASE WHEN SUM(f.egresos_totales) > 0 THEN 
            (SUM(f.multas) / SUM(f.egresos_totales)) * 100 
        ELSE 0 END,
        AVG(f.multas)
    FROM flujo_caja_mensual f
    WHERE f.año = p_año
    
    UNION ALL
    
    SELECT 
        'Mantenimiento'::VARCHAR(50),
        SUM(f.mantenimiento),
        CASE WHEN SUM(f.egresos_totales) > 0 THEN 
            (SUM(f.mantenimiento) / SUM(f.egresos_totales)) * 100 
        ELSE 0 END,
        AVG(f.mantenimiento)
    FROM flujo_caja_mensual f
    WHERE f.año = p_año
    
    UNION ALL
    
    SELECT 
        'Combustible'::VARCHAR(50),
        SUM(f.combustible),
        CASE WHEN SUM(f.egresos_totales) > 0 THEN 
            (SUM(f.combustible) / SUM(f.egresos_totales)) * 100 
        ELSE 0 END,
        AVG(f.combustible)
    FROM flujo_caja_mensual f
    WHERE f.año = p_año
    
    UNION ALL
    
    SELECT 
        'Otros Gastos'::VARCHAR(50),
        SUM(f.peaje + f.comidas + f.otros_egresos),
        CASE WHEN SUM(f.egresos_totales) > 0 THEN 
            (SUM(f.peaje + f.comidas + f.otros_egresos) / SUM(f.egresos_totales)) * 100 
        ELSE 0 END,
        AVG(f.peaje + f.comidas + f.otros_egresos)
    FROM flujo_caja_mensual f
    WHERE f.año = p_año;
END;
$$ LANGUAGE plpgsql;

-- Insertar datos de ejemplo
INSERT INTO flujo_caja_mensual (
    año, mes, ingresos, personal, seguros, impuestos, multas, 
    mantenimiento, combustible, peaje, comidas, otros_egresos,
    usuario_creacion, observaciones
) VALUES 
(2024, 'Enero', 125000, 45000, 8500, 12000, 2500, 15000, 8000, 3500, 2000, 2000, 'admin', 'Primer mes del año'),
(2024, 'Febrero', 138000, 45000, 8500, 15000, 1500, 18000, 9000, 4000, 2500, 1500, 'admin', 'Incremento en ingresos'),
(2024, 'Marzo', 142000, 47000, 8500, 13000, 3000, 20000, 8500, 4500, 2000, 1500, 'admin', 'Mes con mayor mantenimiento');

-- Insertar presupuesto de ejemplo
INSERT INTO presupuesto_mensual (
    año, mes, presupuesto_ingresos, presupuesto_personal, presupuesto_seguros,
    presupuesto_impuestos, presupuesto_multas, presupuesto_mantenimiento,
    presupuesto_combustible, presupuesto_peaje, presupuesto_comidas, presupuesto_otros_egresos
) VALUES 
(2024, 'Enero', 130000, 45000, 8500, 12000, 2000, 15000, 8000, 3500, 2000, 2000),
(2024, 'Febrero', 135000, 45000, 8500, 15000, 2000, 16000, 8500, 3500, 2000, 2000),
(2024, 'Marzo', 140000, 47000, 8500, 13000, 2000, 18000, 8500, 4000, 2000, 2000);

-- Índices para optimizar consultas
CREATE INDEX idx_flujo_caja_año_mes ON flujo_caja_mensual(año, mes);
CREATE INDEX idx_flujo_caja_año ON flujo_caja_mensual(año);
CREATE INDEX idx_flujo_caja_fecha_creacion ON flujo_caja_mensual(fecha_creacion);
CREATE INDEX idx_presupuesto_año_mes ON presupuesto_mensual(año, mes);

-- Comentarios en las tablas
COMMENT ON TABLE flujo_caja_mensual IS 'Registro mensual del flujo de caja con ingresos y egresos detallados';
COMMENT ON TABLE categorias_egresos IS 'Catálogo de categorías de egresos para clasificación y reportes';
COMMENT ON TABLE presupuesto_mensual IS 'Presupuesto mensual para comparación con valores reales';

COMMENT ON COLUMN flujo_caja_mensual.egresos_totales IS 'Campo calculado automáticamente sumando todos los egresos';
COMMENT ON COLUMN flujo_caja_mensual.utilidad IS 'Campo calculado: ingresos - egresos_totales';
COMMENT ON COLUMN flujo_caja_mensual.margen_porcentaje IS 'Campo calculado: (utilidad / ingresos) * 100';
