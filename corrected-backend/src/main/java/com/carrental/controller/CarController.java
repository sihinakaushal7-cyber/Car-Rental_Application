// File: src/main/java/com/carrental/controller/CarController.java
package com.carrental.controller;

import com.carrental.model.Car;
import com.carrental.model.User;
import com.carrental.repository.CarRepository;
import com.carrental.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cars")
@CrossOrigin(origins = "http://localhost:4200")
public class CarController {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all cars - PUBLIC ACCESS
    @GetMapping
    public ResponseEntity<List<Car>> getAllCars(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String transmission,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type) {

        if (category != null || transmission != null || status != null || location != null || type != null) {
            List<Car> allCars = carRepository.findAll();
            List<Car> filteredCars = allCars.stream()
                    .filter(car -> category == null || car.getCategory().equals(category))
                    .filter(car -> transmission == null || car.getTransmission().equals(transmission))
                    .filter(car -> status == null || car.getStatus().equals(status))
                    .filter(car -> location == null || car.getLocation().equals(location))
                    .filter(car -> type == null || (car.getType() != null && car.getType().equals(type)))
                    .toList();
            return ResponseEntity.ok(filteredCars);
        }

        List<Car> cars = carRepository.findAll();
        return ResponseEntity.ok(cars);
    }

    // Get available cars - PUBLIC ACCESS
    @GetMapping("/available")
    public ResponseEntity<List<Car>> getAvailableCars() {
        List<Car> cars = carRepository.findByStatus("available");
        return ResponseEntity.ok(cars);
    }

    // Get car by ID - PUBLIC ACCESS
    @GetMapping("/{id}")
    public ResponseEntity<?> getCarById(@PathVariable Long id) {
        return carRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null));
    }

    // Create new car - ADMIN ONLY (with role check)
    @PostMapping
    public ResponseEntity<?> addCar(@RequestBody Car car,
                                    @RequestHeader(value = "User-Id", required = false) Long userId) {

        // Check if user is admin
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || !"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only admin users can add cars"));
            }
        }

        Map<String, String> errors = new HashMap<>();

        // Validate ALL required fields
        if (car.getBrand() == null || car.getBrand().trim().isEmpty()) {
            errors.put("brand", "Brand is required");
        }
        if (car.getModel() == null || car.getModel().trim().isEmpty()) {
            errors.put("model", "Model is required");
        }
        if (car.getYear() == null) {
            errors.put("year", "Year is required");
        }
        if (car.getLicensePlate() == null || car.getLicensePlate().trim().isEmpty()) {
            errors.put("licensePlate", "License plate is required");
        }
        if (car.getCategory() == null || car.getCategory().trim().isEmpty()) {
            errors.put("category", "Category is required");
        }
        if (car.getTransmission() == null || car.getTransmission().trim().isEmpty()) {
            errors.put("transmission", "Transmission is required");
        }
        if (car.getFuelType() == null || car.getFuelType().trim().isEmpty()) {
            errors.put("fuelType", "Fuel type is required");
        }
        if (car.getSeats() == null) {
            errors.put("seats", "Seats is required");
        }
        if (car.getDailyRate() == null) {
            errors.put("dailyRate", "Daily rate is required");
        }

        if (!errors.isEmpty()) {
            System.out.println("Validation errors: " + errors);
            return ResponseEntity.badRequest().body(errors);
        }

        // Set defaults for optional fields
        if (car.getStatus() == null || car.getStatus().trim().isEmpty()) {
            car.setStatus("available");
        }
        if (car.getMileage() == null) {
            car.setMileage(0);
        }
        if (car.getColor() == null || car.getColor().trim().isEmpty()) {
            car.setColor("White");
        }
        if (car.getLocation() == null || car.getLocation().trim().isEmpty()) {
            car.setLocation("Unknown");
        }
        // Map type to category if type is provided but category is not
        if (car.getType() != null && !car.getType().trim().isEmpty() &&
                (car.getCategory() == null || car.getCategory().trim().isEmpty())) {
            car.setCategory(car.getType());
        }

        try {
            Car savedCar = carRepository.save(car);
            System.out.println("Car saved successfully with ID: " + savedCar.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCar);
        } catch (Exception e) {
            System.err.println("Error saving car: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save car: " + e.getMessage()));
        }
    }

    // Update car - ADMIN ONLY
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCar(@PathVariable Long id,
                                       @RequestBody Car carDetails,
                                       @RequestHeader(value = "User-Id", required = false) Long userId) {

        // Check if user is admin
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || !"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only admin users can update cars"));
            }
        }

        return carRepository.findById(id)
                .map(car -> {
                    car.setBrand(carDetails.getBrand());
                    car.setModel(carDetails.getModel());
                    car.setYear(carDetails.getYear());
                    car.setColor(carDetails.getColor());
                    car.setLicensePlate(carDetails.getLicensePlate());
                    car.setCategory(carDetails.getCategory());
                    car.setTransmission(carDetails.getTransmission());
                    car.setFuelType(carDetails.getFuelType());
                    car.setSeats(carDetails.getSeats());
                    car.setDailyRate(carDetails.getDailyRate());
                    car.setStatus(carDetails.getStatus());
                    car.setImageUrl(carDetails.getImageUrl());
                    car.setLocation(carDetails.getLocation());
                    car.setMileage(carDetails.getMileage());
                    car.setType(carDetails.getType());

                    Car updatedCar = carRepository.save(car);
                    return ResponseEntity.ok(updatedCar);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Update car status - ADMIN ONLY
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateCarStatus(@PathVariable Long id,
                                             @RequestBody Map<String, String> request,
                                             @RequestHeader(value = "User-Id", required = false) Long userId) {

        // Check if user is admin for status updates
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || !"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only admin users can update car status"));
            }
        }

        String status = request.get("status");
        System.out.println("=== STATUS UPDATE REQUEST ===");
        System.out.println("Car ID: " + id);
        System.out.println("Extracted status: " + status);

        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }

        return carRepository.findById(id)
                .map(car -> {
                    System.out.println("Found car: " + car.getBrand() + " " + car.getModel());
                    car.setStatus(status);
                    Car updatedCar = carRepository.save(car);
                    System.out.println("✅ Car updated successfully");
                    return ResponseEntity.ok(updatedCar);
                })
                .orElseGet(() -> {
                    System.err.println("❌ Car not found with ID: " + id);
                    return ResponseEntity.notFound().build();
                });
    }

    // Delete car - ADMIN ONLY
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCar(@PathVariable Long id,
                                       @RequestHeader(value = "User-Id", required = false) Long userId) {

        // Check if user is admin
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || !"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only admin users can delete cars"));
            }
        }

        return carRepository.findById(id)
                .map(car -> {
                    carRepository.delete(car);
                    return ResponseEntity.ok(Map.of("message", "Car deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Search cars by category - PUBLIC ACCESS
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Car>> getCarsByCategory(@PathVariable String category) {
        List<Car> cars = carRepository.findByCategory(category);
        return ResponseEntity.ok(cars);
    }

    // Search cars by type - PUBLIC ACCESS
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Car>> getCarsByType(@PathVariable String type) {
        List<Car> allCars = carRepository.findAll();
        List<Car> filteredCars = allCars.stream()
                .filter(car -> type.equals(car.getType()))
                .toList();
        return ResponseEntity.ok(filteredCars);
    }
}