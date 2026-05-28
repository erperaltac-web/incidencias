-- TaskMaster Pro - Base de Datos
-- Importar este script en phpMyAdmin si las tablas no se crean automáticamente

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS `taskmaster_pro` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `taskmaster_pro`;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `usuario` varchar(50) NOT NULL UNIQUE,
  `contraseña` varchar(255) NOT NULL,
  `rol` enum('admin','usuario') DEFAULT 'usuario',
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuarios` (`usuario`),
  KEY `activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Tareas
CREATE TABLE IF NOT EXISTS `tareas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) NOT NULL,
  `descripcion` longtext,
  `fecha_vencimiento` date,
  `prioridad` enum('Baja','Media','Alta') DEFAULT 'Media',
  `estado` enum('pendiente','validado','eliminado') DEFAULT 'pendiente',
  `fecha_resolucion` datetime,
  `id_usuario` int(11) NOT NULL,
  `fecha_creacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `estado` (`estado`),
  KEY `fecha_creacion` (`fecha_creacion`),
  CONSTRAINT `tareas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario admin por defecto
-- Usuario: admin
-- Contraseña: admin123 (encriptada con bcrypt)
INSERT IGNORE INTO `usuarios` (`nombre`, `usuario`, `contraseña`, `rol`) 
VALUES ('Administrador', 'admin', '$2y$10$2Veg6bkq/b7CzqJZLxvwkuxCqCGOkq7w/p/n5JsOcP8KL7Oa7z5Ze', 'admin');

-- Crear índices para mejor rendimiento
CREATE INDEX `idx_tareas_usuario_estado` ON `tareas` (`id_usuario`, `estado`);
CREATE INDEX `idx_tareas_fecha_vencimiento` ON `tareas` (`fecha_vencimiento`);
CREATE INDEX `idx_usuarios_activo_rol` ON `usuarios` (`activo`, `rol`);
