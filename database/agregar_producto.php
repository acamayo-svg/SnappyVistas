<?php
// database/agregar_producto.php
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

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if (!is_array($data)) json_error('JSON inválido');

    $establecimiento_id = (int)($data['establecimiento_id'] ?? 0);
    $nombre = trim($data['nombre'] ?? '');
    $descripcion = trim($data['descripcion'] ?? '');
    $precio = (float)($data['precio'] ?? 0);
    $unidades = (int)($data['unidades_disponibles'] ?? 0);
    $categoria = trim($data['categoria'] ?? '');

    if ($establecimiento_id <= 0) json_error('ID de establecimiento requerido');
    if ($nombre === '') json_error('Nombre del producto requerido');
    if ($precio <= 0) json_error('Precio debe ser mayor a 0');
    if ($unidades < 0) json_error('Unidades no puede ser negativo');

    $pdo = db_connect();
    
    // Verificar que el establecimiento existe y es de tipo ESTABLECIMIENTO
    $stmt = $pdo->prepare('SELECT id, nombre FROM usuarios WHERE id = ? AND tipo_usuario = "ESTABLECIMIENTO" LIMIT 1');
    $stmt->execute([$establecimiento_id]);
    $establecimiento = $stmt->fetch();
    
    if (!$establecimiento) {
        json_error('Establecimiento no encontrado o no válido', 404);
    }

    // Insertar producto
    $ins = $pdo->prepare('INSERT INTO productos(establecimiento_id, nombre, descripcion, precio, unidades_disponibles, categoria) VALUES(?,?,?,?,?,?)');
    $ins->execute([
        $establecimiento_id,
        $nombre,
        $descripcion !== '' ? $descripcion : null,
        $precio,
        $unidades,
        $categoria !== '' ? $categoria : null
    ]);

    $producto_id = (int)$pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $producto_id,
            'establecimiento_id' => $establecimiento_id,
            'establecimiento_nombre' => $establecimiento['nombre'],
            'nombre' => $nombre,
            'descripcion' => $descripcion,
            'precio' => $precio,
            'unidades_disponibles' => $unidades,
            'categoria' => $categoria
        ]
    ]);
} catch (Throwable $e) {
    json_error($e->getMessage(), 500);
}
