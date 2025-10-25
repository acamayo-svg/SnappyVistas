<?php
// aceptar_pedido.php
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
    $domiciliarioId = $input['domiciliario_id'] ?? null;
    
    if (!$pedidoId || !$domiciliarioId) {
        throw new Exception('Pedido ID y Domiciliario ID requeridos');
    }
    
    // Verificar que el pedido esté en estado LISTO
    $sqlVerificar = "SELECT estado FROM pedidos WHERE id = :pedido_id";
    $stmtVerificar = $pdo->prepare($sqlVerificar);
    $stmtVerificar->bindParam(':pedido_id', $pedidoId);
    $stmtVerificar->execute();
    $pedido = $stmtVerificar->fetch(PDO::FETCH_ASSOC);
    
    if (!$pedido) {
        throw new Exception('Pedido no encontrado');
    }
    
    if ($pedido['estado'] !== 'LISTO') {
        throw new Exception('El pedido no está disponible para aceptar');
    }
    
    // Actualizar pedido con domiciliario y cambiar estado
    $sql = "UPDATE pedidos SET domiciliario_id = :domiciliario_id, estado = 'EN_CAMINO', updated_at = CURRENT_TIMESTAMP WHERE id = :pedido_id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':domiciliario_id', $domiciliarioId);
    $stmt->bindParam(':pedido_id', $pedidoId);
    
    $result = $stmt->execute();
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Pedido aceptado exitosamente',
            'pedido_id' => $pedidoId,
            'domiciliario_id' => $domiciliarioId,
            'nuevo_estado' => 'EN_CAMINO'
        ]);
    } else {
        throw new Exception('Error aceptando el pedido');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
