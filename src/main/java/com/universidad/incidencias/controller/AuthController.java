package com.universidad.incidencias.controller;

import com.universidad.incidencias.model.User;
import com.universidad.incidencias.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Usuario y contraseña son requeridos."));
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Credenciales incorrectas."));
        }

        User user = userOpt.get();
        // Retornamos los datos del usuario omitiendo la contraseña por seguridad
        Map<String, Object> response = Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "nombre", user.getNombre(),
                "role", user.getRole().name(),
                "email", user.getEmail()
        );

        return ResponseEntity.ok(response);
    }
}
