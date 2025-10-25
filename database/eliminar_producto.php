<?php
// database/eliminar_producto.php
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
    
    if (!$input || !isset($input['producto_id'])) {
        json_error('ID del producto requerido');
    }
    
    $producto_id = (int)$input['producto_id'];
    
    if ($producto_id <= 0) {
        json_error('ID del producto inválido');
    }
    
    // Verificar que el producto existe
    $sql_check = 'SELECT id, nombre FROM productos WHERE id = ?';
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$producto_id]);
    $producto = $stmt_check->fetch(PDO::FETCH_ASSOC);
    
    if (!$producto) {
        json_error('Producto no encontrado', 404);
    }
    
    // Eliminar el producto
    $sql_delete = 'DELETE FROM productos WHERE id = ?';
    $stmt_delete = $pdo->prepare($sql_delete);
    $stmt_delete->execute([$producto_id]);
    
    if ($stmt_delete->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Producto eliminado exitosamente',
            'producto_eliminado' => [
                'id' => $producto_id,
                'nombre' => $producto['nombre']
            ]
        ]);
    } else {
        json_error('No se pudo eliminar el producto');
    }
    
} catch (Throwable $e) {
    json_error($e->getMessage(), 500);
}
?>



