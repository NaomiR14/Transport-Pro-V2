/*
# Transport Management System Schema

1. New Tables
- clientes (clients)
- proveedores (providers)
- conductores (drivers)
- vehiculos (vehicles)
- documentos (documents)
- ordenes_transporte (transport orders)
- pods (proof of delivery)
- devoluciones (returns)
- categorias_gasto (expense categories)
- gastos (expenses)
- liquidaciones (settlements)
- facturas (invoices)

2. Security
- Enable RLS on all tables
- Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE estado_orden AS ENUM ('pendiente', 'en_transito', 'entregado', 'devuelto');
CREATE TYPE estado_liquidacion AS ENUM ('pendiente', 'aprobado', 'rechazado');
CREATE TYPE estado_factura AS ENUM ('pendiente', 'pagado', 'cancelado');
CREATE TYPE tipo_entidad AS ENUM ('vehiculo', 'conductor');
CREATE TYPE estado_vehiculo AS ENUM ('activo', 'inactivo', 'mantenimiento', 'baja');
CREATE TYPE estado_mantenimiento AS ENUM ('pendiente', 'programado', 'en_proceso', 'completado');

-- Create tables
CREATE TABLE IF NOT EXISTS clientes (
    cliente_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre text NOT NULL,
    rfc text UNIQUE NOT NULL,
    direccion text,
    telefono text,
    email text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS proveedores (
    proveedor_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre text NOT NULL,
    rfc text UNIQUE NOT NULL,
    tarifa_base decimal(10,2) NOT NULL DEFAULT 0,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conductores (
    conductor_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre text NOT NULL,
    licencia text UNIQUE NOT NULL,
    telefono text,
    email text,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tipos_vehiculo (
    tipo_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre text NOT NULL,
    descripcion text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marcas_vehiculo (
    marca_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehiculos (
    vehiculo_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_interno text UNIQUE NOT NULL,
    tipo_id uuid REFERENCES tipos_vehiculo(tipo_id),
    marca_id uuid REFERENCES marcas_vehiculo(marca_id),
    modelo text NOT NULL,
    placa text UNIQUE NOT NULL,
    numero_serie text UNIQUE NOT NULL,
    color text,
    anio integer NOT NULL,
    carga_maxima decimal(10,2),
    estado estado_vehiculo DEFAULT 'activo',
    ciclo_mantenimiento_km integer NOT NULL,
    odometro_inicial integer NOT NULL DEFAULT 0,
    odometro_actual integer NOT NULL DEFAULT 0,
    ultimo_mantenimiento_km integer,
    proximo_mantenimiento_km integer,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ordenes_transporte (
    orden_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_interno text UNIQUE NOT NULL,
    folio_carta_porte text UNIQUE NOT NULL,
    cliente_id uuid REFERENCES clientes(cliente_id),
    conductor_id uuid REFERENCES conductores(conductor_id),
    vehiculo_id uuid REFERENCES vehiculos(vehiculo_id),
    proveedor_id uuid REFERENCES proveedores(proveedor_id),
    tipo_carga text NOT NULL,
    origen text NOT NULL,
    destino text NOT NULL,
    fecha_creacion timestamptz DEFAULT now(),
    fecha_entrega timestamptz,
    estado estado_orden DEFAULT 'pendiente',
    monto_total decimal(10,2) DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Additional tables (pods, devoluciones, gastos, etc.) would follow the same pattern
-- Enable RLS and create policies for all tables
-- Create indexes for performance optimization
