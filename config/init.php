<?php
/**
 * Archivo de inicialización
 * Se debe incluir en todas las páginas del sistema
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Incluir clases
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Auth.php';

// Crear instancia de base de datos
$db = new Database();
$conn = $db->connect();

// Crear tablas si no existen
$db->createTables();

// Configurar zona horaria
date_default_timezone_set('America/Bogota');
