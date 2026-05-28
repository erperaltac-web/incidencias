<?php
/**
 * Clase de conexión a la base de datos
 * Utiliza MySQLi para conexión orientada a objetos
 */

class Database {
    private $host = 'localhost';
    private $db = 'taskmaster_pro';
    private $user = 'root';
    private $password = '';
    private $port = 3306;
    private $connection;

    public function connect() {
        $this->connection = new mysqli(
            $this->host,
            $this->user,
            $this->password,
            $this->db,
            $this->port
        );

        // Verificar errores de conexión
        if ($this->connection->connect_error) {
            die('Error de conexión: ' . $this->connection->connect_error);
        }

        // Establecer charset UTF-8
        $this->connection->set_charset('utf8mb4');

        return $this->connection;
    }

    public function getConnection() {
        if (!$this->connection) {
            $this->connect();
        }
        return $this->connection;
    }

    public function close() {
        if ($this->connection) {
            $this->connection->close();
        }
    }

    /**
     * Crear las tablas de la base de datos
     */
    public function createTables() {
        $conn = $this->getConnection();

        // Tabla de usuarios
        $usuarios_sql = "CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            usuario VARCHAR(50) UNIQUE NOT NULL,
            contraseña VARCHAR(255) NOT NULL,
            rol ENUM('admin', 'usuario') DEFAULT 'usuario',
            activo BOOLEAN DEFAULT TRUE,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        // Tabla de tareas
        $tareas_sql = "CREATE TABLE IF NOT EXISTS tareas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(200) NOT NULL,
            descripcion TEXT,
            fecha_vencimiento DATE,
            prioridad ENUM('Baja', 'Media', 'Alta') DEFAULT 'Media',
            estado ENUM('pendiente', 'validado', 'eliminado') DEFAULT 'pendiente',
            fecha_resolucion DATETIME,
            id_usuario INT NOT NULL,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        // Ejecutar creación de tablas
        if (!$conn->query($usuarios_sql)) {
            echo 'Error en tabla usuarios: ' . $conn->error;
            return false;
        }

        if (!$conn->query($tareas_sql)) {
            echo 'Error en tabla tareas: ' . $conn->error;
            return false;
        }

        // Crear usuario admin si no existe
        $check_admin = $conn->query("SELECT id FROM usuarios WHERE usuario = 'admin' LIMIT 1");
        
        if ($check_admin->num_rows == 0) {
            $password_hash = password_hash('admin123', PASSWORD_BCRYPT);
            $insert_admin = "INSERT INTO usuarios (nombre, usuario, contraseña, rol) 
                           VALUES ('Administrador', 'admin', '$password_hash', 'admin')";
            $conn->query($insert_admin);
        }

        return true;
    }
}

// Inicializar sesión
session_start();
