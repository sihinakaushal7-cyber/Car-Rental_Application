package com.carrental.repository;

import com.carrental.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;


@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByCarId(Long carId);

    List<Booking> findByStatus(String status);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE " +
           "b.car.id = :carId AND " +
           "b.status NOT IN ('cancelled', 'completed') AND " +
           "((b.startDate <= :startDate AND b.endDate >= :startDate) OR " +
           "(b.startDate <= :endDate AND b.endDate >= :endDate) OR " +
           "(b.startDate >= :startDate AND b.endDate <= :endDate))")
    boolean existsOverlappingBooking(@Param("carId") Long carId,
                                    @Param("startDate") LocalDate startDate,
                                    @Param("endDate") LocalDate endDate);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<Booking> findUserBookingsOrderByCreatedAt(@Param("userId") Long userId);
}
