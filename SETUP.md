# 📋 TaskMaster Pro - Guía de Instalación

## Requisitos
- PHP 7.4+ (recomendado PHP 8.0+)
- MySQL 5.7+ o MariaDB
- Servidor web (Apache, Nginx, etc.)
- Navegador web moderno

## Instalación Rápida

### 1. Descargar el proyecto
- Coloca los archivos en la carpeta raíz de tu servidor web
- Ej: `C:\xampp\htdocs\taskmaster` o `/var/www/html/taskmaster`

### 2. Configurar la Base de Datos

#### Opción A: Creación Automática (Recomendado)
El sistema crea automáticamente las tablas la primera vez que accedes:
1. Abre tu navegador y ve a `http://localhost/taskmaster`
2. Te redirigirá automáticamente a `login.php`
3. Las tablas se crearán en la base de datos automáticamente

#### Opción B: Importar SQL Manualmente
Si prefieres crear las tablas manualmente:
1. Abre phpMyAdmin o tu cliente MySQL
2. Crea una base de datos llamada `taskmaster_pro`
3. Ejecuta el script SQL incluido en `database/schema.sql`

### 3. Configurar Credenciales BD (Si es necesario)

Si tu servidor MySQL tiene contraseña o usuario diferente:

1. Abre `config/Database.php`
2. Modifica estos valores:
   ```php
   private $host = 'localhost';      // Tu host
   private $db = 'taskmaster_pro';    // Nombre BD
   private $user = 'root';            // Usuario MySQL
   private $password = '';            // Contraseña MySQL
   private $port = 3306;              // Puerto
   ```

### 4. ¡Acceder al Sistema!

Abre tu navegador y ve a:
```
http://localhost/taskmaster
```

## Credenciales Demo

**Usuario Admin (por defecto):**
- Usuario: `admin`
- Contraseña: `admin123`

**Crear usuarios de prueba:**
1. Inicia sesión como admin
2. Ve a "Gestionar Usuarios"
3. Click en "+ Nuevo Usuario"
4. Crea usuarios con rol "Trabajador"

## Estructura del Proyecto

```
taskmaster/
├── config/
│   ├── Database.php       # Conexión BD y operaciones
│   ├── Auth.php          # Autenticación y sesiones
│   └── init.php          # Inicialización global
├── api/
│   ├── auth.php          # API de autenticación
│   ├── tareas.php        # API de tareas (CRUD)
│   └── usuarios.php      # API de usuarios (admin)
├── views/
│   ├── admin.php         # Dashboard administrador
│   └── usuario.php       # Dashboard usuario
├── assets/
│   ├── js/
│   │   ├── auth.js       # Lógica de login/registro
│   │   ├── admin.js      # Lógica dashboard admin
│   │   └── usuario.js    # Lógica dashboard usuario
│   └── css/
│       └── styles.css    # Estilos globales
├── login.php             # Página de autenticación
└── index.php             # Redirige a login
```

## Funcionalidades

### Panel de Administrador
- ✅ Ver todas las tareas del sistema
- ✅ Editar cualquier tarea
- ✅ Validar tareas (marca como resuelta)
- ✅ Eliminar tareas (cambio de estado, no borrado)
- ✅ Crear nuevos usuarios
- ✅ Desactivar usuarios
- ✅ Actualización en tiempo real (cada 20 segundos)

### Panel de Usuario/Trabajador
- ✅ Crear nuevas tareas
- ✅ Editar sus propias tareas
- ✅ Ver sus tareas en tabla
- ✅ Filtrar por estado y prioridad
- ✅ Ver detalles de cada tarea
- ✅ Auto-actualización cada 30 segundos

### Seguridad
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Sesiones protegidas
- ✅ Verificación de permisos (admin/usuario)
- ✅ Control de acceso por rol

## Características Técnicas

### Base de Datos
- **Tabla usuarios**: id, nombre, usuario, contraseña, rol, activo, fechas
- **Tabla tareas**: id, titulo, descripcion, fecha_vencimiento, prioridad, estado, fecha_resolucion, id_usuario, fechas

### Estados de Tarea
- **pendiente**: Tarea recién creada
- **validado**: Tarea completada por admin
- **eliminado**: Tarea marcada como eliminada (no visible para usuario)

### Prioridades
- **Alta**: Rojo
- **Media**: Amarillo (por defecto)
- **Baja**: Azul

## Troubleshooting

### Error: "Error de conexión a la base de datos"
- Verifica que MySQL esté corriendo
- Verifica usuario y contraseña en `config/Database.php`
- Verifica que el puerto sea correcto (por defecto 3306)

### Error: "Tabla no existe"
- El sistema crea tablas automáticamente
- Si no se crean, importa `database/schema.sql` manualmente

### No puedo iniciar sesión
- Verifica que hayas creado la BD correctamente
- Usuario demo: `admin` / `admin123`
- Verifica que los usuarios estén activos

## API REST (Para integración)

### Autenticación
```
POST /api/auth.php
- action: login, registro, logout
- usuario, contraseña, nombre (para registro)
```

### Tareas
```
GET  /api/tareas.php?action=listar
POST /api/tareas.php - action: crear, actualizar, eliminar, validar, obtener
```

### Usuarios (Admin)
```
GET  /api/usuarios.php?action=listar
POST /api/usuarios.php - action: crear, eliminar
```

## Notas Importantes

1. **Eliminación Lógica**: Las tareas no se borran, solo cambian de estado
2. **Auto-actualización**: Los dashboards se actualizan automáticamente
3. **Sesiones**: Se destruyen al cerrar sesión
4. **Seguridad**: No uses en producción sin HTTPS y otras medidas

## Soporte

Para reportar problemas o sugerencias, revisa el código comentado:
- Cada archivo PHP tiene comentarios explicativos
- Los archivos JS tienen funciones bien documentadas
- CSS está organizado por secciones

---

**TaskMaster Pro v1.0** © 2026
Sistema de Gestión de Tareas en Tiempo Real
