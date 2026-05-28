<?php
/**
 * Dashboard del Usuario (Trabajador)
 */

require_once __DIR__ . '/../config/init.php';

// Verificar autenticación
if (!Auth::verificarAutenticacion()) {
    header('Location: ../login.php');
    exit;
}

// Redirigir si es admin
if (Auth::esAdmin()) {
    header('Location: admin.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TaskMaster Pro - Mis Tareas</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../css/styles.css">
</head>
<body>

<!-- NAVBAR -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
        <a class="navbar-brand" href="#">📋 TaskMaster Pro</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <span class="navbar-text me-3">Bienvenido, <strong><?php echo $_SESSION['nombre_usuario']; ?></strong></span>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" onclick="cerrarSesion(); return false;">Cerrar Sesión</a>
                </li>
            </ul>
        </div>
    </div>
</nav>

<!-- CONTENIDO -->
<div class="container mt-4">
    <div class="row">
        <!-- FORMULARIO CREAR TAREA -->
        <div class="col-lg-4">
            <div class="card">
                <div class="card-header bg-dark text-white">
                    <h5 class="mb-0">✨ Crear Nueva Tarea</h5>
                </div>
                <div class="card-body">
                    <form id="formCrearTarea">
                        <div class="mb-3">
                            <label class="form-label">Título *</label>
                            <input type="text" class="form-control" id="crearTitulo" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Descripción</label>
                            <textarea class="form-control" id="crearDesc" rows="3"></textarea>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Fecha de Vencimiento</label>
                            <input type="date" class="form-control" id="crearFecha">
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Prioridad</label>
                            <select class="form-select" id="crearPrioridad">
                                <option>Baja</option>
                                <option selected>Media</option>
                                <option>Alta</option>
                            </select>
                        </div>

                        <button type="submit" class="btn btn-primary w-100">
                            ➕ Crear Tarea
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <!-- TABLA DE TAREAS -->
        <div class="col-lg-8">
            <div class="card">
                <div class="card-header bg-dark text-white">
                    <h5 class="mb-0">📑 Mis Tareas</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>Título</th>
                                    <th>Prioridad</th>
                                    <th>Vencimiento</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tablaTareas">
                                <tr><td colspan="5" class="text-center">Cargando tareas...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- MODAL EDITAR TAREA -->
<div class="modal fade" id="modalEditarTarea" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-dark text-white">
                <h5 class="modal-title">Editar Tarea</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="formEditarTarea">
                    <input type="hidden" id="editTareaId">
                    <div class="mb-3">
                        <label class="form-label">Título *</label>
                        <input type="text" class="form-control" id="editTareaTitulo" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Descripción</label>
                        <textarea class="form-control" id="editTareaDesc" rows="3"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Prioridad</label>
                        <select class="form-select" id="editTareaPrioridad">
                            <option>Baja</option>
                            <option>Media</option>
                            <option>Alta</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" onclick="guardarEditarTarea()">Guardar Cambios</button>
            </div>
        </div>
    </div>
</div>

<!-- MODAL VER DETALLES -->
<div class="modal fade" id="modalDetalles" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-dark text-white">
                <h5 class="modal-title" id="detallesTitulo">Detalles de la Tarea</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p><strong>Título:</strong> <span id="detalleTitulo"></span></p>
                <p><strong>Descripción:</strong></p>
                <p id="detalleDesc" class="ps-3 border-start"></p>
                <p><strong>Prioridad:</strong> <span id="detallePrioridad"></span></p>
                <p><strong>Vencimiento:</strong> <span id="detalleFecha"></span></p>
                <p><strong>Estado:</strong> <span id="detalleEstado"></span></p>
            </div>
        </div>
    </div>
</div>

<!-- ALERTA -->
<div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
    <div id="alertaToast" class="alert alert-success alert-dismissible fade show" role="alert" style="display:none;">
        <span id="alertaMensaje"></span>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="../assets/js/usuario.js"></script>

</body>
</html>
