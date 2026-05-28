# 📋 TaskMaster Pro v1.0
## Sistema Web Completo de Gestión de Tareas

Aplicación web profesional para gestionar tareas en tiempo real con autenticación, roles de usuario y panel administrativo.

### ✨ Características Principales

**Sistema de Autenticación**
- Login y registro de usuarios
- Dos roles: Administrador y Trabajador
- Sesiones seguras con protección de contraseña (bcrypt)
- Control de acceso por rol

**Panel del Administrador**
- 👁️ Visualizar todas las tareas del sistema en tiempo real
- ✏️ Editar cualquier tarea
- ✓ Validar tareas (marca como completada con fecha)
- ✕ Eliminar tareas (cambio de estado, no borrado físico)
- 👥 Gestionar usuarios (crear y desactivar)
- 📊 Tabla de tareas responsiva con filtros

**Panel del Trabajador**
- ➕ Crear nuevas tareas
- ✏️ Editar sus propias tareas
- 👀 Ver todas sus tareas en tabla
- 📑 Filtrar tareas por estado
- 🔒 Solo puede ver y editar sus tareas

### 🛠️ Stack Tecnológico

**Frontend**
- HTML5 semántico
- CSS3 con diseño responsivo
- Bootstrap 5.3 (componentes UI)
- JavaScript moderno (AJAX, Fetch API)

**Backend**
- PHP 7.4+ (programación orientada a objetos)
- MySQL 5.7+ (base de datos relacional)
- API REST (comunicación cliente-servidor)

**Seguridad**
- Encriptación de contraseñas (bcrypt)
- Validación en servidor
- Sesiones protegidas
- Queries preparadas (prevención SQL injection)

### 📁 Estructura del Proyecto

```
taskmaster/
├── config/                 # Configuración y autenticación
│   ├── Database.php       # Clase de conexión BD
│   ├── Auth.php           # Funciones de autenticación
│   └── init.php           # Inicialización global
│
├── api/                    # APIs REST
│   ├── auth.php           # Autenticación (login/logout)
│   ├── tareas.php         # CRUD de tareas
│   └── usuarios.php       # Gestión de usuarios (admin)
│
├── views/                  # Vistas/Dashboards
│   ├── admin.php          # Dashboard del administrador
│   └── usuario.php        # Dashboard del usuario
│
├── assets/                 # Recursos estáticos
│   ├── js/                # JavaScript
│   │   ├── auth.js        # Lógica de login/registro
│   │   ├── admin.js       # Lógica del dashboard admin
│   │   └── usuario.js     # Lógica del dashboard usuario
│   └── css/
│       └── styles.css     # Estilos globales
│
├── database/              # Scripts de BD
│   └── schema.sql         # Estructura de tablas
│
├── login.php              # Página de autenticación
├── index.php              # Redirección a login
├── SETUP.md               # Guía de instalación
└── README.md              # Este archivo
```

### 📊 Modelo de Datos

**Tabla: usuarios**
- `id`: Identificador único
- `nombre`: Nombre completo
- `usuario`: Usuario (único)
- `contraseña`: Hash bcrypt
- `rol`: admin o usuario
- `activo`: Booleano (soft delete)
- `fecha_creacion`: Timestamp automático
- `fecha_actualizacion`: Timestamp automático

**Tabla: tareas**
- `id`: Identificador único
- `titulo`: Título de la tarea
- `descripcion`: Descripción detallada
- `fecha_vencimiento`: Fecha de vencimiento
- `prioridad`: Alta, Media, Baja
- `estado`: pendiente, validado, eliminado
- `fecha_resolucion`: Cuando fue validada
- `id_usuario`: Propietario de la tarea (FK)
- `fecha_creacion`: Timestamp automático
- `fecha_actualizacion`: Timestamp automático

### 🔑 Estados de las Tareas

| Estado | Descripción | Visible Para |
|--------|-------------|--------------|
| **pendiente** | Tarea recién creada | Usuario + Admin |
| **validado** | Completada y aprobada | Usuario + Admin |
| **eliminado** | Marcada como eliminada | Solo Admin |

### 🎯 Flujo de Usuario

**Nuevo Usuario**
1. Registrarse en página de login
2. Se crea como usuario "Trabajador"
3. Accede a su dashboard personal
4. Puede crear y editar tareas

**Administrador**
1. Usuario predefinido: `admin` / `admin123`
2. Accede a panel especial
3. Puede gestionar todas las tareas y usuarios
4. Puede crear nuevos administradores

### 🚀 Instalación Rápida

1. **Clona o descarga el proyecto**
   ```bash
   git clone https://github.com/usuario/taskmaster.git
   cd taskmaster
   ```

2. **Configura tu servidor**
   - Coloca en raíz web (htdocs, www, etc)
   - XAMPP: `C:\xampp\htdocs\taskmaster`
   - Linux: `/var/www/html/taskmaster`

3. **Accede en el navegador**
   ```
   http://localhost/taskmaster
   ```

4. **Inicia sesión**
   - Usuario: `admin`
   - Contraseña: `admin123`

*Para detalles de instalación, ver [SETUP.md](SETUP.md)*

### 🎨 Interfaz

- **Colores principales**: Púrpura/Azul (#667eea)
- **Iconos**: Unicode emojis para mejor visualización
- **Responsive**: Adaptado a mobile, tablet y desktop
- **Animaciones**: Transiciones suaves y feedback visual

### ⚡ Rendimiento

- ✓ Auto-actualización cada 20-30 segundos (AJAX)
- ✓ Índices de BD para consultas rápidas
- ✓ Compresión CSS y JS
- ✓ Lazy loading de componentes

### 🔒 Seguridad

- ✓ Contraseñas encriptadas con bcrypt
- ✓ Queries preparadas (prepared statements)
- ✓ Validación en servidor
- ✓ Sesiones seguras
- ✓ Control de acceso granular

### 📝 API Endpoints

#### Autenticación
```
POST /api/auth.php
- action: login, registro, logout
- username, password (login)
- nombre, usuario, password (registro)
```

#### Tareas
```
GET  /api/tareas.php?action=listar
GET  /api/tareas.php?action=obtener&id=1
POST /api/tareas.php
- action: crear, actualizar, eliminar, validar
- titulo, descripcion, fecha_vencimiento, prioridad
```

#### Usuarios (Admin)
```
GET  /api/usuarios.php?action=listar
POST /api/usuarios.php
- action: crear, eliminar
- nombre, usuario, contraseña, rol
```

### 🐛 Troubleshooting

**Error de conexión BD**
- Verifica que MySQL esté corriendo
- Revisa credenciales en `config/Database.php`
- Verifica puerto MySQL (3306 por defecto)

**Tabla no existe**
- El sistema la crea automáticamente al acceder
- Si falla, importa `database/schema.sql`

**No puedo iniciar sesión**
- Usuario por defecto: admin / admin123
- Verifica que usuario esté activo (activo = 1)

### 📚 Documentación Adicional

- [SETUP.md](SETUP.md) - Guía detallada de instalación
- Código con comentarios en cada archivo
- APIs documentadas en archivos PHP

### 🔄 Actualización en Tiempo Real

El sistema se actualiza automáticamente:
- **Dashboard Admin**: Cada 20 segundos
- **Dashboard Usuario**: Cada 30 segundos
- Eliminación lógica: Los datos se conservan
- Auditoría: Todas las acciones tienen timestamp

### 💡 Casos de Uso

✅ Pequeños equipos de trabajo  
✅ Gestión de proyectos interno  
✅ Organización personal  
✅ Control administrativo  
✅ Base para expansión futura  

### 🚦 Próximas Mejoras (Futuro)

- [ ] Notificaciones por email
- [ ] Exportar reportes (PDF/Excel)
- [ ] Gráficas de productividad
- [ ] Asignación de tareas entre usuarios
- [ ] Comentarios en tareas
- [ ] Categorías/etiquetas
- [ ] Integración con Google Calendar

### 📄 Licencia

Código abierto - Libre para uso educativo y comercial

### 👨‍💻 Autor

**TaskMaster Pro v1.0**  
Sistema de Gestión de Tareas  
Desarrollado con ❤️ en 2026

---

**¿Preguntas?** Revisa la documentación o contacta al soporte.
