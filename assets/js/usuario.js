/**
 * JavaScript para Dashboard de Usuario
 * Maneja creación, edición y visualización de tareas
 */

const modalEditarTarea = new bootstrap.Modal(document.getElementById('modalEditarTarea'));
const modalDetalles = new bootstrap.Modal(document.getElementById('modalDetalles'));

let tareaActual = null;

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    cargarTareas();
    
    // Listener para crear tarea
    document.getElementById('formCrearTarea').addEventListener('submit', crearTarea);
    
    // Auto-actualizar cada 30 segundos
    setInterval(cargarTareas, 30000);
});

// Cargar tareas del usuario
function cargarTareas() {
    const formData = new FormData();
    formData.append('action', 'listar');
    
    fetch('../api/tareas.php?action=listar', {
        method: 'GET'
    })
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

// Renderizar tareas en la tabla
function renderizarTareas(tareas) {
    const tabla = document.getElementById('tablaTareas');
    
    if (tareas.length === 0) {
        tabla.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No tienes tareas aún</td></tr>';
        return;
    }
    
    tabla.innerHTML = tareas.map(tarea => {
        const estadoClass = tarea.estado === 'validado' ? 'bg-success text-white' : 'bg-warning';
        const fechaVenc = tarea.fecha_vencimiento ? new Date(tarea.fecha_vencimiento).toLocaleDateString('es-CO') : '-';
        
        return `
            <tr>
                <td><strong>${tarea.titulo}</strong></td>
                <td>
                    <span class="badge ${getPrioridadBadge(tarea.prioridad)}">
                        ${tarea.prioridad}
                    </span>
                </td>
                <td>${fechaVenc}</td>
                <td>
                    <span class="badge ${estadoClass}">
                        ${tarea.estado.toUpperCase()}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="verDetalles(${tarea.id})">👁️ Ver</button>
                    <button class="btn btn-sm btn-warning" onclick="editarTarea(${tarea.id})">✏️ Editar</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Crear nueva tarea
function crearTarea(e) {
    e.preventDefault();
    
    const titulo = document.getElementById('crearTitulo').value;
    const descripcion = document.getElementById('crearDesc').value;
    const fecha = document.getElementById('crearFecha').value;
    const prioridad = document.getElementById('crearPrioridad').value;
    
    const formData = new FormData();
    formData.append('action', 'crear');
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('fecha_vencimiento', fecha);
    formData.append('prioridad', prioridad);
    
    fetch('../api/tareas.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.éxito) {
            mostrarAlerta('✅ Tarea creada correctamente', 'success');
            document.getElementById('formCrearTarea').reset();
            cargarTareas();
        } else {
            mostrarAlerta(data.mensaje, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarAlerta('Error al crear tarea', 'danger');
    });
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
        } else {
            mostrarAlerta(data.mensaje, 'danger');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Guardar cambios de tarea editada
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

// Ver detalles de tarea
function verDetalles(id) {
    fetch(`../api/tareas.php?action=obtener&id=${id}`)
    .then(response => response.json())
    .then(data => {
        if (data.éxito) {
            const tarea = data.tarea;
            document.getElementById('detalleTitulo').textContent = tarea.titulo;
            document.getElementById('detalleDesc').textContent = tarea.descripcion || '(Sin descripción)';
            document.getElementById('detallePrioridad').innerHTML = 
                `<span class="badge ${getPrioridadBadge(tarea.prioridad)}">${tarea.prioridad}</span>`;
            document.getElementById('detalleFecha').textContent = 
                tarea.fecha_vencimiento ? new Date(tarea.fecha_vencimiento).toLocaleDateString('es-CO') : '-';
            document.getElementById('detalleEstado').innerHTML = 
                `<span class="badge ${tarea.estado === 'validado' ? 'bg-success' : 'bg-warning'}">${tarea.estado.toUpperCase()}</span>`;
            modalDetalles.show();
        }
    })
    .catch(error => console.error('Error:', error));
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
