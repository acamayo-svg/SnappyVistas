<?php
// database/conexion.php
// Conexión PDO sencilla a MySQL (XAMPP): BD snappy_simple, usuario root sin contraseña

$DB_HOST = 'localhost';
$DB_NAME = 'snappy_simple';
$DB_USER = 'root';
$DB_PASS = '';
$DB_CHARSET = 'utf8mb4';

function db_connect() {
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS, $DB_CHARSET;
    $dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset={$DB_CHARSET}";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    return new PDO($dsn, $DB_USER, $DB_PASS, $options);
}

// Ping rápido (opcional)
if (isset($_GET['ping'])) {
    header('Content-Type: application/json');
    try {
        $pdo = db_connect();
        $stmt = $pdo->query('SELECT 1 AS ok');
        echo json_encode(['success' => true, 'db' => $DB_NAME, 'result' => $stmt->fetch()]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}



