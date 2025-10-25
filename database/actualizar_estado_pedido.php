<?php
// actualizar_estado_pedido.php
require_once __DIR__ . '/conexion.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $pdo = db_connect();
    
    $input = json_decode(file_get_contents('php://input'), true);
    $pedidoId = $input['pedido_id'] ?? null;
    $nuevoEstado = $input['estado'] ?? null;
    
    if (!$pedidoId || !$nuevoEstado) {
        throw new Exception('Pedido ID y estado requeridos');
    }
    
    // Validar estado
    $estadosValidos = ['PAGADO', 'LISTO', 'EN_CAMINO', 'ENTREGADO'];
    if (!in_array($nuevoEstado, $estadosValidos)) {
        throw new Exception('Estado no válido');
    }
    
    $sql = "UPDATE pedidos SET estado = :estado, updated_at = CURRENT_TIMESTAMP WHERE id = :pedido_id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':estado', $nuevoEstado);
    $stmt->bindParam(':pedido_id', $pedidoId);
    
    $result = $stmt->execute();
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Estado actualizado correctamente',
            'pedido_id' => $pedidoId,
            'nuevo_estado' => $nuevoEstado
        ]);
    } else {
        throw new Exception('Error actualizando estado del pedido');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
