package com.universidad.incidencias.service;

import com.universidad.incidencias.model.Incidencia;
import com.universidad.incidencias.repository.IncidenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class IncidenciaService {

    @Autowired
    private IncidenciaRepository incidenciaRepository;

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "en", "y", "o", "no", "se", "para", "con", "por", "que", "es", "esta"
    ));

    public Incidencia save(Incidencia incidencia) {
        return incidenciaRepository.save(incidencia);
    }

    public List<Incidencia> findAll() {
        return incidenciaRepository.findAllByOrderByFechaCreacionDesc();
    }

    public Optional<Incidencia> findById(Long id) {
        return incidenciaRepository.findById(id);
    }

    public List<Incidencia> findByCreador(Long creadorId) {
        return incidenciaRepository.findByCreadorIdOrderByFechaCreacionDesc(creadorId);
    }

    public List<Incidencia> findByEstado(String estado) {
        return incidenciaRepository.findByEstado(estado);
    }

    /**
     * Busca incidencias activas similares que puedan ser duplicados en la misma categoría.
     */
    public List<Incidencia> findPotentialDuplicates(String titulo, String descripcion, String categoria) {
        List<Incidencia> activas = incidenciaRepository.findByCategoriaAndEstadoIn(
                categoria, Arrays.asList("PENDIENTE", "ATENDIENDO")
        );

        return activas.stream()
                .filter(i -> calculateSimilarity(titulo, descripcion, i) >= 0.4)
                .collect(Collectors.toList());
    }

    /**
     * Calcula un índice de similitud básico entre los datos de entrada y una incidencia existente.
     */
    private double calculateSimilarity(String t1, String d1, Incidencia existente) {
        String t2 = existente.getTitulo();
        String d2 = existente.getDescripcion();

        double simTitulo = getWordJaccardSimilarity(t1, t2);
        double simDesc = getWordJaccardSimilarity(d1, d2);

        // Ponderación: 70% título (más representativo de duplicación directa) y 30% descripción
        return (simTitulo * 0.7) + (simDesc * 0.3);
    }

    private double getWordJaccardSimilarity(String s1, String s2) {
        if (s1 == null || s2 == null || s1.trim().isEmpty() || s2.trim().isEmpty()) {
            return 0.0;
        }

        Set<String> words1 = tokenize(s1);
        Set<String> words2 = tokenize(s2);

        if (words1.isEmpty() || words2.isEmpty()) {
            return 0.0;
        }

        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);

        Set<String> union = new HashSet<>(words1);
        union.addAll(words2);

        return (double) intersection.size() / union.size();
    }

    private Set<String> tokenize(String str) {
        String clean = str.toLowerCase()
                .replaceAll("[^a-záéíóúüñ0-9\\s]", " ") // Elimina signos de puntuación
                .replaceAll("\\s+", " ");               // Normaliza espacios
        
        String[] tokens = clean.split(" ");
        Set<String> words = new HashSet<>();
        for (String t : tokens) {
            String trimmed = t.trim();
            if (trimmed.length() > 2 && !STOP_WORDS.contains(trimmed)) {
                words.add(trimmed);
            }
        }
        return words;
    }
}
