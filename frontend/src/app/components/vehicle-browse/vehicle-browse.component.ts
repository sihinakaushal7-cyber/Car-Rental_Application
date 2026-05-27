import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { VehicleService, Vehicle } from "../../services/vehicle.service";
import { BookingService } from "../../services/booking.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-vehicle-browse",
  templateUrl: "./vehicle-browse.component.html",
  styleUrls: ["./vehicle-browse.component.css"],
})
export class VehicleBrowseComponent implements OnInit {
  vehicles: any[] = [];
  filteredVehicles: any[] = [];
  isLoading = true;
  hasError = false;
  errorMessage = "";

  selectedType = "All Types";
  selectedBrand = "All Brands";
  searchQuery = "";

  vehicleTypes = [
    "All Types",
    "SEDAN",
    "SUV",
    "HATCHBACK",
    "LUXURY",
    "SPORTS",
    "VAN",
  ];
  brands: string[] = ["All Brands"];
  showBookedVehicles: any;

  constructor(
    private vehicleService: VehicleService,
    private bookingService: BookingService,
    private router: Router,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    console.log("🎬 VehicleBrowseComponent INITIALIZED");
    console.log("Current route:", this.router.url);
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("currentUser");
    console.log("Auth status - Token:", token ? "Present" : "Missing");
    console.log("Auth status - User:", user ? "Present" : "Missing");

    if (!token) {
      console.warn("⚠️ No token found! User might not be logged in.");
      // Optional: Redirect to login if no token
      // this.router.navigate(['/login']);
    }
    this.loadVehicles();
  }

  loadVehicles(): void {
    console.log("🔄 Loading vehicles...");
    this.isLoading = true;
    this.hasError = false;

    this.vehicleService.getAvailableVehicles().subscribe({
      next: (vehicles) => {
        console.log("✅ Raw API response:", vehicles);

        // Handle both array and object responses
        let vehiclesArray: any[] = [];

        if (Array.isArray(vehicles)) {
          vehiclesArray = vehicles;
        } else if (vehicles && typeof vehicles === "object") {
          vehiclesArray =
            vehicles["content"] ||
            vehicles["data"] ||
            vehicles["vehicles"] ||
            [];
        }

        console.log("📦 Processed vehicles array:", vehiclesArray);

        // Store all vehicles
        this.vehicles = vehiclesArray;
        this.filteredVehicles = [...vehiclesArray];

        // Extract unique brands
        const uniqueBrands = [
          ...new Set(
            vehiclesArray
              .filter((v) => v && v.brand && v.brand.trim() !== "")
              .map((v) => v.brand),
          ),
        ];

        this.brands = ["All Brands", ...uniqueBrands];
        this.isLoading = false;

        console.log(`✅ Loaded ${this.vehicles.length} vehicles`);

        if (this.vehicles.length === 0) {
          console.warn("⚠️ No vehicles loaded.");
          this.loadMockData();
        }
      },
      error: (err) => {
        console.error("❌ Error loading vehicles:", err);
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = `Failed to load vehicles: ${err.message || "Unknown error"}`;
        this.loadMockData();
      },
    });
  }
  loadMockData() {
    console.log("🎲 Loading mock vehicles as fallback...");
    this.vehicles = this.vehicleService.getMockVehicles();
    this.filteredVehicles = [...this.vehicles];
    this.isLoading = false;

    // Sync to brands
    const uniqueBrands = [
      ...new Set(
        this.vehicles
          .filter((v) => v && v.brand && v.brand.trim() !== "")
          .map((v) => v.brand),
      ),
    ];
    this.brands = ["All Brands", ...uniqueBrands];
  }

  applyFilters(): void {
    console.log("🔍 Applying filters...", {
      searchQuery: this.searchQuery,
      selectedType: this.selectedType,
      selectedBrand: this.selectedBrand,
      showBooked: this.showBookedVehicles,
    });

    if (!this.vehicles || this.vehicles.length === 0) {
      console.warn("⚠️ No vehicles to filter");
      this.filteredVehicles = [];
      return;
    }

    this.filteredVehicles = this.vehicles.filter((v) => {
      if (!v) return false;

      // ========== FIXED: Only hide booked vehicles when toggle is OFF ==========
      if (!this.showBookedVehicles && v.status?.toLowerCase() === "booked") {
        return false; // Hide booked vehicles when toggle is OFF
      }
      // REMOVE THE DUPLICATE LINE: if (v.status?.toLowerCase() === "booked") { return false; }

      // Type filter (check both 'type' and 'category')
      const vehicleType = v.type || v.category || "";
      const typeMatch =
        this.selectedType === "All Types" ||
        !this.selectedType ||
        vehicleType === this.selectedType;

      // Brand filter
      const brandMatch =
        this.selectedBrand === "All Brands" ||
        !this.selectedBrand ||
        v.brand === this.selectedBrand;

      // Search filter
      const searchMatch =
        !this.searchQuery ||
        this.searchQuery.trim() === "" ||
        (v.brand &&
          v.brand.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (v.model &&
          v.model.toLowerCase().includes(this.searchQuery.toLowerCase()));

      return typeMatch && brandMatch && searchMatch;
    });

    console.log(`✅ Filtered to ${this.filteredVehicles.length} vehicles`);
  }

  clearFilters(): void {
    console.log("🧹 Clearing filters");
    this.selectedType = "All Types";
    this.selectedBrand = "All Brands";
    this.searchQuery = "";
    this.filteredVehicles = [...this.vehicles];
    this.applyFilters();
    console.log(
      `✅ Reset to ${this.filteredVehicles.length} vehicles (booked vehicles hidden)`,
    );
  }

  debugVehicles(): void {
    console.log("=== DEBUG VEHICLES ===");
    console.log("Total vehicles:", this.vehicles.length);
    console.log("Filtered vehicles:", this.filteredVehicles.length);

    if (this.vehicles.length > 0) {
      console.log("First vehicle:", this.vehicles[0]);
      console.log("Vehicle keys:", Object.keys(this.vehicles[0]));
    }

    console.log("Current filters:", {
      searchQuery: this.searchQuery,
      selectedType: this.selectedType,
      selectedBrand: this.selectedBrand,
    });
  }

  // =============== FIXED BOOK NOW METHOD ===============
  bookNow(vehicleId: number): void {
    console.log("=== BOOK NOW START ===");
    console.log("Current URL before:", this.router.url);

    const vehicle = this.vehicles.find((v) => v.id === vehicleId);

    if (!vehicle) {
      console.error("Vehicle not found!");
      return;
    }

    // Check if already booked
    if (vehicle.status?.toLowerCase() === "booked") {
      console.warn("⚠️ This vehicle is already booked!");

      // Show which vehicle is booked
      alert(
        `The ${vehicle.brand} ${vehicle.model} is already booked! Please choose another vehicle.`,
      );
      return;
    }

    // Mark as booked
    vehicle.status = "BOOKED";

    // Update status on backend (optional)
    this.updateCarStatus(vehicleId, "BOOKED");

    // IMPORTANT: Refresh the filtered list
    this.applyFilters();

    console.log("🎬 Book Now clicked for vehicle ID:", vehicleId);

    const vehicleName = `${vehicle.brand} ${vehicle.model}`;
    const dailyRate = vehicle.dailyRate;

    // FIX: Generate UNIQUE booking ID with random component
    const bookingId = `BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // FIX: Use DYNAMIC dates (tomorrow to 7 days later)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Tomorrow
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7); // 7 days from tomorrow

    const daysNum = 7; // Fixed 7 days rental
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];
    const totalCost = dailyRate * daysNum;

    console.log(
      "🔄 Creating booking for:",
      vehicleName,
      "from",
      startDateStr,
      "to",
      endDateStr,
    );

    // Prepare confirmation data with ALL vehicle details
    const bookingConfirmationData = {
      bookingId: bookingId,
      vehicleName: vehicleName,
      vehicleImage: vehicle.imageUrl,
      startDate: startDateStr,
      endDate: endDateStr,
      days: daysNum,
      dailyRate: dailyRate,
      totalCost: totalCost,
      pickupLocation: vehicle.location || "Main Office",
      status: "confirmed",
      vehicleDetails: {
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        transmission: vehicle.transmission,
        seats: vehicle.seats,
        fuelType: vehicle.fuelType,
        color: vehicle.color,
        mileage: vehicle.mileage,
        category: vehicle.category || vehicle.type,
        // Add more details as needed
      },
      // Add timestamp to avoid caching
      timestamp: Date.now(),
    };

    console.log("✅ Created booking data for:", vehicleName);
    console.log("Booking details:", bookingConfirmationData);

    // Store in localStorage
    localStorage.setItem(
      "lastBooking",
      JSON.stringify(bookingConfirmationData),
    );

    // Also store in sessionStorage for immediate access
    sessionStorage.setItem(
      "currentBooking",
      JSON.stringify(bookingConfirmationData),
    );

    const bookingForService = {
      bookingId: bookingId, // Add this line
      vehicleId: vehicleId,
      car: {
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        category: vehicle.category || vehicle.type || "SEDAN",
        imageUrl: vehicle.imageUrl,
        dailyRate: vehicle.dailyRate,
      },
      startDate: startDateStr,
      endDate: endDateStr,
      pickupLocation: vehicle.location || "Main Office",
      totalCost: totalCost,
      status: "CONFIRMED",
    };

    this.bookingService.createBooking(bookingForService).subscribe({
      next: (response) => {
        console.log("✅ Booking service response:", response);

        // Update confirmation data with the real ID from service
        (bookingConfirmationData as any).id = response.id;

        // Update storage
        localStorage.setItem("lastBooking", JSON.stringify(bookingConfirmationData));
        sessionStorage.setItem("currentBooking", JSON.stringify(bookingConfirmationData));

        console.log("Navigating to /booking-confirmation with ID:", response.id);

        // Navigate to confirmation page
        this.router.navigate(["/booking-confirmation"], {
          state: {
            bookingData: bookingConfirmationData,
            vehicleId: vehicleId,
          },
        }).then((success) => {
          console.log("Navigation successful:", success);
        }).catch((error) => {
          console.error("Navigation failed:", error);
        });
      },
      error: (err) => {
        console.error("❌ Booking service error:", err);
        alert("Failed to create booking. Please try again.");
      },
    });
  }

  // Helper to extract booking ID from various response structures
  private extractBookingId(response: any): string {
    if (!response || typeof response !== "object") {
      return "N/A";
    }

    // Try different possible ID properties
    if (response.id !== undefined) return response.id;
    if (response.bookingId !== undefined) return response.bookingId;
    if (response.booking_id !== undefined) return response.booking_id;
    if (response.data?.id !== undefined) return response.data.id;
    if (response.body?.id !== undefined) return response.body.id;

    return "N/A";
  }

  // Update car status on backend
  private updateCarStatus(carId: number, status: string): void {
    const updateData = { status: status };

    this.http
      .put(`http://localhost:8080/api/cars/${carId}/status`, updateData)
      .subscribe({
        next: () => console.log("✅ Car status updated to:", status),
        error: (err) => console.warn("⚠️ Could not update car status:", err),
      });
  }

  viewDetails(vehicleId: number): void {
    this.router.navigate(["/vehicles", vehicleId]);
  }

  testApi(): void {
    console.log("Testing API connection...");

    this.http.get("http://localhost:8080/api/cars").subscribe({
      next: (response) => {
        console.log("✅ Cars API working");

        // Also test booking endpoint
        this.testBookingEndpoint();
      },
      error: (error) => {
        console.error("❌ API test failed:", error);
        alert("Cannot connect to backend. Check Spring Boot.");
      },
    });
  }

  testBookingEndpoint(): void {
    console.log("Testing booking endpoint...");

    const testData = {
      car: { id: 1 },
      user: { id: 1 },
      startDate: "2024-01-01",
      endDate: "2024-01-03",
      pickupLocation: "Main Office",
      dropoffLocation: "Main Office",
      totalCost: 300,
      status: "confirmed",
    };

    this.http.post("http://localhost:8080/api/bookings", testData).subscribe({
      next: (response) => {
        console.log("✅ Booking API working:", response);
        alert("All APIs are working!");
      },
      error: (error) => {
        console.error("❌ Booking API failed:", error);
        alert(`Cars API works, but booking failed: ${error.status}`);
      },
    });
  }

  getMockVehicles(): any[] {
    throw new Error("Method not implemented.");
  }

  // Add this debug method
  private debugImageUrls(): void {
    console.log("=== DEBUG IMAGE URLS ===");
    this.vehicles.forEach((vehicle, index) => {
      console.log(`Vehicle ${index + 1}: ${vehicle.brand} ${vehicle.model}`);
      console.log(`Image URL: ${vehicle.imageUrl}`);

      // Test if image loads
      const img = new Image();
      img.onload = () =>
        console.log(`✅ Image ${index + 1} loads successfully`);
      img.onerror = () => console.error(`❌ Image ${index + 1} failed to load`);
      img.src = vehicle.imageUrl;
    });
  }
}
