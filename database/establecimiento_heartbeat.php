<?php
// database/establecimiento_heartbeat.php
// Script para registrar que un establecimiento está "en línea"

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/conexion.php';

function json_error($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

try {
    $pdo = db_connect();
    
    // Obtener datos del POST
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['establecimiento_id'])) {
        json_error('ID del establecimiento requerido');
    }
    
    $establecimiento_id = (int)$input['establecimiento_id'];
    $is_offline = isset($input['offline']) && $input['offline'] === true;
    
    if ($establecimiento_id <= 0) {
        json_error('ID del establecimiento inválido');
    }
    
    // Crear tabla de heartbeat si no existe
    $sql_create_table = 'CREATE TABLE IF NOT EXISTS establecimiento_heartbeat (
        establecimiento_id INT UNSIGNED PRIMARY KEY,
        ultimo_heartbeat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_heartbeat (ultimo_heartbeat),
        CONSTRAINT fk_heartbeat_establecimiento
            FOREIGN KEY (establecimiento_id) REFERENCES usuarios(id)
            ON DELETE CASCADE ON UPDATE CASCADE
    )';
    
    $pdo->exec($sql_create_table);
    
    if ($is_offline) {
        // Marcar como offline eliminando el registro de heartbeat
        $sql_delete = 'DELETE FROM establecimiento_heartbeat WHERE establecimiento_id = ?';
        $stmt_delete = $pdo->prepare($sql_delete);
        $stmt_delete->execute([$establecimiento_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Establecimiento marcado como offline',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        // Actualizar o insertar heartbeat normal
        $sql_heartbeat = 'INSERT INTO establecimiento_heartbeat (establecimiento_id, ultimo_heartbeat) 
                          VALUES (?, NOW()) 
                          ON DUPLICATE KEY UPDATE ultimo_heartbeat = NOW()';
        
        $stmt_heartbeat = $pdo->prepare($sql_heartbeat);
        $stmt_heartbeat->execute([$establecimiento_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Heartbeat registrado',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
    
} catch (Throwable $e) {
    json_error($e->getMessage(), 500);
}
?>

