<?php
// database/listar_productos.php
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
    
    // Obtener parámetros de consulta
    $establecimiento_id = isset($_GET['establecimiento_id']) ? (int)$_GET['establecimiento_id'] : null;
    $solo_activos = isset($_GET['solo_activos']) ? $_GET['solo_activos'] === 'true' : true;
    $categoria = isset($_GET['categoria']) ? trim($_GET['categoria']) : null;
    $busqueda = isset($_GET['busqueda']) ? trim($_GET['busqueda']) : null;
    
    // Construir consulta
    $sql = 'SELECT p.*, u.nombre as establecimiento_nombre 
            FROM productos p 
            INNER JOIN usuarios u ON p.establecimiento_id = u.id';
    
    $where_conditions = [];
    $params = [];
    
    if ($establecimiento_id !== null) {
        $where_conditions[] = 'p.establecimiento_id = ?';
        $params[] = $establecimiento_id;
    }
    
    if ($solo_activos) {
        $where_conditions[] = 'p.estado = 1';
        // Removido: $where_conditions[] = 'ee.activo = 1';
        // Ahora solo filtramos por productos activos, no por establecimientos activos
    }
    
    if ($categoria !== null && $categoria !== '') {
        $where_conditions[] = 'p.categoria = ?';
        $params[] = $categoria;
    }
    
    if ($busqueda !== null && $busqueda !== '') {
        $where_conditions[] = '(p.nombre LIKE ? OR p.descripcion LIKE ?)';
        $params[] = "%{$busqueda}%";
        $params[] = "%{$busqueda}%";
    }
    
    if (!empty($where_conditions)) {
        $sql .= ' WHERE ' . implode(' AND ', $where_conditions);
    }
    
    $sql .= ' ORDER BY p.creado_en DESC';
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatear precios
    foreach ($productos as &$producto) {
        $producto['precio'] = (float)$producto['precio'];
        $producto['unidades_disponibles'] = (int)$producto['unidades_disponibles'];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $productos,
        'total' => count($productos)
    ]);
} catch (Throwable $e) {
    json_error($e->getMessage(), 500);
}
