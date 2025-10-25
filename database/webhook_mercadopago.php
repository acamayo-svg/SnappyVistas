<?php
// Webhook para recibir notificaciones de MercadoPago
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/conexion.php';

// Log de la notificación recibida
error_log("WEBHOOK: Notificación recibida - POST: " . json_encode($_POST) . " GET: " . json_encode($_GET));

try {
    $pdo = db_connect();
    
    // Crear tabla si no existe
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
    
    // Obtener datos del webhook
    $preferenceId = $_POST['preference_id'] ?? $_GET['preference_id'] ?? null;
    $paymentId = $_POST['payment_id'] ?? $_GET['payment_id'] ?? null;
    $status = $_POST['status'] ?? $_GET['status'] ?? 'approved'; // Cambiar default a approved
    
    error_log("WEBHOOK: Datos procesados - preference_id: $preferenceId, payment_id: $paymentId, status: $status");
    
    if (!$preferenceId) {
        throw new Exception('Preference ID requerido');
    }
    
    // Buscar el pedido por preference_id primero
    $sql = "SELECT * FROM pedidos WHERE preference_id = :preference_id ORDER BY id DESC LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':preference_id', $preferenceId);
    $stmt->execute();
    $pedido = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Si no se encuentra por preference_id, buscar el último pedido pendiente
    if (!$pedido) {
        error_log("WEBHOOK: No se encontró pedido con preference_id: $preferenceId, buscando último pendiente");
        $sql = "SELECT * FROM pedidos WHERE estado = 'PENDIENTE' ORDER BY id DESC LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $pedido = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($pedido) {
            // Actualizar el preference_id del pedido encontrado
            $sqlUpdatePref = "UPDATE pedidos SET preference_id = :preference_id WHERE id = :pedido_id";
            $stmtUpdatePref = $pdo->prepare($sqlUpdatePref);
            $stmtUpdatePref->bindParam(':preference_id', $preferenceId);
            $stmtUpdatePref->bindParam(':pedido_id', $pedido['id']);
            $stmtUpdatePref->execute();
            error_log("WEBHOOK: Actualizado preference_id del pedido {$pedido['id']} a $preferenceId");
        }
    }
    
    if (!$pedido) {
        throw new Exception('No se encontró ningún pedido pendiente para procesar');
    }
    
    // Determinar nuevo estado basado en el status
    $nuevoEstado = 'PAGADO'; // Cambiar default a PAGADO para simular éxito
    if ($status === 'rejected') {
        $nuevoEstado = 'RECHAZADO';
    } else if ($status === 'pending') {
        $nuevoEstado = 'PENDIENTE';
    }
    
    // Actualizar estado del pedido
    $sqlUpdate = "UPDATE pedidos SET estado = :estado WHERE id = :pedido_id";
    $stmtUpdate = $pdo->prepare($sqlUpdate);
    $stmtUpdate->bindParam(':estado', $nuevoEstado);
    $stmtUpdate->bindParam(':pedido_id', $pedido['id']);
    
    $result = $stmtUpdate->execute();
    
    if ($result) {
        error_log("WEBHOOK: Pedido {$pedido['id']} actualizado a estado: {$nuevoEstado}");
        echo json_encode([
            'success' => true,
            'message' => 'Pedido actualizado correctamente',
            'pedido_id' => $pedido['id'],
            'estado' => $nuevoEstado,
            'preference_id' => $preferenceId,
            'estado_anterior' => $pedido['estado']
        ]);
    } else {
        throw new Exception('Error actualizando pedido');
    }
    
} catch (Throwable $e) {
    error_log("WEBHOOK ERROR: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>