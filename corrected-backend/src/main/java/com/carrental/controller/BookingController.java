// File: src/main/java/com/carrental/controller/BookingController.java
package com.carrental.controller;

import com.carrental.model.Booking;
import com.carrental.model.Car;
import com.carrental.model.User;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:4200")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    public BookingController(BookingRepository bookingRepository,
                             CarRepository carRepository,
                             UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
        this.userRepository = userRepository;
    }

    // Get all bookings - ADMIN ONLY
    @GetMapping
    public ResponseEntity<?> getAllBookings(@RequestHeader(value = "User-Id", required = false) Long userId) {
        // Check if user is admin
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && "ADMIN".equals(user.getRole())) {
                return ResponseEntity.ok(bookingRepository.findAll());
            }
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Only admin users can view all bookings"));
    }

    // Create booking - BOTH ADMIN and USER can book
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking,
                                           @RequestHeader(value = "User-Id", required = false) Long userId) {

        // Validate user
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User ID is required"));
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get car
        Car car = carRepository.findById(booking.getCar().getId())
                .orElseThrow(() -> new RuntimeException("Car not found"));

        // Check if car is available
        if (!"available".equals(car.getStatus())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Car is not available for booking"));
        }

        // Validate dates
        if (booking.getStartDate() == null || booking.getEndDate() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Start date and end date are required"));
        }

        if (booking.getStartDate().isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Start date cannot be in the past"));
        }

        if (booking.getEndDate().isBefore(booking.getStartDate())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "End date must be after start date"));
        }

        // Calculate number of days and total cost
        long days = ChronoUnit.DAYS.between(booking.getStartDate(), booking.getEndDate()) + 1;
        BigDecimal totalCost = car.getDailyRate().multiply(BigDecimal.valueOf(days));

        // Set booking details
        booking.setUser(user);
        booking.setCar(car);
        booking.setTotalCost(totalCost);
        booking.setStatus("confirmed"); // Auto-confirm for demo

        // Update car status
        car.setStatus("booked");
        carRepository.save(car);

        // Save booking
        Booking savedBooking = bookingRepository.save(booking);

        return ResponseEntity.ok(savedBooking);
    }

    // Get user's own bookings - USER can see their own bookings
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBookings(@PathVariable Long userId,
                                             @RequestHeader(value = "Current-User-Id", required = false) Long currentUserId) {

        // User can only see their own bookings (unless admin)
        boolean isAdmin = false;
        if (currentUserId != null) {
            User currentUser = userRepository.findById(currentUserId).orElse(null);
            isAdmin = currentUser != null && "ADMIN".equals(currentUser.getRole());
        }

        // Allow access if: user is viewing their own bookings OR user is admin
        if (currentUserId != null && (currentUserId.equals(userId) || isAdmin)) {
            List<Booking> bookings = bookingRepository.findUserBookingsOrderByCreatedAt(userId);
            return ResponseEntity.ok(bookings);
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "You can only view your own bookings"));
    }

    // Get booking by ID - USER can see their own, ADMIN can see all
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id,
                                            @RequestHeader(value = "User-Id", required = false) Long userId) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Check permission
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            boolean isOwner = booking.getUser().getId().equals(userId);
            boolean isAdmin = user != null && "ADMIN".equals(user.getRole());

            if (isOwner || isAdmin) {
                return ResponseEntity.ok(booking);
            }
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "You don't have permission to view this booking"));
    }

    // Accept booking - ADMIN ONLY
    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptBooking(@PathVariable Long id,
                                           @RequestHeader(value = "User-Id", required = false) Long userId) {

        // Check if user is admin
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || !"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only admin users can accept bookings"));
            }
        }

        return bookingRepository.findById(id).map(booking -> {
            booking.setStatus("accepted");
            System.out.println("NOTIFICATION: Booking #" + id + " for user " +
                    booking.getUser().getId() + " has been ACCEPTED.");
            return ResponseEntity.ok(bookingRepository.save(booking));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Cancel booking - USER can cancel their own, ADMIN can cancel any
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id,
                                           @RequestHeader(value = "User-Id", required = false) Long userId) {

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User ID is required"));
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check permission: user owns booking OR user is admin
        boolean isOwner = booking.getUser().getId().equals(userId);
        boolean isAdmin = "ADMIN".equals(user.getRole());

        if (!isOwner && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to cancel this booking"));
        }

        // Update booking status
        booking.setStatus("cancelled");

        // Make car available again
        Car car = booking.getCar();
        car.setStatus("available");
        carRepository.save(car);

        Booking updatedBooking = bookingRepository.save(booking);
        return ResponseEntity.ok(updatedBooking);
    }

    // New endpoint: Get all bookings for admin dashboard
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllBookingsForAdmin(@RequestHeader(value = "User-Id", required = false) Long userId) {
        // Check if user is admin
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && "ADMIN".equals(user.getRole())) {
                List<Booking> bookings = bookingRepository.findAll();

                // Create response with user and car details
                List<Map<String, Object>> response = bookings.stream().map(booking -> {
                    Map<String, Object> bookingMap = new HashMap<>();
                    bookingMap.put("id", booking.getId());
                    bookingMap.put("startDate", booking.getStartDate());
                    bookingMap.put("endDate", booking.getEndDate());
                    bookingMap.put("totalCost", booking.getTotalCost());
                    bookingMap.put("status", booking.getStatus());
                    bookingMap.put("pickupLocation", booking.getPickupLocation());
                    bookingMap.put("createdAt", booking.getCreatedAt());

                    // Add user details
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", booking.getUser().getId());
                    userMap.put("firstName", booking.getUser().getFirstName());
                    userMap.put("lastName", booking.getUser().getLastName());
                    userMap.put("email", booking.getUser().getEmail());
                    bookingMap.put("user", userMap);

                    // Add vehicle details
                    Map<String, Object> carMap = new HashMap<>();
                    carMap.put("id", booking.getCar().getId());
                    carMap.put("brand", booking.getCar().getBrand());
                    carMap.put("model", booking.getCar().getModel());
                    carMap.put("year", booking.getCar().getYear());
                    bookingMap.put("vehicle", carMap);

                    return bookingMap;
                }).toList();

                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Only admin users can view all bookings"));
    }
}