<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once __DIR__ . '/conexion.php';

$establecimientoId = intval($_GET['establecimiento_id'] ?? 0);
$estado = $_GET['estado'] ?? '';

try {
    $pdo = db_connect();
    $sqlCrear = "CREATE TABLE IF NOT EXISTS pedidos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        establecimiento_id INT DEFAULT 0,
        total DECIMAL(12,2) DEFAULT 0,
        items_json LONGTEXT,
        estado VARCHAR(20) DEFAULT 'PENDIENTE',
        preference_id VARCHAR(120) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $pdo->exec($sqlCrear);

    $where = [];
    $params = [];
    if ($establecimientoId > 0) { $where[] = 'establecimiento_id = :eid'; $params[':eid'] = $establecimientoId; }
    if ($estado !== '') { $where[] = 'estado = :estado'; $params[':estado'] = $estado; }
    
    // Agregar filtro por domiciliario_id si se proporciona
    $domiciliarioId = intval($_GET['domiciliario_id'] ?? 0);
    if ($domiciliarioId > 0) { $where[] = 'domiciliario_id = :did'; $params[':did'] = $domiciliarioId; }
    $whereSql = count($where) ? ('WHERE ' . implode(' AND ', $where)) : '';

    $sql = "SELECT id, establecimiento_id, total, items_json, estado, preference_id, domiciliario_id, datos_cliente_json, direccion_entrega, telefono_cliente, notas_especiales, created_at, updated_at
            FROM pedidos $whereSql ORDER BY id DESC LIMIT 50";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = [];
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $r['items'] = json_decode($r['items_json'], true);
        unset($r['items_json']);
        $rows[] = $r;
    }
    echo json_encode(['success' => true, 'data' => $rows]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>


