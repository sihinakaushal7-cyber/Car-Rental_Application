// File: src/app/components/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { VehicleService } from "../../services/vehicle.service";
import { BookingService } from "../../services/booking.service";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.css"],
})
export class AdminDashboardComponent implements OnInit {
  totalVehicles = 0;
  totalBookings = 0;
  activeBookings = 0;
  revenue = 0;
  recentBookings: any[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private vehicleService: VehicleService,
    private bookingService: BookingService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Load vehicles count
    this.vehicleService.getAllVehicles().subscribe((vehicles) => {
      this.totalVehicles = vehicles.length;
    });

    // Load bookings data (only admin can see all bookings)
    this.bookingService.getAllBookings().subscribe((bookings) => {
      this.totalBookings = bookings.length;
      this.activeBookings = bookings.filter(
        (b) => b.status === "CONFIRMED" || b.status === "ACTIVE",
      ).length;

      this.revenue = bookings.reduce((sum, booking) => {
        const cost = booking.totalCost || 0;
        return sum + cost;
      }, 0);

      // Get recent bookings
      this.recentBookings = bookings
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 5);

      this.isLoading = false;
    });
  }

  goToAddCar(): void {
    this.router.navigate(["/add-car"]);
  }

  goToBookings(): void {
    this.router.navigate(["/admin/bookings"]);
  }

  goToVehicles(): void {
    // This could be a separate admin vehicles management page
    this.router.navigate(["/vehicles"]);
  }
}
