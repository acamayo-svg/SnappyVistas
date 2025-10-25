<?php
// database/registro.php
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

    $nombre = trim($data['nombre'] ?? '');
    $correo = trim($data['correo'] ?? '');
    $telefono = trim($data['telefono'] ?? '');
    $password = (string)($data['password'] ?? '');
    $tipo = strtoupper(trim($data['tipo_usuario'] ?? ''));

    if ($nombre === '' || $correo === '' || $password === '' || $tipo === '') {
        json_error('Campos requeridos: nombre, correo, password, tipo_usuario');
    }
    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) json_error('Correo inválido');
    if (!in_array($tipo, ['CLIENTE','ESTABLECIMIENTO','DOMICILIARIO'], true)) json_error('tipo_usuario inválido');

    $pdo = db_connect();
    // Verificar duplicado
    $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE correo = ? LIMIT 1');
    $stmt->execute([$correo]);
    if ($stmt->fetch()) json_error('El correo ya está registrado', 409);

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $ins = $pdo->prepare('INSERT INTO usuarios(nombre, correo, telefono, password_hash, tipo_usuario) VALUES(?,?,?,?,?)');
    $ins->execute([$nombre, $correo, $telefono !== '' ? $telefono : null, $hash, $tipo]);

    $id = (int)$pdo->lastInsertId();
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $id,
            'nombre' => $nombre,
            'correo' => $correo,
            'telefono' => $telefono !== '' ? $telefono : null,
            'tipo_usuario' => $tipo
        ]
    ]);
} catch (Throwable $e) {
    json_error($e->getMessage(), 500);
}



