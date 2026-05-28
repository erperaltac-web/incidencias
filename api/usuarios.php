<?php
/**
 * API de Usuarios
 * Maneja creación, eliminación y listado de usuarios
 */

require_once __DIR__ . '/../config/init.php';

header('Content-Type: application/json; charset=utf-8');

// Verificar autenticación
if (!Auth::verificarAutenticacion()) {
    http_response_code(401);
    echo json_encode(['éxito' => false, 'mensaje' => 'No autenticado']);
    exit;
}

// Verificar que sea admin
if (!Auth::esAdmin()) {
    http_response_code(403);
    echo json_encode(['éxito' => false, 'mensaje' => 'Solo administrador']);
    exit;
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$conn = $db->getConnection();

if ($action === 'crear') {
    $nombre = $_POST['nombre'] ?? '';
    $usuario = $_POST['usuario'] ?? '';
    $contraseña = $_POST['contraseña'] ?? '';
    $rol = $_POST['rol'] ?? 'usuario';

    if (empty($nombre) || empty($usuario) || empty($contraseña)) {
        echo json_encode(['éxito' => false, 'mensaje' => 'Campos requeridos']);
        exit;
    }

    // Verificar si usuario existe
    $check = $conn->query("SELECT id FROM usuarios WHERE usuario = '$usuario' LIMIT 1");
    if ($check->num_rows > 0) {
        echo json_encode(['éxito' => false, 'mensaje' => 'Usuario ya existe']);
        exit;
    }

    $password_hash = password_hash($contraseña, PASSWORD_BCRYPT);
    $sql = "INSERT INTO usuarios (nombre, usuario, contraseña, rol) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssss', $nombre, $usuario, $password_hash, $rol);

    if ($stmt->execute()) {
        echo json_encode(['éxito' => true, 'mensaje' => 'Usuario creado']);
    } else {
        echo json_encode(['éxito' => false, 'mensaje' => 'Error al crear usuario']);
    }

} elseif ($action === 'eliminar') {
    $id = $_POST['id'] ?? '';

    if (empty($id)) {
        echo json_encode(['éxito' => false, 'mensaje' => 'ID requerido']);
        exit;
    }

    // No permitir eliminar admin
    $check = $conn->query("SELECT rol FROM usuarios WHERE id = $id");
    $usuario = $check->fetch_assoc();
    
    if ($usuario['rol'] === 'admin') {
        echo json_encode(['éxito' => false, 'mensaje' => 'No se puede eliminar usuario admin']);
        exit;
    }

    $sql = "UPDATE usuarios SET activo = FALSE WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        echo json_encode(['éxito' => true, 'mensaje' => 'Usuario eliminado']);
    } else {
        echo json_encode(['éxito' => false, 'mensaje' => 'Error al eliminar usuario']);
    }

} elseif ($action === 'listar') {
    $sql = "SELECT id, nombre, usuario, rol, activo, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC";
    $result = $conn->query($sql);
    $usuarios = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode(['éxito' => true, 'usuarios' => $usuarios]);

} elseif ($action === 'obtener') {
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        echo json_encode(['éxito' => false, 'mensaje' => 'ID requerido']);
        exit;
    }

    $sql = "SELECT id, nombre, usuario, rol, activo FROM usuarios WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $usuario = $result->fetch_assoc();
        echo json_encode(['éxito' => true, 'usuario' => $usuario]);
    } else {
        echo json_encode(['éxito' => false, 'mensaje' => 'Usuario no encontrado']);
    }

} else {
    echo json_encode(['éxito' => false, 'mensaje' => 'Acción no válida']);
}
