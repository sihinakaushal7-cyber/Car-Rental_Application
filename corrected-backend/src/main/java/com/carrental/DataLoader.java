package com.carrental;

import com.carrental.model.User;
import com.carrental.model.Car;
import com.carrental.repository.UserRepository;
import com.carrental.repository.CarRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CarRepository carRepository;

    public DataLoader(UserRepository userRepository, CarRepository carRepository) {
        this.userRepository = userRepository;
        this.carRepository = carRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        loadUsers();
        loadCars();
    }

    private void loadUsers() {
        if (userRepository.count() == 0) {
            // Create admin user (store plain password temporarily)
            User admin = new User();
            admin.setEmail("admin@carrental.com");
            admin.setPassword("admin123"); // Plain password for now
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setPhone("1234567890");
            admin.setRole("ADMIN");

            // Create customer user
            User customer = new User();
            customer.setEmail("customer@carrental.com");
            customer.setPassword("customer123");
            customer.setFirstName("John");
            customer.setLastName("Doe");
            customer.setPhone("9876543210");
            customer.setRole("USER");

            userRepository.saveAll(Arrays.asList(admin, customer));
            System.out.println("=== Users loaded successfully ===");
        }
    }

    private void loadCars() {
        if (carRepository.count() == 0) {
            // Create sample cars
            Car car1 = new Car();
            car1.setBrand("Toyota");
            car1.setModel("Camry");
            car1.setYear(2023);
            car1.setColor("White");
            car1.setLicensePlate("ABC-123");
            car1.setCategory("SEDAN");
            car1.setTransmission("AUTOMATIC");
            car1.setFuelType("GASOLINE");
            car1.setSeats(5);
            car1.setDailyRate(new BigDecimal("50.00")); // Required field
            car1.setStatus("available");
            car1.setLocation("New York");
            car1.setMileage(10000);
            car1.setImageUrl("https://images.unsplash.com/photo-1549399542-7e3f8b79c341");


            Car car2 = new Car();
            car2.setBrand("Honda");
            car2.setModel("Civic");
            car2.setYear(2022);
            car2.setColor("Black");
            car2.setLicensePlate("XYZ-789");
            car2.setCategory("SEDAN");
            car2.setTransmission("AUTOMATIC");
            car2.setFuelType("HYBRID");
            car2.setSeats(5);
            car2.setDailyRate(new BigDecimal("45.00")); // Required field
            car2.setStatus("available");
            car2.setLocation("Los Angeles");
            car2.setMileage(15000);
            car2.setImageUrl("https://images.unsplash.com/photo-1542282088-fe8426682b8f");



            carRepository.saveAll(Arrays.asList(car1, car2));
            System.out.println("=== Cars loaded successfully ===");
        }
    }
}