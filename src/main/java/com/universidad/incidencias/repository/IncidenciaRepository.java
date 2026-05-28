package com.universidad.incidencias.repository;

import com.universidad.incidencias.model.Incidencia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidenciaRepository extends JpaRepository<Incidencia, Long> {
    List<Incidencia> findByCreadorIdOrderByFechaCreacionDesc(Long creadorId);
    List<Incidencia> findByEstado(String estado);
    List<Incidencia> findAllByOrderByFechaCreacionDesc();
    List<Incidencia> findByCategoriaAndEstadoIn(String categoria, List<String> estados);
}
