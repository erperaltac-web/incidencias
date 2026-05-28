<?php
/**
 * Script de Instalación de TaskMaster Pro
 * Ejecuta este archivo en el navegador: http://localhost/taskmaster/install.php
 */

// Configuración de conexión
$host = 'localhost';
$user = 'root';
$password = '';
$db = 'taskmaster_pro';

// Conectar a MySQL (sin seleccionar BD primero)
$conn = new mysqli($host, $user, $password);

if ($conn->connect_error) {
    die('❌ Error de conexión: ' . $conn->connect_error);
}

$conn->set_charset('utf8mb4');

echo "<h2>🔧 Instalación de TaskMaster Pro</h2>";
echo "<hr>";

// 1. Crear base de datos
echo "<p><strong>1. Creando base de datos...</strong></p>";
$sql_db = "CREATE DATABASE IF NOT EXISTS taskmaster_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
if ($conn->query($sql_db)) {
    echo "✅ Base de datos creada correctamente<br>";
} else {
    echo "❌ Error: " . $conn->error . "<br>";
}

// Seleccionar BD
$conn->select_db('taskmaster_pro');

// 2. Crear tabla usuarios
echo "<p><strong>2. Creando tabla usuarios...</strong></p>";
$sql_usuarios = "CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'usuario') DEFAULT 'usuario',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_usuario (usuario),
    KEY idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql_usuarios)) {
    echo "✅ Tabla usuarios creada<br>";
} else {
    echo "❌ Error: " . $conn->error . "<br>";
}

// 3. Crear tabla tareas
echo "<p><strong>3. Creando tabla tareas...</strong></p>";
$sql_tareas = "CREATE TABLE IF NOT EXISTS tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion LONGTEXT,
    fecha_vencimiento DATE,
    prioridad ENUM('Baja', 'Media', 'Alta') DEFAULT 'Media',
    estado ENUM('pendiente', 'validado', 'eliminado') DEFAULT 'pendiente',
    fecha_resolucion DATETIME,
    id_usuario INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_usuario (id_usuario),
    KEY idx_estado (estado),
    CONSTRAINT fk_tareas_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql_tareas)) {
    echo "✅ Tabla tareas creada<br>";
} else {
    echo "❌ Error: " . $conn->error . "<br>";
}

// 4. Crear usuario admin
echo "<p><strong>4. Creando usuario admin...</strong></p>";

// Verificar si admin existe
$check = $conn->query("SELECT id FROM usuarios WHERE usuario = 'admin'");
if ($check->num_rows > 0) {
    echo "ℹ️ Usuario admin ya existe<br>";
} else {
    // Crear contraseña encriptada
    $password_admin = password_hash('admin123', PASSWORD_BCRYPT);
    
    // Insertar admin
    $sql_admin = "INSERT INTO usuarios (nombre, usuario, contraseña, rol, activo) 
                  VALUES ('Administrador', 'admin', '$password_admin', 'admin', TRUE)";
    
    if ($conn->query($sql_admin)) {
        echo "✅ Usuario admin creado correctamente<br>";
    } else {
        echo "❌ Error al crear admin: " . $conn->error . "<br>";
    }
}

// 5. Resumen final
echo "<hr>";
echo "<h3>✅ ¡Instalación completada!</h3>";
echo "<p><strong>Credenciales para acceder:</strong></p>";
echo "<ul>";
echo "<li>Usuario: <code>admin</code></li>";
echo "<li>Contraseña: <code>admin123</code></li>";
echo "</ul>";
echo "<p><a href='login.php' style='padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;'>
    ➜ Ir a Login
</a></p>";

$conn->close();
?>

<style>
    body {
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 50px auto;
        padding: 20px;
        background: #f5f5f5;
    }
    h2, h3 {
        color: #333;
    }
    p {
        line-height: 1.6;
    }
    code {
        background: #f0f0f0;
        padding: 2px 6px;
        border-radius: 3px;
    }
    hr {
        border: none;
        border-top: 1px solid #ddd;
        margin: 20px 0;
    }
</style>
