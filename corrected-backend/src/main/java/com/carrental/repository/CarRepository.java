package com.carrental.repository;

import com.carrental.model.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface
CarRepository extends JpaRepository<Car, Long> {

    Optional<Car> findByLicensePlate(String licensePlate);

    List<Car> findByStatus(String status);

    List<Car> findByCategory(String category);

    List<Car> findByTransmission(String transmission);

    @Query("SELECT c FROM Car c WHERE c.dailyRate BETWEEN :minPrice AND :maxPrice")
    List<Car> findByPriceRange(@Param("minPrice") BigDecimal minPrice, 
                               @Param("maxPrice") BigDecimal maxPrice);

    @Query("SELECT c FROM Car c WHERE " +
           "(:category IS NULL OR c.category = :category) AND " +
           "(:transmission IS NULL OR c.transmission = :transmission) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:location IS NULL OR c.location = :location)")
    List<Car> findByFilters(@Param("category") String category,
                           @Param("transmission") String transmission,
                           @Param("status") String status,
                           @Param("location") String location);
}
