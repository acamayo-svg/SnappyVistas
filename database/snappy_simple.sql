-- Base de datos mínima para registro e inicio de sesión
-- Motor: MySQL 5.7+/8.0+ | Codificación: utf8mb4

-- Crear BD y seleccionarla
CREATE DATABASE IF NOT EXISTS snappy_simple
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;
USE snappy_simple;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(80)      NOT NULL,
  correo           VARCHAR(120)     NOT NULL,
  telefono         VARCHAR(20)      NULL,
  password_hash    VARCHAR(255)     NOT NULL,
  tipo_usuario     ENUM('CLIENTE','ESTABLECIMIENTO','DOMICILIARIO') NOT NULL,
  estado           TINYINT(1)       NOT NULL DEFAULT 1,
  creado_en        TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en   TIMESTAMP        NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_usuarios_correo (correo),
  INDEX idx_tipo_usuario (tipo_usuario),
  INDEX idx_estado (estado)
);

-- (Opcional) Auditoría de intentos de inicio de sesión
CREATE TABLE IF NOT EXISTS login_intentos (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED      NULL,
  correo      VARCHAR(120)      NULL,
  ip          VARBINARY(16)     NULL,
  exito       TINYINT(1)        NOT NULL,
  creado_en   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_usuario (usuario_id),
  INDEX idx_correo (correo),
  CONSTRAINT fk_login_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  establecimiento_id INT UNSIGNED NOT NULL,
  nombre           VARCHAR(120)     NOT NULL,
  descripcion      TEXT             NULL,
  precio           DECIMAL(10,2)    NOT NULL,
  unidades_disponibles INT UNSIGNED NOT NULL DEFAULT 0,
  categoria        VARCHAR(50)      NULL,
  imagen_url       VARCHAR(255)     NULL,
  estado           TINYINT(1)       NOT NULL DEFAULT 1,
  creado_en        TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en   TIMESTAMP        NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_establecimiento (establecimiento_id),
  INDEX idx_categoria (categoria),
  INDEX idx_estado (estado),
  INDEX idx_precio (precio),
  CONSTRAINT fk_productos_establecimiento
    FOREIGN KEY (establecimiento_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla de estado de establecimientos
CREATE TABLE IF NOT EXISTS establecimientos_estado (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  establecimiento_id INT UNSIGNED NOT NULL,
  activo           TINYINT(1)       NOT NULL DEFAULT 0,
  fecha_activacion TIMESTAMP        NULL,
  fecha_desactivacion TIMESTAMP     NULL,
  motivo_desactivacion VARCHAR(255) NULL,
  creado_en        TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en   TIMESTAMP        NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_establecimiento (establecimiento_id),
  CONSTRAINT fk_establecimiento_estado
    FOREIGN KEY (establecimiento_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);



