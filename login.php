<?php
/**
 * Página de Login y Registro
 */

require_once __DIR__ . '/config/init.php';

// Si ya está autenticado, redirigir
if (Auth::verificarAutenticacion()) {
    if (Auth::esAdmin()) {
        header('Location: views/admin.php');
    } else {
        header('Location: views/usuario.php');
    }
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TaskMaster Pro - Autenticación</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/styles.css">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .auth-container {
            width: 100%;
            max-width: 450px;
        }
        .card {
            border: none;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            border-radius: 15px;
        }
        .card-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 15px 15px 0 0 !important;
            text-align: center;
        }
        .card-header h3 {
            color: white;
            margin: 0;
            font-weight: 600;
        }
        .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            padding: 10px;
            font-weight: 600;
        }
        .btn-primary:hover {
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }
        .tabs {
            display: flex;
            margin-bottom: 20px;
            gap: 10px;
        }
        .tab-btn {
            flex: 1;
            padding: 10px;
            border: 2px solid #ddd;
            background: white;
            cursor: pointer;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s;
        }
        .tab-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: transparent;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .alert {
            display: none;
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo h1 {
            color: white;
            font-weight: 700;
            font-size: 2.5em;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>

<div class="auth-container">
    <div class="logo">
        <h1>📋 TaskMaster Pro</h1>
    </div>

    <div class="card">
        <div class="card-header">
            <h3>Bienvenido</h3>
        </div>
        <div class="card-body p-4">
            <div id="alert" class="alert alert-warning"></div>

            <div class="tabs">
                <button class="tab-btn active" onclick="cambiarTab('login')">Login</button>
                <button class="tab-btn" onclick="cambiarTab('registro')">Registrarse</button>
            </div>

            <!-- TAB LOGIN -->
            <div id="tab-login" class="tab-content active">
                <form id="loginForm">
                    <div class="mb-3">
                        <label class="form-label">Usuario</label>
                        <input type="text" class="form-control" id="loginUsuario" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Contraseña</label>
                        <input type="password" class="form-control" id="loginPassword" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Ingresar</button>
                    <small class="text-muted d-block mt-2">
                        💡 Demo: usuario: <strong>admin</strong>, contraseña: <strong>admin123</strong>
                    </small>
                </form>
            </div>

            <!-- TAB REGISTRO -->
            <div id="tab-registro" class="tab-content">
                <form id="registroForm">
                    <div class="mb-3">
                        <label class="form-label">Nombre Completo</label>
                        <input type="text" class="form-control" id="regNombre" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Usuario</label>
                        <input type="text" class="form-control" id="regUsuario" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Contraseña</label>
                        <input type="password" class="form-control" id="regPassword" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Registrarse</button>
                </form>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="assets/js/auth.js"></script>

</body>
</html>
