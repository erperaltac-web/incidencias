<?php
/**
 * Funciones de ayuda para autenticación y verificaciones
 */

class Auth {
    private $db;

    public function __construct($database) {
        $this->db = $database->getConnection();
    }

    /**
     * Registrar usuario
     */
    public function registro($nombre, $usuario, $contraseña) {
        // Validar entrada
        if (strlen($usuario) < 3 || strlen($contraseña) < 5) {
            return ['éxito' => false, 'mensaje' => 'Usuario debe tener mínimo 3 caracteres y contraseña mínimo 5'];
        }

        // Verificar si usuario existe
        $check = $this->db->query("SELECT id FROM usuarios WHERE usuario = '$usuario' LIMIT 1");
        if ($check->num_rows > 0) {
            return ['éxito' => false, 'mensaje' => 'El usuario ya existe'];
        }

        // Encriptar contraseña
        $password_hash = password_hash($contraseña, PASSWORD_BCRYPT);

        // Insertar usuario
        $sql = "INSERT INTO usuarios (nombre, usuario, contraseña, rol) 
                VALUES (?, ?, ?, 'usuario')";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('sss', $nombre, $usuario, $password_hash);

        if ($stmt->execute()) {
            return ['éxito' => true, 'mensaje' => 'Usuario registrado correctamente'];
        } else {
            return ['éxito' => false, 'mensaje' => 'Error al registrar usuario'];
        }
    }

    /**
     * Login de usuario
     */
    public function login($usuario, $contraseña) {
        $sql = "SELECT id, nombre, usuario, rol, contraseña FROM usuarios WHERE usuario = ? AND activo = TRUE LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('s', $usuario);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            return ['éxito' => false, 'mensaje' => 'Usuario o contraseña incorrectos'];
        }

        $user = $result->fetch_assoc();

        if (password_verify($contraseña, $user['contraseña'])) {
            $_SESSION['id_usuario'] = $user['id'];
            $_SESSION['nombre_usuario'] = $user['nombre'];
            $_SESSION['usuario'] = $user['usuario'];
            $_SESSION['rol'] = $user['rol'];
            return ['éxito' => true, 'mensaje' => 'Login exitoso'];
        } else {
            return ['éxito' => false, 'mensaje' => 'Usuario o contraseña incorrectos'];
        }
    }

    /**
     * Verificar si usuario está autenticado
     */
    public static function verificarAutenticacion() {
        return isset($_SESSION['id_usuario']);
    }

    /**
     * Verificar si es administrador
     */
    public static function esAdmin() {
        return isset($_SESSION['rol']) && $_SESSION['rol'] === 'admin';
    }

    /**
     * Obtener ID del usuario actual
     */
    public static function idUsuarioActual() {
        return $_SESSION['id_usuario'] ?? null;
    }

    /**
     * Logout
     */
    public static function logout() {
        session_destroy();
    }
}
