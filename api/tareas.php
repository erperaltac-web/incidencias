<?php
/**
 * API de Tareas
 * Maneja CRUD de tareas
 */

require_once __DIR__ . '/../config/init.php';

header('Content-Type: application/json; charset=utf-8');

// Verificar autenticación
if (!Auth::verificarAutenticacion()) {
    http_response_code(401);
    echo json_encode(['éxito' => false, 'mensaje' => 'No autenticado']);
    exit;
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$conn = $db->getConnection();

if ($action === 'crear') {
    $titulo = $_POST['titulo'] ?? '';
    $descripcion = $_POST['descripcion'] ?? '';
    $fecha_vencimiento = $_POST['fecha_vencimiento'] ?? null;
    $prioridad = $_POST['prioridad'] ?? 'Media';
    $id_usuario = Auth::idUsuarioActual();

    if (empty($titulo)) {
        echo json_encode(['éxito' => false, 'mensaje' => 'El título es requerido']);
        exit;
    }

    $sql = "INSERT INTO tareas (titulo, descripcion, fecha_vencimiento, prioridad, id_usuario) 
            VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssssi', $titulo, $descripcion, $fecha_vencimiento, $prioridad, $id_usuario);

    if ($stmt->execute()) {
        echo json_encode(['éxito' => true, 'mensaje' => 'Tarea creada', 'id' => $conn->insert_id]);
    } else {
        echo json_encode(['éxito' => false, 'mensaje' => 'Error al crear tarea']);
    }

} elseif ($action === 'actualizar') {
    $id = $_POST['id'] ?? '';
    $titulo = $_POST['titulo'] ?? '';
    $descripcion = $_POST['descripcion'] ?? '';
    $prioridad = $_POST['prioridad'] ?? 'Media';
    $id_usuario = Auth::idUsuarioActual();

    if (empty($id) || empty($titulo)) {
        echo json_encode(['éxito' => false, 'mensaje' => 'ID y título requeridos']);
        exit;
    }

    // Verificar que el usuario sea propietario o admin
    if (!Auth::esAdmin()) {
        $check = $conn->query("SELECT id_usuario FROM tareas WHERE id = $id");
        $tarea = $check->fetch_assoc();
        if ($tarea['id_usuario'] != $id_usuario) {
            echo json_encode(['éxito' => false, 'mensaje' => 'No tienes permiso para editar esta tarea']);
            exit;
        }
    }

    $sql = "UPDATE tareas SET titulo = ?, descripcion = ?, prioridad = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sssi', $titulo, $descripcion, $prioridad, $id);

    if ($stmt->execute()) {
        echo json_encode(['éxito' => true, 'mensaje' => 'Tarea actualizada']);
    } else {
        echo json_encode(['éxito' => false, 'mensaje' => 'Error al actualizar tarea']);
    }

} elseif ($action === 'eliminar') {
    $id = $_POST['id'] ?? '';
    
    if (empty($id)) {
        echo json_encode(['éxito' => false, 'mensaje' => 'ID requerido']);
        exit;
    }

    // Solo admin puede eliminar (cambiar estado)
    if (!Auth::esAdmin()) {
        echo json_encode(['éxito' => false, 'mensaje' => 'Solo administrador puede eliminar tareas']);
        exit;
    }

    $sql = "UPDATE tareas SET estado = 'eliminado' WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        echo json_encode(['éxito' => true, 'mensaje' => 'Tarea eliminada']);
    } else {
        echo json_encode(['éxito' => false, 'mensaje' => 'Error al eliminar tarea']);
    }

} elseif ($action === 'validar') {
    $id = $_POST['id'] ?? '';
    
    if (empty($id)) {
        echo json_encode(['éxito' => false, 'mensaje' => 'ID requerido']);
        exit;
    }

    // Solo admin puede validar
    if (!Auth::esAdmin()) {
        echo json_encode(['éxito' => false, 'mensaje' => 'Solo administrador puede validar tareas']);
        exit;
    }

    $fecha_resolucion = date('Y-m-d H:i:s');
    $sql = "UPDATE tareas SET estado = 'validado', fecha_resolucion = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('si', $fecha_resolucion, $id);

    if ($stmt->execute()) {
        echo json_encode(['éxito' => true, 'mensaje' => 'Tarea validada']);
    } else {
        echo json_encode(['éxito' => false, 'mensaje' => 'Error al validar tarea']);
    }

} elseif ($action === 'listar') {
    $id_usuario = Auth::idUsuarioActual();
    $es_admin = Auth::esAdmin();

    if ($es_admin) {
        // Admin ve todas las tareas excepto eliminadas
        $sql = "SELECT t.*, u.nombre AS nombre_usuario FROM tareas t 
                JOIN usuarios u ON t.id_usuario = u.id 
                WHERE t.estado != 'eliminado' 
                ORDER BY t.fecha_creacion DESC";
    } else {
        // Usuario solo ve sus tareas
        $sql = "SELECT t.* FROM tareas t 
                WHERE t.id_usuario = ? AND t.estado != 'eliminado' 
                ORDER BY t.fecha_creacion DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $id_usuario);
        $stmt->execute();
        $result = $stmt->get_result();
        $tareas = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode(['éxito' => true, 'tareas' => $tareas]);
        exit;
    }

    $result = $conn->query($sql);
    $tareas = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode(['éxito' => true, 'tareas' => $tareas]);

} elseif ($action === 'obtener') {
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        echo json_encode(['éxito' => false, 'mensaje' => 'ID requerido']);
        exit;
    }

    $sql = "SELECT * FROM tareas WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $tarea = $result->fetch_assoc();
        echo json_encode(['éxito' => true, 'tarea' => $tarea]);
    } else {
        echo json_encode(['éxito' => false, 'mensaje' => 'Tarea no encontrada']);
    }

} else {
    echo json_encode(['éxito' => false, 'mensaje' => 'Acción no válida']);
}
