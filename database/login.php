<?php
// database/login.php
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

    $correo = trim($data['correo'] ?? '');
    $password = (string)($data['password'] ?? '');
    $tipoEsperado = isset($data['tipo_usuario']) ? strtoupper(trim($data['tipo_usuario'])) : null;
    if ($correo === '' || $password === '') json_error('Campos requeridos: correo, password');

    $pdo = db_connect();
    $sel = $pdo->prepare('SELECT id, nombre, correo, telefono, password_hash, tipo_usuario, estado FROM usuarios WHERE correo = ? LIMIT 1');
    $sel->execute([$correo]);
    $user = $sel->fetch();

    $exito = 0; $usuarioId = null;
    if ($user && (int)$user['estado'] === 1 && password_verify($password, $user['password_hash'])) {
        if ($tipoEsperado !== null && $tipoEsperado !== $user['tipo_usuario']) {
            // Tipo de usuario no coincide con el esperado para esta pantalla
            json_error('El usuario no pertenece al rol esperado', 403);
        }
        $exito = 1; $usuarioId = (int)$user['id'];
        echo json_encode([
            'success' => true,
            'data' => [
                'id' => (int)$user['id'],
                'nombre' => $user['nombre'],
                'correo' => $user['correo'],
                'telefono' => $user['telefono'],
                'tipo_usuario' => $user['tipo_usuario']
            ]
        ]);
    } else {
        json_error('Credenciales inválidas o usuario inactivo', 401);
    }

    // Auditar intento (si existe la tabla)
    try {
        $aud = $pdo->prepare('INSERT INTO login_intentos(usuario_id, correo, ip, exito) VALUES(?,?,INET6_ATON(?),?)');
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $aud->execute([$usuarioId, $correo, $ip, $exito]);
    } catch (Throwable $ignore) {}

} catch (Throwable $e) {
    json_error($e->getMessage(), 500);
}


