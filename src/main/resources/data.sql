-- Inserción de Usuarios Iniciales (Contraseñas en texto plano para demostración simple)
-- H2 crea las tablas basándose en las entidades JPA antes de ejecutar este archivo.
-- Nota: La tabla se llama 'app_users' para evitar conflictos con palabras reservadas en H2.

-- Docentes
INSERT INTO app_users (id, username, password, nombre, role, email) VALUES 
(1, 'docente1', 'docente123', 'Dr. Juan Pérez', 'DOCENTE', 'juan.perez@universidad.edu'),
(2, 'docente2', 'docente123', 'Dra. María Gómez', 'DOCENTE', 'maria.gomez@universidad.edu');

-- Personal de Soporte TI
INSERT INTO app_users (id, username, password, nombre, role, email) VALUES 
(3, 'tecnico1', 'ti123', 'Ing. Carlos Dávila (Redes)', 'TI', 'carlos.davila@universidad.edu'),
(4, 'tecnico2', 'ti123', 'Soporte General (Hardware)', 'TI', 'soporte.ti@universidad.edu');

-- Administrador
INSERT INTO app_users (id, username, password, nombre, role, email) VALUES 
(5, 'admin', 'admin123', 'Administrador General', 'ADMINISTRADOR', 'admin@universidad.edu');

-- Inserción de Incidencias de Prueba
-- Formato de campos: id, titulo, descripcion, categoria, aula, estado, fecha_creacion, creador_id, tecnico_id, justificacion, fecha_resolucion
INSERT INTO incidencias (id, titulo, descripcion, categoria, aula, estado, fecha_creacion, creador_id, tecnico_id, justificacion, fecha_resolucion) VALUES 
(1, 'Proyector no enciende', 'El proyector del aula no responde al control remoto ni al botón físico. Luz roja parpadeante.', 'HARDWARE', 'Aula 302 - Edificio B', 'PENDIENTE', CURRENT_TIMESTAMP(), 1, NULL, NULL, NULL),
(2, 'Sin conexión a Internet', 'Las PCs de la fila central no obtienen dirección IP y el cable de red parece estar en buen estado.', 'REDES', 'Laboratorio 105 - Edificio de Sistemas', 'ATENDIENDO', CURRENT_TIMESTAMP(), 2, 3, NULL, NULL),
(3, 'Licencia de software vencida', 'El software MATLAB muestra error de licencia expirada al intentar iniciar sesión.', 'SOFTWARE', 'Laboratorio de Cómputo Avanzado', 'FINALIZADO', CURRENT_TIMESTAMP(), 1, 3, 'Se actualizaron las licencias en el servidor central de licencias de la universidad.', CURRENT_TIMESTAMP());
