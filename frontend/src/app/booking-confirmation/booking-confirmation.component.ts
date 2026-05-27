import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { BookingService } from "../services/booking.service";

@Component({
  selector: "app-booking-confirmation",
  templateUrl: "./booking-confirmation.component.html",
  styleUrls: ["./booking-confirmation.component.css"],
  standalone: false,
})
export class BookingConfirmationComponent implements OnInit {
  bookingData: any = {
    bookingId: "Loading...",
    vehicleName: "Loading...",
    vehicleImage:
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop",
    startDate: this.getDefaultStartDate(),
    endDate: this.getDefaultEndDate(),
    days: 7,
    dailyRate: 0,
    totalCost: 0,
    pickupLocation: "Main Office",
    status: "confirmed",
    vehicleDetails: {
      brand: "Loading",
      model: "Loading",
      year: "Loading",
      transmission: "Loading",
      seats: 0,
      fuelType: "Loading",
    },
  };

  selectedStartDate: string = "";
  selectedEndDate: string = "";
  calculatedDays: number = 0;
  calculatedTotal: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.loadBookingData();
  }

  private loadBookingData(): void {
    console.log("🔄 Loading booking data...");

    // METHOD 1: Check navigation state FIRST (most recent)
    this.loadFromNavigationState();

    // METHOD 2: If no navigation state, check sessionStorage
    if (
      !this.bookingData.bookingId ||
      this.bookingData.bookingId === "Loading..."
    ) {
      this.loadFromSessionStorage();
    }

    // METHOD 3: If still no data, check localStorage
    if (
      !this.bookingData.bookingId ||
      this.bookingData.bookingId === "Loading..."
    ) {
      this.loadFromLocalStorage();
    }

    // METHOD 4: If all else fails, show random demo data
    if (
      !this.bookingData.bookingId ||
      this.bookingData.bookingId === "Loading..."
    ) {
      console.warn("⚠️ No booking data found, showing random demo");
      this.showRandomDemoData();
    }

    this.initializeDateInputs();
  }

  private loadFromNavigationState(): void {
    try {
      const navigation = this.router.getCurrentNavigation();
      console.log("Navigation state:", navigation?.extras?.state);

      if (navigation?.extras?.state?.["bookingData"]) {
        const stateData = navigation.extras.state["bookingData"];
        if (stateData?.bookingId) {
          this.bookingData = stateData;
          console.log(
            "✅ Booking loaded from navigation state:",
            stateData.vehicleName,
          );

          // Also store for future reference
          sessionStorage.setItem("currentBooking", JSON.stringify(stateData));
          localStorage.setItem("lastBooking", JSON.stringify(stateData));
          return;
        }
      }
    } catch (e) {
      console.warn("Could not get navigation state:", e);
    }
  }

  private loadFromSessionStorage(): void {
    try {
      const sessionData = sessionStorage.getItem("currentBooking");
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (parsed?.bookingId) {
          this.bookingData = parsed;
          console.log(
            "✅ Booking loaded from sessionStorage:",
            parsed.vehicleName,
          );
          return;
        }
      }
    } catch (e) {
      console.warn("Could not parse sessionStorage:", e);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem("lastBooking");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.bookingId) {
          this.bookingData = parsed;
          console.log(
            "✅ Booking loaded from localStorage:",
            parsed.vehicleName,
          );
          return;
        }
      }
    } catch (e) {
      console.warn("Could not parse localStorage:", e);
    }
  }

  private showRandomDemoData(): void {
    const demoVehicles = [
      {
        name: "Toyota Camry",
        image:
          "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop",
        dailyRate: 80,
        brand: "Toyota",
        model: "Camry",
        year: 2024,
        transmission: "AUTOMATIC",
        seats: 5,
        fuelType: "GASOLINE",
      },
      {
        name: "BMW M4",
        image:
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=600&auto=format&fit=crop",
        dailyRate: 150,
        brand: "BMW",
        model: "M4",
        year: 2023,
        transmission: "AUTOMATIC",
        seats: 4,
        fuelType: "GASOLINE",
      },
      {
        name: "Honda Civic",
        image:
          "https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=600&auto=format&fit=crop",
        dailyRate: 70,
        brand: "Honda",
        model: "Civic",
        year: 2022,
        transmission: "AUTOMATIC",
        seats: 5,
        fuelType: "HYBRID",
      },
      {
        name: "Tesla Model S",
        image:
          "https://images.unsplash.com/photo-1532974297617-c0f05fa48a5b?q=80&w=600&auto=format&fit=crop",
        dailyRate: 200,
        brand: "Tesla",
        model: "Model S",
        year: 2024,
        transmission: "AUTOMATIC",
        seats: 5,
        fuelType: "ELECTRIC",
      },
      {
        name: "Ford Explorer",
        image:
          "https://images.unsplash.com/photo-1563720223485-8d6d5c5b40fa?q=80&w=600&auto=format&fit=crop",
        dailyRate: 120,
        brand: "Ford",
        model: "Explorer",
        year: 2023,
        transmission: "AUTOMATIC",
        seats: 7,
        fuelType: "GASOLINE",
      },
    ];

    // Pick RANDOM demo vehicle
    const randomIndex = Math.floor(Math.random() * demoVehicles.length);
    const demoVehicle = demoVehicles[randomIndex];

    // Generate UNIQUE demo ID
    const demoId = `DEMO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Use dynamic dates
    const startDate = this.getDefaultStartDate();
    const endDate = this.getDefaultEndDate();

    // Calculate days and total
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalCost = demoVehicle.dailyRate * days;

    this.bookingData = {
      bookingId: demoId,
      vehicleName: demoVehicle.name,
      vehicleImage: demoVehicle.image,
      startDate: startDate,
      endDate: endDate,
      days: days,
      dailyRate: demoVehicle.dailyRate,
      totalCost: totalCost,
      pickupLocation: "Main Office",
      status: "demo_mode",
      vehicleDetails: {
        brand: demoVehicle.brand,
        model: demoVehicle.model,
        year: demoVehicle.year,
        transmission: demoVehicle.transmission,
        seats: demoVehicle.seats,
        fuelType: demoVehicle.fuelType,
      },
    };

    console.log("🎲 Random demo data for:", demoVehicle.name);
  }

  private getDefaultStartDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  private getDefaultEndDate(): string {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split("T")[0];
  }

  private initializeDateInputs(): void {
    if (this.bookingData.startDate && this.bookingData.endDate) {
      this.selectedStartDate = this.bookingData.startDate;
      this.selectedEndDate = this.bookingData.endDate;
      this.calculateDates();
    } else {
      // Set defaults
      this.selectedStartDate = this.getDefaultStartDate();
      this.selectedEndDate = this.getDefaultEndDate();
      this.calculateDates();
    }
  }

  // ========== DATE SELECTION METHODS ==========

  getTomorrow(): string {
    return this.getDefaultStartDate();
  }

  onDateChange(): void {
    this.calculateDates();
  }

  calculateDates(): void {
    if (this.selectedStartDate && this.selectedEndDate) {
      const start = new Date(this.selectedStartDate);
      const end = new Date(this.selectedEndDate);

      // Calculate days difference
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Ensure at least 1 day
      this.calculatedDays = diffDays >= 1 ? diffDays : 1;
      this.calculatedTotal = this.calculatedDays * this.bookingData.dailyRate;
    }
  }

  updateBookingDates(): void {
    if (!this.selectedStartDate || !this.selectedEndDate) {
      alert("Please select both start and end dates");
      return;
    }

    const startDate = new Date(this.selectedStartDate);
    const endDate = new Date(this.selectedEndDate);

    if (endDate <= startDate) {
      alert("Drop-off date must be after pick-up date");
      return;
    }

    // Update booking data
    this.bookingData.startDate = this.selectedStartDate;
    this.bookingData.endDate = this.selectedEndDate;
    this.bookingData.days = this.calculatedDays;
    this.bookingData.totalCost = this.calculatedTotal;

    // Update ALL temporary storage locations
    localStorage.setItem("lastBooking", JSON.stringify(this.bookingData));
    sessionStorage.setItem("currentBooking", JSON.stringify(this.bookingData));

    // CRITICAL: Update persistent storage via BookingService
    // Use the numeric 'id' if available (returned from service), otherwise fallback to 'bookingId' string
    const idToUpdate = this.bookingData.id || this.bookingData.bookingId;

    this.bookingService.updateBooking(idToUpdate, {
      startDate: this.bookingData.startDate,
      endDate: this.bookingData.endDate,
      totalCost: this.bookingData.totalCost,
      days: this.bookingData.days
    }).subscribe({
      next: (response) => {
        console.log("✅ Persistent storage updated:", response);
        // Show success message
        alert(
          `✅ Dates updated and saved!\n\nNew rental period:\n${this.selectedStartDate} to ${this.selectedEndDate}\n\nTotal: $${this.calculatedTotal} for ${this.calculatedDays} day${this.calculatedDays > 1 ? "s" : ""}`,
        );
      },
      error: (err) => {
        console.error("❌ Failed to update persistent storage:", err);
        alert("Dates updated in view, but failed to save permanently. Please try again.");
      }
    });

    console.log("Booking dates updated:", this.bookingData);
  }

  // ========== EXISTING METHODS ==========
  downloadInvoice(): void {
    const invoiceContent = `
========================================
       CAR RENTAL SERVICE - INVOICE
========================================
Booking Reference: # ${this.bookingData.bookingId}
Status: ${this.bookingData.status?.toUpperCase()}
Date Issued: ${new Date().toLocaleDateString()}

VEHICLE DETAILS:
----------------------------------------
Vehicle: ${this.bookingData.vehicleName}
Brand: ${this.bookingData.vehicleDetails?.brand}
Model: ${this.bookingData.vehicleDetails?.model}
Year: ${this.bookingData.vehicleDetails?.year}

RENTAL PERIOD:
----------------------------------------
Pick-up: ${new Date(this.bookingData.startDate).toLocaleDateString()}
Drop-off: ${new Date(this.bookingData.endDate).toLocaleDateString()}
Duration: ${this.bookingData.days} day(s)

PAYMENT SUMMARY:
----------------------------------------
Daily Rate: $${this.bookingData.dailyRate}/day
Total Amount: $${this.bookingData.totalCost}
Status: Confirmed

Pick-up Location: ${this.bookingData.pickupLocation}

Thank you for choosing DriveNow!
========================================
    `;

    const blob = new Blob([invoiceContent.trim()], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DriveNow_Invoice_${this.bookingData.bookingId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log("✅ Invoice downloaded for:", this.bookingData.bookingId);
  }

  viewBookings(): void {
    this.router.navigate(["/bookings"]);
  }

  browseMore(): void {
    this.router.navigate(["/vehicles"]);
  }

  // Add debug method
  debugBookingInfo(): void {
    console.log("=== DEBUG BOOKING INFO ===");
    console.log("Current booking:", this.bookingData);
    console.log(
      "Navigation state:",
      this.router.getCurrentNavigation()?.extras?.state,
    );
    console.log("sessionStorage:", sessionStorage.getItem("currentBooking"));
    console.log("localStorage:", localStorage.getItem("lastBooking"));

    alert(
      `Current Booking:\nVehicle: ${this.bookingData.vehicleName}\nID: ${this.bookingData.bookingId}\nDates: ${this.bookingData.startDate} to ${this.bookingData.endDate}`,
    );
  }
}
