/**
 * JavaScript para Dashboard de Admin
 * Maneja gestión de tareas y usuarios
 */

const modalEditarTarea = new bootstrap.Modal(document.getElementById('modalEditarTarea'));
const modalNuevoUsuario = new bootstrap.Modal(document.getElementById('modalNuevoUsuario'));
const modalConfirmar = new bootstrap.Modal(document.getElementById('modalConfirmar'));

let accionConfirmar = null;
let tareaActual = null;

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    // Cargar tareas al iniciar
    cargarTareas();
    cargarUsuarios();
    
    // Listeners para tabs
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            cambiarTab(this.dataset.tab);
        });
    });
    
    // Auto-actualizar cada 20 segundos
    setInterval(cargarTareas, 20000);
});

// Cambiar tab
function cambiarTab(tab) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(el => {
        el.style.display = 'none';
    });
    
    // Mostrar tab seleccionado
    document.getElementById('tab-' + tab).style.display = 'block';
    
    // Actualizar botones activos
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ==================== TAREAS ====================

// Cargar todas las tareas
function cargarTareas() {
    fetch('../api/tareas.php?action=listar')
    .then(response => response.json())
    .then(data => {
        if (data.éxito) {
            renderizarTareas(data.tareas);
        } else {
            mostrarAlerta(data.mensaje, 'warning');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Renderizar tareas en tabla
function renderizarTareas(tareas) {
    const tabla = document.getElementById('tablaTareas');
    
    if (tareas.length === 0) {
        tabla.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay tareas</td></tr>';
        return;
    }
    
    tabla.innerHTML = tareas.map(tarea => {
        const fecha = tarea.fecha_vencimiento ? new Date(tarea.fecha_vencimiento).toLocaleDateString('es-CO') : '-';
        const estadoClass = tarea.estado === 'validado' ? 'bg-success' : 
                           tarea.estado === 'eliminado' ? 'bg-danger' : 'bg-warning';
        
        return `
            <tr>
                <td>${tarea.id}</td>
                <td><strong>${tarea.titulo}</strong></td>
                <td>${tarea.nombre_usuario || 'Sistema'}</td>
                <td>
                    <span class="badge ${getPrioridadBadge(tarea.prioridad)}">
                        ${tarea.prioridad}
                    </span>
                </td>
                <td>
                    <span class="badge ${estadoClass}">
                        ${tarea.estado.toUpperCase()}
                    </span>
                </td>
                <td>${fecha}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-info" onclick="editarTarea(${tarea.id})" title="Editar">✏️</button>
                        <button class="btn btn-success" onclick="validarTarea(${tarea.id})" 
                                ${tarea.estado === 'validado' ? 'disabled' : ''} title="Validar">✓</button>
                        <button class="btn btn-danger" onclick="eliminarTarea(${tarea.id})" 
                                ${tarea.estado === 'eliminado' ? 'disabled' : ''} title="Eliminar">✕</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Editar tarea
function editarTarea(id) {
    fetch(`../api/tareas.php?action=obtener&id=${id}`)
    .then(response => response.json())
    .then(data => {
        if (data.éxito) {
            const tarea = data.tarea;
            document.getElementById('editTareaId').value = tarea.id;
            document.getElementById('editTareaTitulo').value = tarea.titulo;
            document.getElementById('editTareaDesc').value = tarea.descripcion;
            document.getElementById('editTareaPrioridad').value = tarea.prioridad;
            tareaActual = tarea;
            modalEditarTarea.show();
        }
    })
    .catch(error => console.error('Error:', error));
}

// Guardar edición de tarea
function guardarEditarTarea() {
    const id = document.getElementById('editTareaId').value;
    const titulo = document.getElementById('editTareaTitulo').value;
    const descripcion = document.getElementById('editTareaDesc').value;
    const prioridad = document.getElementById('editTareaPrioridad').value;
    
    const formData = new FormData();
    formData.append('action', 'actualizar');
    formData.append('id', id);
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('prioridad', prioridad);
    
    fetch('../api/tareas.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.éxito) {
            mostrarAlerta('✅ Tarea actualizada', 'success');
            modalEditarTarea.hide();
            cargarTareas();
        } else {
            mostrarAlerta(data.mensaje, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarAlerta('Error al actualizar tarea', 'danger');
    });
}

// Validar tarea
function validarTarea(id) {
    const formData = new FormData();
    formData.append('action', 'validar');
    formData.append('id', id);
    
    fetch('../api/tareas.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.éxito) {
            mostrarAlerta('✅ Tarea validada', 'success');
            cargarTareas();
        } else {
            mostrarAlerta(data.mensaje, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarAlerta('Error al validar tarea', 'danger');
    });
}

// Eliminar tarea (lógicamente)
function eliminarTarea(id) {
    document.getElementById('modalConfirmarTitulo').textContent = 'Eliminar Tarea';
    document.getElementById('modalConfirmarMensaje').textContent = 
        '¿Deseas eliminar esta tarea? (Se marcará como eliminada pero no se borrará de la base de datos)';
    
    accionConfirmar = () => {
        const formData = new FormData();
        formData.append('action', 'eliminar');
        formData.append('id', id);
        
        fetch('../api/tareas.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.éxito) {
                mostrarAlerta('✅ Tarea eliminada', 'success');
                cargarTareas();
                modalConfirmar.hide();
            } else {
                mostrarAlerta(data.mensaje, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarAlerta('Error al eliminar tarea', 'danger');
        });
    };
    
    document.getElementById('btnConfirmarAccion').onclick = accionConfirmar;
    modalConfirmar.show();
}

// ==================== USUARIOS ====================

// Cargar usuarios
function cargarUsuarios() {
    fetch('../api/usuarios.php?action=listar')
    .then(response => response.json())
    .then(data => {
        if (data.éxito) {
            renderizarUsuarios(data.usuarios);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Renderizar usuarios en tabla
function renderizarUsuarios(usuarios) {
    const tabla = document.getElementById('tablaUsuarios');
    
    tabla.innerHTML = usuarios.map(usuario => {
        const estado = usuario.activo ? 'Activo' : 'Inactivo';
        const estadoClass = usuario.activo ? 'bg-success' : 'bg-danger';
        
        return `
            <tr>
                <td>${usuario.id}</td>
                <td>${usuario.nombre}</td>
                <td><code>${usuario.usuario}</code></td>
                <td>
                    <span class="badge ${usuario.rol === 'admin' ? 'bg-danger' : 'bg-info'}">
                        ${usuario.rol.toUpperCase()}
                    </span>
                </td>
                <td>
                    <span class="badge ${estadoClass}">
                        ${estado}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${usuario.id}, '${usuario.nombre}')"
                            ${usuario.rol === 'admin' ? 'disabled' : ''} title="Eliminar usuario">
                        ✕ Eliminar
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Abrir modal para nuevo usuario
function abrirModalNuevoUsuario() {
    document.getElementById('formNuevoUsuario').reset();
    modalNuevoUsuario.show();
}

// Crear nuevo usuario
function guardarNuevoUsuario() {
    const nombre = document.getElementById('nuevoUsNombre').value;
    const usuario = document.getElementById('nuevoUsUsuario').value;
    const contraseña = document.getElementById('nuevoUsPassword').value;
    const rol = document.getElementById('nuevoUsRol').value;
    
    const formData = new FormData();
    formData.append('action', 'crear');
    formData.append('nombre', nombre);
    formData.append('usuario', usuario);
    formData.append('contraseña', contraseña);
    formData.append('rol', rol);
    
    fetch('../api/usuarios.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.éxito) {
            mostrarAlerta('✅ Usuario creado correctamente', 'success');
            modalNuevoUsuario.hide();
            cargarUsuarios();
        } else {
            mostrarAlerta(data.mensaje, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarAlerta('Error al crear usuario', 'danger');
    });
}

// Eliminar usuario (desactivar)
function eliminarUsuario(id, nombre) {
    document.getElementById('modalConfirmarTitulo').textContent = 'Eliminar Usuario';
    document.getElementById('modalConfirmarMensaje').textContent = 
        `¿Desactivas el usuario "${nombre}"? No podrá iniciar sesión pero sus datos se conservarán.`;
    
    accionConfirmar = () => {
        const formData = new FormData();
        formData.append('action', 'eliminar');
        formData.append('id', id);
        
        fetch('../api/usuarios.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.éxito) {
                mostrarAlerta('✅ Usuario eliminado', 'success');
                cargarUsuarios();
                modalConfirmar.hide();
            } else {
                mostrarAlerta(data.mensaje, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarAlerta('Error al eliminar usuario', 'danger');
        });
    };
    
    document.getElementById('btnConfirmarAccion').onclick = accionConfirmar;
    modalConfirmar.show();
}

// Cerrar sesión
function cerrarSesion() {
    const formData = new FormData();
    formData.append('action', 'logout');
    
    fetch('../api/auth.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        window.location.href = '../login.php';
    });
}

// Mostrar alerta
function mostrarAlerta(mensaje, tipo = 'info') {
    const toast = document.getElementById('alertaToast');
    const mensaje_span = document.getElementById('alertaMensaje');
    
    toast.className = `alert alert-${tipo} alert-dismissible fade show`;
    mensaje_span.textContent = mensaje;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 4000);
}

// Obtener clase Badge según prioridad
function getPrioridadBadge(prioridad) {
    const badges = {
        'Alta': 'bg-danger',
        'Media': 'bg-warning text-dark',
        'Baja': 'bg-info'
    };
    return badges[prioridad] || 'bg-secondary';
}
