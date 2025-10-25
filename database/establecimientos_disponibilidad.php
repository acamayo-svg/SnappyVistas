<?php
// database/establecimientos_disponibilidad.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/conexion.php';

function json_error($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $msg]);
    exit;
}

try {
    $pdo = db_connect();
    
    // Obtener establecimientos con información de disponibilidad basada solo en heartbeat y productos
    $sql = 'SELECT u.id, u.nombre, u.telefono,
                   COUNT(p.id) as total_productos,
                   AVG(p.precio) as precio_promedio,
                   MIN(p.precio) as precio_minimo,
                   MAX(p.precio) as precio_maximo,
                   hb.ultimo_heartbeat,
                   CASE 
                       WHEN COUNT(p.id) > 0 AND hb.ultimo_heartbeat > DATE_SUB(NOW(), INTERVAL 2 MINUTE) THEN "disponible"
                       WHEN COUNT(p.id) > 0 AND (hb.ultimo_heartbeat IS NULL OR hb.ultimo_heartbeat <= DATE_SUB(NOW(), INTERVAL 2 MINUTE)) THEN "no_disponible"
                       WHEN COUNT(p.id) = 0 THEN "sin_productos"
                       ELSE "no_disponible"
                   END as estado_disponibilidad
            FROM usuarios u
            LEFT JOIN productos p ON u.id = p.establecimiento_id AND p.estado = 1
            LEFT JOIN establecimiento_heartbeat hb ON u.id = hb.establecimiento_id
            WHERE u.tipo_usuario = "ESTABLECIMIENTO" 
              AND u.estado = 1
            GROUP BY u.id, u.nombre, u.telefono, hb.ultimo_heartbeat
            ORDER BY u.nombre ASC';
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $establecimientos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatear datos
    foreach ($establecimientos as &$est) {
        $est['total_productos'] = (int)$est['total_productos'];
        $est['precio_promedio'] = $est['precio_promedio'] ? round((float)$est['precio_promedio'], 2) : 0;
        $est['precio_minimo'] = $est['precio_minimo'] ? (float)$est['precio_minimo'] : 0;
        $est['precio_maximo'] = $est['precio_maximo'] ? (float)$est['precio_maximo'] : 0;
        
        // Determinar texto de estado
        switch ($est['estado_disponibilidad']) {
            case 'disponible':
                $est['estado_texto'] = $est['total_productos'] . ' productos • $' . number_format($est['precio_minimo'], 0, ',', '.') . ' - $' . number_format($est['precio_maximo'], 0, ',', '.');
                break;
            case 'sin_productos':
                $est['estado_texto'] = 'Sin productos disponibles';
                break;
            case 'no_disponible':
                $est['estado_texto'] = 'No disponible en este momento';
                break;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $establecimientos,
        'total' => count($establecimientos)
    ]);
} catch (Throwable $e) {
    json_error($e->getMessage(), 500);
}
?>
