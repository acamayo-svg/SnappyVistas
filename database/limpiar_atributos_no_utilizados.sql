-- Script para eliminar atributos no utilizados en SnappyVistas
-- Ejecutar después de hacer backup de la base de datos

USE snappy_simple;

-- 1. Eliminar campos no utilizados de la tabla USUARIOS
ALTER TABLE usuarios 
DROP COLUMN creado_en,
DROP COLUMN actualizado_en;

-- 2. Eliminar campos no utilizados de la tabla PRODUCTOS
ALTER TABLE productos 
DROP COLUMN imagen_url,
DROP COLUMN creado_en,
DROP COLUMN actualizado_en;

-- 3. Eliminar campos no utilizados de la tabla PEDIDOS
ALTER TABLE pedidos 
DROP COLUMN created_at,
DROP COLUMN updated_at;

-- 4. Eliminar campos no utilizados de la tabla ESTABLECIMIENTOS_ESTADO
ALTER TABLE establecimientos_estado 
DROP COLUMN fecha_activacion,
DROP COLUMN fecha_desactivacion,
DROP COLUMN motivo_desactivacion,
DROP COLUMN creado_en,
DROP COLUMN actualizado_en;

-- Verificar que las tablas se modificaron correctamente
DESCRIBE usuarios;
DESCRIBE productos;
DESCRIBE pedidos;
DESCRIBE establecimientos_estado;
DESCRIBE establecimiento_heartbeat;
DESCRIBE login_intentos;
