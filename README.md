# SinfonIA - Sistema de Gestión de Incidencias Universitario

SinfonIA es una aplicación web premium diseñada para gestionar incidencias técnicas, de redes, hardware y software en campus universitarios. Permite la comunicación fluida entre **Docentes** (quienes reportan problemas), personal de **TI / Soporte Técnico** (quienes atienden, resuelven o rechazan incidencias) y **Administradores** (quienes auditan métricas e incidencias globales).

---

## 🎨 Características Destacadas
* **Interfaz Premium "Glassmorphism":** Diseño oscuro moderno con efectos translúcidos, tipografía elegante (*Outfit*), transiciones suaves e íconos interactivos.
* **Detector Inteligente de Duplicados (Jaccard Similarity):** Al escribir un título o descripción, el sistema analiza en tiempo real si ya existe una incidencia abierta similar en la misma categoría y aula, alertando al docente para evitar reportes redundantes.
* **Alertas Sonoras y Visuales para TI:** Sistema de monitoreo automático (polling optimizado) que reproduce un sonido de campana y emite notificaciones flotantes (*Toasts*) cuando ingresa un nuevo reporte.
* **Doble Modo Operativo (API vs Demo):** Incorpora un interruptor inteligente que conmuta entre la conexión con el servidor Java y un simulador local (*Mock Mode* via `localStorage`). ¡Puedes probar toda la app inmediatamente sin instalar Java!

---

## 🔑 Credenciales de Acceso Rápido (Pruebas)
Puedes iniciar sesión inmediatamente con los siguientes usuarios de prueba (se auto-completan en el Login haciendo clic en los botones de acceso rápido):

| Rol | Usuario | Contraseña | Nombre Completo | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| **Docente** | `docente1` | `docente123` | Dr. Juan Pérez | Reportar incidencias, ver historial y recibir alertas de duplicado |
| **Docente** | `docente2` | `docente123` | Dra. María Gómez | Reportar incidencias secundarias |
| **Soporte TI** | `tecnico1` | `ti123` | Ing. Carlos Dávila (Redes) | Atender reportes, recibir notificaciones y finalizarlos/rechazarlos |
| **Soporte TI** | `tecnico2` | `ti123` | Soporte General (Hardware) | Atender problemas de hardware |
| **Admin** | `admin` | `admin123` | Administrador General | Supervisión general de métricas e incidencias |

---

## 📁 Estructura del Proyecto

```text
sistema-incidencias/
├── pom.xml                                  # Configuración de Maven y dependencias de Spring Boot
├── README.md                                # Este manual de uso
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── universidad/
        │           └── incidencias/
        │               ├── IncidenciasApplication.java   # Clase principal (Entrypoint Spring Boot)
        │               ├── controller/
        │               │   ├── AuthController.java        # API Login y Sesión
        │               │   └── IncidenciaController.java  # API Reportes, duplicados y notificaciones
        │               ├── model/
        │               │   ├── Role.java                  # Enum de Roles (Docente, TI, Admin)
        │               │   ├── User.java                  # Entidad de Usuarios
        │               │   └── Incidencia.java            # Entidad de Incidencias
        │               ├── repository/
        │               │   ├── UserRepository.java        # Consultas DB de Usuarios
        │               │   └── IncidenciaRepository.java  # Consultas DB de Incidencias
        │               └── service/
        │                   └── IncidenciaService.java     # Lógica de duplicados y transiciones
        └── resources/
            ├── application.properties       # Puerto, consola H2 y propiedades Spring Boot
            ├── data.sql                     # Población inicial de base de datos H2
            └── static/                      # Frontend Integrado en Spring Boot
                ├── index.html               # Estructura SPA principal
                ├── css/
                │   └── styles.css           # Estilos Premium Glassmorphism y Animaciones
                └── js/
                    └── app.js               # Rutas de frontend, polling y modo demostración
```

---

## 🚀 Instrucciones de Ejecución

### Opción A: Ejecución Instantánea en Navegador (Modo Demo)
No necesitas tener Java ni Maven instalados.
1. Navega hasta la carpeta: `C:\Users\Usuario\.gemini\antigravity\scratch\sistema-incidencias\src\main\resources\static\`
2. Haz **doble clic** en `index.html` para abrirlo en tu navegador favorito (Chrome, Edge, Firefox, etc.).
3. Asegúrate de que el interruptor superior diga **"Modo Demo Activo"**.
4. ¡Prueba el flujo completo! Loguéate como Docente, crea una incidencia, luego cambia de rol a TI para atenderla y resolverla.

### Opción B: Con Servidor Java Backend (Spring Boot + H2)
1. Abre tu IDE de preferencia (IntelliJ IDEA, Eclipse o VS Code) y carga la carpeta `sistema-incidencias` como proyecto Maven.
2. Asegúrate de tener instalado **JDK 17** o superior.
3. Si utilizas una terminal con Maven configurado, ejecuta el siguiente comando en la raíz del proyecto:
   ```bash
   mvn spring-boot:run
   ```
4. El servidor de Spring Boot arrancará en el puerto **`8080`**.
5. Abre en tu navegador la dirección: [http://localhost:8080/index.html](http://localhost:8080/index.html).
6. El frontend detectará automáticamente el servidor y el interruptor cambiará a **"Conectado a Servidor Java"**.
7. **Consola de Base de Datos H2:** Puedes auditar la base de datos en memoria ingresando a [http://localhost:8080/h2-console](http://localhost:8080/h2-console).
   * **JDBC URL:** `jdbc:h2:mem:incidenciasdb`
   * **Usuario:** `sa`
   * **Contraseña:** `admin`
