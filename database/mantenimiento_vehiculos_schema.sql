-- Tabla principal de mantenimientos de vehículos
CREATE TABLE mantenimientos_vehiculos (
    id SERIAL PRIMARY KEY,
    placa_vehiculo VARCHAR(20) NOT NULL,
    taller VARCHAR(100) NOT NULL,
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Preventivo', 'Correctivo')),
    kilometraje INTEGER NOT NULL CHECK (kilometraje >= 0),
    paquete_mantenimiento VARCHAR(100) NOT NULL,
    causas TEXT NOT NULL,
    costo_total DECIMAL(10,2) NOT NULL CHECK (costo_total >= 0),
    fecha_pago DATE,
    observaciones TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'En Proceso' 
        CHECK (estado IN ('En Proceso', 'Completado', 'Pendiente Pago')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para mejorar rendimiento
    INDEX idx_placa_vehiculo (placa_vehiculo),
    INDEX idx_fecha_entrada (fecha_entrada),
    INDEX idx_estado (estado),
    INDEX idx_tipo (tipo),
    INDEX idx_taller (taller)
);

-- Tabla de catálogo de paquetes de mantenimiento
CREATE TABLE paquetes_mantenimiento (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Preventivo', 'Correctivo')),
    kilometraje_recomendado INTEGER,
    costo_estimado DECIMAL(10,2),
    duracion_estimada_horas INTEGER,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar paquetes de mantenimiento predefinidos
INSERT INTO paquetes_mantenimiento (nombre, descripcion, tipo, kilometraje_recomendado, costo_estimado, duracion_estimada_horas) VALUES
('Mantenimiento 15K', 'Mantenimiento básico cada 15,000 km', 'Preventivo', 15000, 300.00, 4),
('Mantenimiento 30K', 'Mantenimiento intermedio cada 30,000 km', 'Preventivo', 30000, 650.00, 6),
('Mantenimiento 45K', 'Mantenimiento avanzado cada 45,000 km', 'Preventivo', 45000, 850.00, 8),
('Mantenimiento 60K', 'Mantenimiento mayor cada 60,000 km', 'Preventivo', 60000, 1100.00, 12),
('Reparación Motor', 'Reparación y mantenimiento del motor', 'Correctivo', NULL, 1500.00, 24),
('Reparación Frenos', 'Reparación del sistema de frenos', 'Correctivo', NULL, 450.00, 6),
('Reparación Transmisión', 'Reparación de la transmisión', 'Correctivo', NULL, 1200.00, 16),
('Reparación Suspensión', 'Reparación del sistema de suspensión', 'Correctivo', NULL, 800.00, 10),
('Cambio de Aceite', 'Cambio de aceite y filtro', 'Preventivo', 5000, 80.00, 1),
('Revisión General', 'Revisión completa del vehículo', 'Preventivo', NULL, 150.00, 3),
('Reparación Eléctrica', 'Reparación del sistema eléctrico', 'Correctivo', NULL, 350.00, 8);

-- Tabla de historial de mantenimientos por vehículo
CREATE TABLE historial_mantenimientos (
    id SERIAL PRIMARY KEY,
    placa_vehiculo VARCHAR(20) NOT NULL,
    ultimo_mantenimiento DATE,
    proximo_mantenimiento DATE,
    kilometraje_actual INTEGER,
    kilometraje_proximo_mantenimiento INTEGER,
    mantenimientos_realizados INTEGER DEFAULT 0,
    costo_total_mantenimientos DECIMAL(12,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(placa_vehiculo)
);

-- Trigger para actualizar automáticamente el estado basado en fechas y pagos
DELIMITER //
CREATE TRIGGER actualizar_estado_mantenimiento
    BEFORE UPDATE ON mantenimientos_vehiculos
    FOR EACH ROW
BEGIN
    -- Si tiene fecha de salida y fecha de pago, está completado
    IF NEW.fecha_salida IS NOT NULL AND NEW.fecha_pago IS NOT NULL THEN
        SET NEW.estado = 'Completado';
    -- Si tiene fecha de salida pero no fecha de pago, está pendiente de pago
    ELSEIF NEW.fecha_salida IS NOT NULL AND NEW.fecha_pago IS NULL THEN
        SET NEW.estado = 'Pendiente Pago';
    -- Si no tiene fecha de salida, está en proceso
    ELSE
        SET NEW.estado = 'En Proceso';
    END IF;
    
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- Trigger para actualizar historial de mantenimientos
DELIMITER //
CREATE TRIGGER actualizar_historial_mantenimiento
    AFTER INSERT ON mantenimientos_vehiculos
    FOR EACH ROW
BEGIN
    INSERT INTO historial_mantenimientos (
        placa_vehiculo, 
        ultimo_mantenimiento, 
        kilometraje_actual,
        mantenimientos_realizados,
        costo_total_mantenimientos
    ) VALUES (
        NEW.placa_vehiculo,
        NEW.fecha_entrada,
        NEW.kilometraje,
        1,
        NEW.costo_total
    )
    ON DUPLICATE KEY UPDATE
        ultimo_mantenimiento = NEW.fecha_entrada,
        kilometraje_actual = GREATEST(kilometraje_actual, NEW.kilometraje),
        mantenimientos_realizados = mantenimientos_realizados + 1,
        costo_total_mantenimientos = costo_total_mantenimientos + NEW.costo_total,
        updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- Vista para dashboard de mantenimientos
CREATE VIEW vista_dashboard_mantenimientos AS
SELECT 
    COUNT(*) as total_mantenimientos,
    COUNT(CASE WHEN estado = 'Completado' THEN 1 END) as completados,
    COUNT(CASE WHEN estado = 'En Proceso' THEN 1 END) as en_proceso,
    COUNT(CASE WHEN estado = 'Pendiente Pago' THEN 1 END) as pendiente_pago,
    SUM(CASE WHEN fecha_pago IS NULL THEN costo_total ELSE 0 END) as costo_pendiente,
    SUM(costo_total) as costo_total_general,
    AVG(costo_total) as costo_promedio,
    COUNT(CASE WHEN tipo = 'Preventivo' THEN 1 END) as mantenimientos_preventivos,
    COUNT(CASE WHEN tipo = 'Correctivo' THEN 1 END) as mantenimientos_correctivos
FROM mantenimientos_vehiculos;

-- Vista para alertas de mantenimiento
CREATE VIEW vista_alertas_mantenimiento AS
SELECT 
    placa_vehiculo,
    ultimo_mantenimiento,
    kilometraje_actual,
    DATEDIFF(CURRENT_DATE, ultimo_mantenimiento) as dias_sin_mantenimiento,
    CASE 
        WHEN DATEDIFF(CURRENT_DATE, ultimo_mantenimiento) > 180 THEN 'Crítico'
        WHEN DATEDIFF(CURRENT_DATE, ultimo_mantenimiento) > 120 THEN 'Alto'
        WHEN DATEDIFF(CURRENT_DATE, ultimo_mantenimiento) > 90 THEN 'Medio'
        ELSE 'Bajo'
    END as nivel_alerta
FROM historial_mantenimientos
WHERE ultimo_mantenimiento IS NOT NULL;

-- Vista para costos por vehículo
CREATE VIEW vista_costos_mantenimiento_vehiculo AS
SELECT 
    placa_vehiculo,
    COUNT(*) as total_mantenimientos,
    SUM(costo_total) as costo_total,
    AVG(costo_total) as costo_promedio,
    MIN(fecha_entrada) as primer_mantenimiento,
    MAX(fecha_entrada) as ultimo_mantenimiento,
    SUM(CASE WHEN tipo = 'Preventivo' THEN costo_total ELSE 0 END) as costo_preventivo,
    SUM(CASE WHEN tipo = 'Correctivo' THEN costo_total ELSE 0 END) as costo_correctivo
FROM mantenimientos_vehiculos
GROUP BY placa_vehiculo;

-- Insertar datos de ejemplo
INSERT INTO mantenimientos_vehiculos (
    placa_vehiculo, taller, fecha_entrada, fecha_salida, tipo, kilometraje, 
    paquete_mantenimiento, causas, costo_total, fecha_pago, observaciones, estado
) VALUES
('ABC-123', 'Taller Central', '2024-01-15', '2024-01-17', 'Preventivo', 45000, 
 'Mantenimiento 45K', 'Mantenimiento programado según kilometraje', 850.00, '2024-01-20', 
 'Cambio de aceite, filtros y revisión general', 'Completado'),
 
('DEF-456', 'AutoServicio Norte', '2024-01-20', NULL, 'Correctivo', 67500, 
 'Reparación Motor', 'Sobrecalentamiento del motor', 1250.00, NULL, 
 'Reparación de sistema de refrigeración en proceso', 'En Proceso'),
 
('GHI-789', 'Mecánica Express', '2024-01-18', '2024-01-19', 'Preventivo', 30000, 
 'Mantenimiento 30K', 'Mantenimiento programado', 650.00, '2024-01-22', 
 'Cambio de aceite y filtro de aire', 'Completado'),
 
('JKL-012', 'Taller Central', '2024-01-22', '2024-01-24', 'Correctivo', 89000, 
 'Reparación Frenos', 'Desgaste excesivo de pastillas de freno', 420.00, NULL, 
 'Cambio de pastillas y discos de freno', 'Pendiente Pago'),
 
('MNO-345', 'AutoServicio Norte', '2024-01-25', NULL, 'Preventivo', 60000, 
 'Mantenimiento 60K', 'Mantenimiento mayor programado', 1100.00, NULL, 
 'Mantenimiento mayor: cambio de correa de distribución', 'En Proceso');
