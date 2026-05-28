<?php
/**
 * API de Autenticación
 * Maneja login, registro y logout
 */

require_once __DIR__ . '/../config/init.php';

header('Content-Type: application/json; charset=utf-8');

$action = $_POST['action'] ?? '';

if ($action === 'login') {
    $usuario = $_POST['usuario'] ?? '';
    $contraseña = $_POST['contraseña'] ?? '';

    if (empty($usuario) || empty($contraseña)) {
        echo json_encode(['éxito' => false, 'mensaje' => 'Usuario y contraseña requeridos']);
        exit;
    }

    $auth = new Auth($db);
    $resultado = $auth->login($usuario, $contraseña);
    echo json_encode($resultado);

} elseif ($action === 'registro') {
    $nombre = $_POST['nombre'] ?? '';
    $usuario = $_POST['usuario'] ?? '';
    $contraseña = $_POST['contraseña'] ?? '';

    if (empty($nombre) || empty($usuario) || empty($contraseña)) {
        echo json_encode(['éxito' => false, 'mensaje' => 'Todos los campos son requeridos']);
        exit;
    }

    $auth = new Auth($db);
    $resultado = $auth->registro($nombre, $usuario, $contraseña);
    echo json_encode($resultado);

} elseif ($action === 'logout') {
    Auth::logout();
    echo json_encode(['éxito' => true, 'mensaje' => 'Sesión cerrada']);

} else {
    echo json_encode(['éxito' => false, 'mensaje' => 'Acción no válida']);
}
