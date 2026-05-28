/**
 * JavaScript para Autenticación
 * Maneja login, registro y validaciones
 */

// Cambiar entre tabs de login y registro
function cambiarTab(tab) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
    });
    
    // Mostrar tab seleccionado
    document.getElementById('tab-' + tab).classList.add('active');
    
    // Actualizar botones activos
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// LOGIN
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('loginUsuario').value;
    const contraseña = document.getElementById('loginPassword').value;
    
    const formData = new FormData();
    formData.append('action', 'login');
    formData.append('usuario', usuario);
    formData.append('contraseña', contraseña);
    
    fetch('api/auth.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.éxito) {
            // Redirigir según el rol
            window.location.href = 'views/admin.php';
        } else {
            mostrarAlerta(data.mensaje, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarAlerta('Error en el servidor', 'danger');
    });
});

// REGISTRO
document.getElementById('registroForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('regNombre').value;
    const usuario = document.getElementById('regUsuario').value;
    const contraseña = document.getElementById('regPassword').value;
    
    const formData = new FormData();
    formData.append('action', 'registro');
    formData.append('nombre', nombre);
    formData.append('usuario', usuario);
    formData.append('contraseña', contraseña);
    
    fetch('api/auth.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.éxito) {
            mostrarAlerta('¡Registro exitoso! Inicia sesión', 'success');
            document.getElementById('registroForm').reset();
            setTimeout(() => cambiarTab('login'), 1500);
        } else {
            mostrarAlerta(data.mensaje, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarAlerta('Error en el servidor', 'danger');
    });
});

// Mostrar alerta
function mostrarAlerta(mensaje, tipo = 'info') {
    const alert = document.getElementById('alert');
    alert.className = `alert alert-${tipo}`;
    alert.textContent = mensaje;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 4000);
}
