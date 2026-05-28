package com.universidad.incidencias.controller;

import com.universidad.incidencias.model.Incidencia;
import com.universidad.incidencias.model.User;
import com.universidad.incidencias.repository.UserRepository;
import com.universidad.incidencias.service.IncidenciaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/incidencias")
@CrossOrigin(origins = "*")
public class IncidenciaController {

    @Autowired
    private IncidenciaService incidenciaService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Incidencia>> getIncidencias(@RequestParam(required = false) Long creadorId) {
        if (creadorId != null) {
            return ResponseEntity.ok(incidenciaService.findByCreador(creadorId));
        }
        return ResponseEntity.ok(incidenciaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incidencia> getById(@PathVariable Long id) {
        return incidenciaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/verificar-duplicado")
    public ResponseEntity<List<Incidencia>> verificarDuplicado(@RequestBody Map<String, String> request) {
        String titulo = request.get("titulo");
        String descripcion = request.get("descripcion");
        String categoria = request.get("categoria");

        if (titulo == null || descripcion == null || categoria == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Incidencia> duplicados = incidenciaService.findPotentialDuplicates(titulo, descripcion, categoria);
        return ResponseEntity.ok(duplicados);
    }

    @PostMapping
    public ResponseEntity<?> crearIncidencia(@RequestBody Map<String, Object> request) {
        try {
            String titulo = (String) request.get("titulo");
            String descripcion = (String) request.get("descripcion");
            String categoria = (String) request.get("categoria");
            String aula = (String) request.get("aula");
            Long creadorId = Long.valueOf(request.get("creadorId").toString());

            Optional<User> creadorOpt = userRepository.findById(creadorId);
            if (creadorOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Docente no válido."));
            }

            Incidencia incidencia = new Incidencia(titulo, descripcion, categoria, aula, creadorOpt.get());
            Incidencia guardada = incidenciaService.save(incidencia);
            return ResponseEntity.ok(guardada);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al crear la incidencia: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Optional<Incidencia> incidenciaOpt = incidenciaService.findById(id);
            if (incidenciaOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Incidencia no encontrada."));
            }

            Incidencia incidencia = incidenciaOpt.get();
            String nuevoEstado = (String) request.get("estado"); // ATENDIENDO, FINALIZADO, RECHAZADO
            Long tecnicoId = Long.valueOf(request.get("tecnicoId").toString());
            String justificacion = (String) request.get("justificacion");

            Optional<User> tecnicoOpt = userRepository.findById(tecnicoId);
            if (tecnicoOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Técnico de TI no válido."));
            }

            incidencia.setEstado(nuevoEstado);
            incidencia.setTecnico(tecnicoOpt.get());
            
            if ("FINALIZADO".equals(nuevoEstado) || "RECHAZADO".equals(nuevoEstado)) {
                if (justificacion == null || justificacion.trim().isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("message", "La justificación es requerida para cerrar o rechazar incidencias."));
                }
                incidencia.setJustificacion(justificacion);
                incidencia.setFechaResolucion(java.time.LocalDateTime.now());
            }

            Incidencia actualizada = incidenciaService.save(incidencia);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al actualizar estado: " + e.getMessage()));
        }
    }

    @GetMapping("/notificaciones")
    public ResponseEntity<List<Incidencia>> obtenerPendientes() {
        return ResponseEntity.ok(incidenciaService.findByEstado("PENDIENTE"));
    }
}
