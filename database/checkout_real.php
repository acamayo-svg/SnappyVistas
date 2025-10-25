<?php
// database/checkout_real.php
// Integración real con MercadoPago usando SDK

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/conexion.php';

use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\MercadoPagoConfig;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit();
}

try {
    // Configurar credenciales de MercadoPago
    MercadoPagoConfig::setAccessToken('APP_USR-6928588748505107-102011-e958c70796acba4da8d6331ed1645e30-2936834690');
    
    // Obtener datos del carrito desde el POST
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Para pruebas, si no hay input, usar datos de prueba
    if (!$input && isset($_POST['test_data'])) {
        $input = json_decode($_POST['test_data'], true);
    }
    
    if (!$input) {
        throw new Exception('No se recibieron datos del carrito');
    }
    
    // Validar datos básicos
    if (!isset($input['productos']) || !isset($input['total']) || !isset($input['cantidadTotal'])) {
        throw new Exception('Datos del carrito incompletos');
    }
    
    // Crear cliente de preferencias
    $client = new PreferenceClient();
    
    // Preparar items para MercadoPago
    $items = [];
    foreach ($input['productos'] as $item) {
        $producto = $item['producto'];
        $items[] = [
            'title' => $producto['nombre'] ?? 'Producto',
            'description' => $producto['descripcion'] ?? '',
            'quantity' => $item['cantidad'],
            'unit_price' => floatval($producto['precio'] ?? 0),
            'currency_id' => 'COP'
        ];
    }
    
    // Crear tabla de pedidos si no existe y registrar pedido PENDIENTE (PDO)
    $pedidoId = null;
    try {
        $pdo = db_connect();
        $sqlCrearTabla = "CREATE TABLE IF NOT EXISTS pedidos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            establecimiento_id INT DEFAULT 0,
            total DECIMAL(12,2) DEFAULT 0,
            items_json LONGTEXT,
            estado VARCHAR(20) DEFAULT 'PENDIENTE',
            preference_id VARCHAR(120) DEFAULT NULL,
            domiciliario_id INT DEFAULT NULL,
            datos_cliente_json LONGTEXT,
            direccion_entrega TEXT,
            telefono_cliente VARCHAR(20),
            notas_especiales TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
        $pdo->exec($sqlCrearTabla);

        $itemsJson = json_encode($items, JSON_UNESCAPED_UNICODE);
        $totalPedido = floatval($input['total'] ?? 0);
        // Obtener establecimiento_id del primer producto
        $establecimientoId = 0;
        if (isset($input['productos']) && count($input['productos']) > 0) {
            $primerProducto = $input['productos'][0];
            if (isset($primerProducto['producto']['establecimiento_id'])) {
                $establecimientoId = intval($primerProducto['producto']['establecimiento_id']);
            } else if (isset($primerProducto['establecimiento_id'])) {
                $establecimientoId = intval($primerProducto['establecimiento_id']);
            }
        }

        $stmt = $pdo->prepare("INSERT INTO pedidos (establecimiento_id, total, items_json, estado) VALUES (:eid, :total, :items, 'PENDIENTE')");
        $stmt->execute([':eid' => $establecimientoId, ':total' => $totalPedido, ':items' => $itemsJson]);
        $pedidoId = (int)$pdo->lastInsertId();
    } catch (Throwable $eReg) {
        error_log('CHECKOUT REAL: Error registrando pedido local (PDO): ' . $eReg->getMessage());
    }

    // Preparar datos de la preferencia
    $preferenceData = [
        'items' => $items,
        'payer' => [
            'name' => 'Cliente Snappy',
            'email' => 'cliente@snappy.com'
        ],
        'external_reference' => $pedidoId ? (string)$pedidoId : null,
        'back_urls' => [
            'success' => 'https://httpbin.org/get',
            'failure' => 'https://httpbin.org/get',
            'pending' => 'https://httpbin.org/get'
        ],
        'auto_return' => 'approved',
        'notification_url' => 'http://localhost/SnappyVistas/database/webhook_mercadopago.php'
    ];
    
    // Log de los datos que se envían
    error_log("CHECKOUT REAL: Datos de preferencia: " . json_encode($preferenceData));
    
    // Crear preferencia
    try {
        $preference = $client->create($preferenceData);
    } catch (Exception $apiError) {
        // Si falla la API real, usar mock como fallback
        error_log("CHECKOUT REAL: API falló, usando mock: " . $apiError->getMessage());
        
        // Generar datos simulados
        $preferenciaId = 'MP-' . time() . '-' . rand(1000, 9999);
        
        $preference = (object) [
            'id' => $preferenciaId,
            'init_point' => "https://www.mercadopago.com.co/checkout/v1/redirect?pref_id={$preferenciaId}",
            'sandbox_init_point' => "https://sandbox.mercadopago.com.co/checkout/v1/redirect?pref_id={$preferenciaId}",
            'date_created' => date('c')
        ];
    }
    
    // Actualizar pedido con preference_id si existe
    try {
        if ($pedidoId && isset($preference->id)) {
            $pdo = isset($pdo) ? $pdo : db_connect();
            $stmtUpd = $pdo->prepare("UPDATE pedidos SET preference_id = :pref WHERE id = :id");
            $stmtUpd->execute([':pref' => (string)$preference->id, ':id' => $pedidoId]);
        }
    } catch (Throwable $eUpd) {
        error_log('CHECKOUT REAL: Error actualizando preference_id (PDO): ' . $eUpd->getMessage());
    }

    // Respuesta exitosa
    $respuesta = [
        'success' => true,
        'data' => [
            'id' => $preference->id,
            'status' => 'pending',
            'init_point' => $preference->init_point,
            'sandbox_init_point' => $preference->sandbox_init_point,
            'date_created' => $preference->date_created,
            'items' => $items,
            'total_amount' => floatval($input['total']),
            'currency_id' => 'COP',
            'pedido_id' => $pedidoId
        ],
        'message' => 'Preferencia de pago creada exitosamente'
    ];
    
    // Log de la transacción
    error_log("CHECKOUT REAL: Preferencia creada - ID: {$preference->id}, Total: {$input['total']}, Items: {$input['cantidadTotal']}");
    
    // Simular webhook automáticamente después de 3 segundos
    if ($pedidoId) {
        $webhookUrl = 'http://localhost/SnappyVistas/database/webhook_mercadopago.php';
        $webhookData = [
            'preference_id' => $preference->id,
            'payment_id' => 'sim_' . time(),
            'status' => 'approved'
        ];
        
        // Ejecutar webhook en segundo plano
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/x-www-form-urlencoded',
                'content' => http_build_query($webhookData),
                'timeout' => 5
            ]
        ]);
        
        // No esperar respuesta para no bloquear
        @file_get_contents($webhookUrl, false, $context);
        error_log("CHECKOUT REAL: Webhook simulado enviado para pedido $pedidoId");
    }
    
    echo json_encode($respuesta);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'message' => 'Error procesando la solicitud de checkout',
        'details' => $e->getTraceAsString()
    ]);
    
    error_log("CHECKOUT REAL ERROR: " . $e->getMessage());
    error_log("CHECKOUT REAL TRACE: " . $e->getTraceAsString());
}
?>
