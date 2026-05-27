// booking-list.component.ts
import { Component, OnInit } from "@angular/core";
import { BookingService } from "../../services/booking.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-booking-list",
  templateUrl: "./booking-list.component.html",
  styleUrls: ["./booking-list.component.css"],
})
export class BookingListComponent implements OnInit {
  bookings: any[] = [];
  userId: number = 1;
  isLoading: boolean = true;
  errorMessage: string = "";
  isAdmin: boolean | undefined;

  constructor(
    private bookingService: BookingService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    console.log("📋 BookingListComponent initialized");
    console.log("User logged in?", !!localStorage.getItem("token"));
    console.log("Current user:", localStorage.getItem("currentUser"));

    this.checkUserRole();
    this.loadBookings();

    // Test localStorage directly
    this.debugLocalStorage();
  }
  logFirstBookingDetails(): void {
    if (this.bookings.length > 0) {
      console.log("=== FIRST BOOKING DETAILS ===");
      const first = this.bookings[0];
      console.log("Full object:", first);
      console.log("Keys:", Object.keys(first));
      console.log("Status:", first.status);
      console.log("Status type:", typeof first.status);
      console.log("Status lowercase:", first.status?.toLowerCase());
      console.log("Has car property:", "car" in first);
      console.log("Car object:", first.car);
    } else {
      console.log("No bookings to debug");
    }
  }
  debugLocalStorage() {
    console.log("=== LOCALSTORAGE DEBUG ===");
    const keys = [
      "lastBooking",
      "userBookings",
      "bookings",
      "currentUser",
      "token",
    ];

    keys.forEach((key) => {
      try {
        const value = localStorage.getItem(key);

        if (value) {
          if (key === "token") {
            // Token is a string, not JSON - don't parse it!
            console.log(`${key}:`, `[JWT Token] ${value.substring(0, 20)}...`);
          } else {
            // Try to parse other keys as JSON
            try {
              const parsed = JSON.parse(value);
              console.log(`${key}:`, parsed);
            } catch (jsonError) {
              // If not valid JSON, just show the string
              console.log(`${key}:`, `[String] ${value.substring(0, 50)}...`);
            }
          }
        } else {
          console.log(`${key}:`, "NOT FOUND");
        }
      } catch (error) {
        console.error(`Error with key ${key}:`, error);
      }
    });
  }
  checkUserRole(): void {
    console.log("🔐 Checking user role...");

    try {
      const currentUserStr = localStorage.getItem("currentUser");

      if (currentUserStr) {
        try {
          const currentUser = JSON.parse(currentUserStr);
          console.log("✅ Current user object:", currentUser);

          // Set userId if available
          if (currentUser.id) {
            this.userId = currentUser.id;
            console.log(`🆔 User ID set to: ${this.userId}`);
          }

          // Check for role - this is CRITICAL
          if (currentUser.role) {
            console.log(`🎭 User role: ${currentUser.role}`);
            this.isAdmin = currentUser.role.toUpperCase() === "ADMIN";
          } else {
            // Default to user if no role specified
            this.isAdmin = false;
            console.log("ℹ️ No role found, defaulting to USER");
          }
        } catch (parseError) {
          console.error("❌ Error parsing currentUser JSON:", parseError);
          console.log(
            "ℹ️ Raw currentUser value:",
            currentUserStr.substring(0, 50),
          );

          // Try to extract from string
          if (currentUserStr.includes("admin")) {
            this.isAdmin = true;
            console.log("ℹ️ Detected admin from string");
          }
        }
      } else {
        console.log("ℹ️ No currentUser found in localStorage");
        this.isAdmin = false; // Default to regular user
      }
    } catch (error) {
      console.error("⚠️ Error in checkUserRole:", error);
      this.isAdmin = false;
    }

    console.log(`🎭 Final role check: ${this.isAdmin ? "ADMIN" : "USER"}`);
  }

  loadBookings(): void {
    this.isLoading = true;
    this.errorMessage = "";

    // Check if user is admin to load all bookings
    if (this.isAdmin) {
      console.log("👑 Loading ALL bookings (Admin mode)");
      this.bookingService.getAllBookings().subscribe({
        next: (data) => {
          console.log("📦 All bookings (Admin):", data);
          this.bookings = data || [];
          this.isLoading = false;

          if (this.bookings.length === 0) {
            console.log("ℹ️ Admin: No bookings found, using mock data fallback");
            this.useMockData();
          } else {
            this.logFirstBookingDetails();
          }
        },
        error: (err) => {
          console.error("❌ Error fetching all bookings", err);
          this.errorMessage = "Failed to load bookings. Please try again.";
          this.isLoading = false;
          this.useMockData();
        },
      });
    } else {
      // Regular user - load only their bookings
      console.log("👤 Loading user's bookings for user ID:", this.userId);
      this.bookingService.getUserBookings(this.userId).subscribe({
        next: (data) => {
          console.log("📦 User's bookings:", data);
          this.bookings = data || [];
          this.isLoading = false;

          // If no bookings, show empty state
          if (!data || data.length === 0) {
            console.log("ℹ️ No bookings found for user");
          }
        },
        error: (err) => {
          console.error("❌ Error fetching user bookings", err);
          this.errorMessage =
            "Failed to load bookings. Using sample data instead.";
          this.isLoading = false;

          // Try to use localStorage data
          const allBookings = JSON.parse(
            localStorage.getItem("allBookings") || "[]",
          );
          this.bookings =
            allBookings.filter((b: any) => b.userId === this.userId) || [];

          if (this.bookings.length === 0) {
            this.useMockData();
          }
        },
      });
    }
  }

  // Helper method to get car name
  getCarName(booking: any): string {
    const car = booking.car;
    if (!car) return "Unknown Vehicle";

    // Check if brand exists and is not empty
    if (car.brand && car.brand.trim() !== "") {
      return `${car.brand} ${car.model}`;
    } else {
      return car.model || "Unknown Car";
    }
  }

  // Helper method to count active bookings
  getActiveBookingsCount(): number {
    return this.bookings.filter(
      (b) =>
        b.status === "PENDING" ||
        b.status === "CONFIRMED" ||
        b.status === "ACCEPTED",
    ).length;
  }

  // Helper method to calculate total spent
  getTotalSpent(): number {
    return this.bookings.reduce((sum, booking) => {
      return sum + (booking.totalCost || 0);
    }, 0);
  }

  onCancel(bookingId: number): void {
    console.log("🗑️ Cancellation requested for booking:", bookingId);

    // Find the booking to show details
    const booking = this.bookings.find((b) => b.id === bookingId);

    if (!booking) {
      alert("Booking not found!");
      return;
    }

    // Check if booking can be cancelled
    if (booking.status === "CANCELLED") {
      alert("This booking is already cancelled.");
      return;
    }

    if (booking.status === "COMPLETED") {
      alert("Cannot cancel a completed booking.");
      return;
    }

    // Calculate if it's too late to cancel (e.g., less than 24 hours before start)
    const startDate = new Date(booking.startDate);
    const now = new Date();
    const hoursUntilStart =
      (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilStart < 24) {
      const proceed = confirm(
        `Warning: This booking starts in ${Math.ceil(hoursUntilStart)} hours.\n` +
        `Cancellation may incur fees.\n\n` +
        `Do you still want to cancel?`,
      );

      if (!proceed) return;
    }

    // Show confirmation with booking details
    const confirmationMessage =
      `Are you sure you want to cancel this booking?\n\n` +
      `Booking #${bookingId}\n` +
      `Vehicle: ${this.getCarName(booking)}\n` +
      `Dates: ${this.formatDate(booking.startDate)} to ${this.formatDate(booking.endDate)}\n` +
      `Total: $${booking.totalCost}`;

    if (!confirm(confirmationMessage)) {
      return;
    }

    // Show loading
    this.isLoading = true;

    // Call the service
    this.bookingService.cancelBooking(bookingId).subscribe({
      next: (response) => {
        console.log("✅ Cancellation successful:", response);

        // Update local bookings array
        this.bookings = this.bookings.map((b) => {
          if (b.id === bookingId) {
            return { ...b, status: "CANCELLED" };
          }
          return b;
        });

        // Show success message
        alert(`Booking #${bookingId} has been cancelled successfully.`);

        this.isLoading = false;

        // Optional: Refresh the list
        // this.loadBookings();
      },
      error: (err) => {
        console.error("❌ Cancellation error:", err);
        alert(`Failed to cancel booking: ${err.message || "Unknown error"}`);
        this.isLoading = false;
      },
    });
  }

  onViewDetails(bookingId: number): void {
    this.router.navigate(["/booking-details", bookingId]);
  }

  formatDate(dateString: string): string {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  }

  calculateDuration(startDate: string, endDate: string): number {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      return 0;
    }
  }

  navigateToBrowse(): void {
    this.router.navigate(["/vehicles"]);
  }

  // For testing if API fails
  private useMockData(): void {
    this.bookings = [
      {
        id: 1,
        user: {
          id: 1,
          email: "Dinuk2002@gmail.com",
          firstName: "dinuk",
          lastName: "deshan",
        },
        car: {
          id: 1,
          brand: "Tesla",
          model: "Model 3",
          year: 2024,
          category: "Sedan",
          transmission: "Automatic",
          fuelType: "Electric",
          seats: 5,
          dailyRate: 120.0,
          status: "booked",
        },
        startDate: "2025-12-31",
        endDate: "2026-01-05",
        pickupLocation: "Airport Terminal 1",
        dropoffLocation: "Downtown Office",
        totalCost: 500.0,
        status: "CONFIRMED",
        paymentStatus: "pending",
        createdAt: "2025-12-30T10:56:43.552199",
      },
    ];
    this.isLoading = false;
    console.log("✅ Mock data loaded for testing");
  }

  // Debug method
  debugData(): void {
    console.log("=== DEBUG DATA ===");
    console.log("Bookings array:", this.bookings);
    console.log("Number of bookings:", this.bookings.length);

    if (this.bookings.length > 0) {
      const first = this.bookings[0];
      console.log("First booking:", first);
      console.log("Car object:", first.car);
      console.log("Car brand:", first.car?.brand);
      console.log("Car model:", first.car?.model);
      console.log("Car category:", first.car?.category);
      console.log("Car year:", first.car?.year);
      console.log("Car fuel type:", first.car?.fuelType);
      console.log("Status:", first.status);
    }
  }

  // In booking-list.component.ts, add this method
  debugBookingStructure(): void {
    console.log("🔍 Debugging booking structure...");

    // Check what's in bookings array
    console.log("Current bookings in component:", this.bookings);
    console.log("Number of bookings:", this.bookings.length);

    if (this.bookings.length > 0) {
      this.bookings.forEach((booking, index) => {
        console.log(`Booking ${index + 1}:`);
        console.log("- Full object:", booking);
        console.log("- Type of car:", typeof booking.car);
        console.log("- Car property exists:", "car" in booking);

        if (booking.car) {
          console.log("- Car object:", booking.car);
          console.log("- Car brand:", booking.car.brand);
          console.log("- Car model:", booking.car.model);
        }

        // Test getCarName
        console.log("- getCarName result:", this.getCarName(booking));
      });
    }

    // Also check localStorage directly
    const stored = JSON.parse(localStorage.getItem("allBookings") || "[]");
    console.log("Direct localStorage check:", stored.length, "bookings");
  }
  // In booking-list.component.ts, add this method
  debugDates(): void {
    console.log("📅 Debugging dates...");

    if (this.bookings.length > 0) {
      this.bookings.forEach((booking, index) => {
        console.log(`Booking ${index + 1}:`);
        console.log("- ID:", booking.id);
        console.log("- Start Date string:", booking.startDate);
        console.log("- End Date string:", booking.endDate);

        // Parse and check
        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);

        console.log("- Parsed Start:", start);
        console.log("- Parsed End:", end);
        console.log("- Is Start valid?", !isNaN(start.getTime()));
        console.log("- Is End valid?", !isNaN(end.getTime()));
        console.log("- Today:", new Date());
        console.log("---");
      });
    } else {
      console.log("No bookings to debug");
    }
  }
}
