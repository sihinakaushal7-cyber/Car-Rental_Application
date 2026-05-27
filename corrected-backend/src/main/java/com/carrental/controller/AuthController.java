// File: src/main/java/com/carrental/controller/AuthController.java
package com.carrental.controller;

import com.carrental.model.User;
import com.carrental.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already taken!"));
        }
        // Default role is USER (not ADMIN)
        user.setRole("USER");
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        System.out.println("Login attempt: " + email);

        return userRepository.findByEmail(email)
                .map(user -> {
                    // Check password
                    if (!user.getPassword().equals(password)) {
                        return ResponseEntity.status(401).body(Map.of("message", "Invalid password"));
                    }

                    // Create response with user data
                    Map<String, Object> response = new HashMap<>();
                    response.put("token", "fake-jwt-token-" + System.currentTimeMillis());

                    // Create user info object
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("id", user.getId());
                    userInfo.put("email", user.getEmail());
                    userInfo.put("firstName", user.getFirstName());
                    userInfo.put("lastName", user.getLastName());
                    userInfo.put("role", user.getRole());

                    response.put("user", userInfo);

                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(401).body(Map.of("message", "User not found")));
    }

    // Create admin user endpoint (for initial setup)
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody Map<String, String> adminData) {
        String email = adminData.get("email");
        String password = adminData.get("password");
        String firstName = adminData.get("firstName");
        String lastName = adminData.get("lastName");

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }

        User admin = new User();
        admin.setEmail(email);
        admin.setPassword(password);
        admin.setFirstName(firstName);
        admin.setLastName(lastName);
        admin.setRole("ADMIN"); // Set as ADMIN

        userRepository.save(admin);

        return ResponseEntity.ok(Map.of("message", "Admin user created successfully"));
    }
}