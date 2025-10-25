-- Base de datos optimizada para SnappyVistas
-- Solo incluye campos que se utilizan en el proyecto
-- Motor: MySQL 5.7+/8.0+ | Codificación: utf8mb4

-- Crear BD y seleccionarla
CREATE DATABASE IF NOT EXISTS snappy_simple
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;
USE snappy_simple;

-- Tabla de usuarios (solo campos utilizados)
CREATE TABLE IF NOT EXISTS usuarios (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(80)      NOT NULL,
  correo           VARCHAR(120)     NOT NULL,
  telefono         VARCHAR(20)      NULL,
  password_hash    VARCHAR(255)     NOT NULL,
  tipo_usuario     ENUM('CLIENTE','ESTABLECIMIENTO','DOMICILIARIO') NOT NULL,
  estado           TINYINT(1)       NOT NULL DEFAULT 1,
  UNIQUE KEY uk_usuarios_correo (correo),
  INDEX idx_tipo_usuario (tipo_usuario),
  INDEX idx_estado (estado)
);

-- Tabla de productos (solo campos utilizados)
CREATE TABLE IF NOT EXISTS productos (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  establecimiento_id    INT UNSIGNED NOT NULL,
  nombre                VARCHAR(120)     NOT NULL,
  descripcion           TEXT             NULL,
  precio                DECIMAL(10,2)    NOT NULL,
  unidades_disponibles  INT UNSIGNED     NOT NULL DEFAULT 0,
  categoria             VARCHAR(50)      NULL,
  estado                TINYINT(1)       NOT NULL DEFAULT 1,
  INDEX idx_establecimiento (establecimiento_id),
  INDEX idx_categoria (categoria),
  INDEX idx_estado (estado),
  INDEX idx_precio (precio),
  CONSTRAINT fk_productos_establecimiento
    FOREIGN KEY (establecimiento_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla de pedidos (solo campos utilizados)
CREATE TABLE IF NOT EXISTS pedidos (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  establecimiento_id    INT UNSIGNED     NOT NULL,
  domiciliario_id       INT UNSIGNED     NULL,
  total                 DECIMAL(12,2)    NOT NULL DEFAULT 0,
  items_json            LONGTEXT         NULL,
  estado                VARCHAR(20)      NOT NULL DEFAULT 'PENDIENTE',
  preference_id         VARCHAR(120)     NULL,
  datos_cliente_json    LONGTEXT         NULL,
  direccion_entrega     TEXT             NULL,
  telefono_cliente      VARCHAR(20)      NULL,
  notas_especiales      TEXT             NULL,
  INDEX idx_establecimiento (establecimiento_id),
  INDEX idx_domiciliario (domiciliario_id),
  INDEX idx_estado (estado),
  CONSTRAINT fk_pedidos_establecimiento
    FOREIGN KEY (establecimiento_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pedidos_domiciliario
    FOREIGN KEY (domiciliario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de estado de establecimientos (solo campos utilizados)
CREATE TABLE IF NOT EXISTS establecimientos_estado (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  establecimiento_id    INT UNSIGNED NOT NULL,
  activo                TINYINT(1)       NOT NULL DEFAULT 0,
  UNIQUE KEY uk_establecimiento (establecimiento_id),
  CONSTRAINT fk_establecimiento_estado
    FOREIGN KEY (establecimiento_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla de heartbeat de establecimientos
CREATE TABLE IF NOT EXISTS establecimiento_heartbeat (
  establecimiento_id    INT UNSIGNED PRIMARY KEY,
  ultimo_heartbeat      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_heartbeat (ultimo_heartbeat),
  CONSTRAINT fk_heartbeat_establecimiento
    FOREIGN KEY (establecimiento_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla de auditoría de intentos de login
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
