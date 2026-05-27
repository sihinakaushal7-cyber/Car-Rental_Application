// File: src/app/services/booking.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, Observable, of } from "rxjs";
import { AuthService } from "./auth.service";

export interface Booking {
  id?: number;
  userId: number;
  vehicleId: number;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: string;
  pickupLocation?: string;
  returnLocation?: string;
  specialRequests?: string;
  createdAt?: string;
  car?: any;
  user?: any;
}

@Injectable({
  providedIn: "root",
})
export class BookingService {
  private apiUrl = "http://localhost:8080/api/bookings";
  private currentBooking: any;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  // Get all bookings (ADMIN ONLY - shows all users' bookings)
  getAllBookings(): Observable<Booking[]> {
    console.log("📋 DEVELOPMENT: Accessing bookings from localStorage with initialization");

    // Get from localStorage
    let bookings: Booking[] = [];
    try {
      const stored = localStorage.getItem("allBookings");
      if (stored) {
        bookings = JSON.parse(stored);
      } else {
        // If empty, initialize with mock data for better experience
        console.log("ℹ️ No bookings found in storage, initializing samples...");
        bookings = this.generateInitialMockBookings();
        localStorage.setItem("allBookings", JSON.stringify(bookings));
      }
    } catch (e) {
      console.error("❌ Failed to parse allBookings from localStorage:", e);
      bookings = [];
    }

    console.log("📦 Total bookings available:", bookings.length);

    // Log first booking to debug structure
    if (bookings.length > 0) {
      console.log("📊 First booking structure:", bookings[0]);
    }

    return of(bookings);
  }

  /**
   * Generates initial mock data for first-time use
   */
  private generateInitialMockBookings(): Booking[] {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    return [
      {
        id: Date.now() - 100000,
        userId: 1, // Admin usually
        vehicleId: 1,
        car: {
          id: 1,
          brand: "Toyota",
          model: "Camry",
          year: 2024,
          category: "SEDAN",
          imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341",
        },
        startDate: lastMonth.toISOString().split("T")[0],
        endDate: new Date(lastMonth.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        totalCost: 560.0,
        status: "COMPLETED",
        pickupLocation: "Main Office",
        createdAt: lastMonth.toISOString(),
      },
      {
        id: Date.now() - 200000,
        userId: 2,
        vehicleId: 2,
        car: {
          id: 2,
          brand: "BMW",
          model: "M4",
          year: 2023,
          category: "SPORTS",
          imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e",
        },
        startDate: today.toISOString().split("T")[0],
        endDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        totalCost: 450.0,
        status: "CONFIRMED",
        pickupLocation: "Downtown",
        createdAt: today.toISOString(),
      }
    ];
  }
  // Generate sample bookings for a specific user to avoid leakage
  private generateSampleForUser(userId: number): Booking[] {
    console.log(`🎲 Generating sample bookings for user ${userId}...`);

    const sampleBookings: Booking[] = [
      {
        id: Date.now() + 1,
        userId: userId,
        vehicleId: 1,
        car: {
          id: 1,
          brand: "Toyota",
          model: "Camry",
          year: 2024,
          category: "SEDAN",
          imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341",
        },
        startDate: "2025-12-31",
        endDate: "2026-01-05",
        totalCost: 500.0,
        status: "CONFIRMED",
        pickupLocation: "Airport Terminal 1",
        createdAt: new Date().toISOString(),
      }
    ];

    // Merge into local storage
    const allBookings = JSON.parse(localStorage.getItem("allBookings") || "[]");
    const updated = [...allBookings, ...sampleBookings];
    localStorage.setItem("allBookings", JSON.stringify(updated));

    return sampleBookings;
  }

  // Get user's own bookings (for USER role)
  getUserBookings(userId: number): Observable<Booking[]> {
    console.log("📋 Fetching bookings for user ID:", userId);

    // Try API first
    return this.http.get<Booking[]>(`${this.apiUrl}/user/${userId}`).pipe(
      catchError((error) => {
        console.error("❌ API error, using localStorage:", error);

        // Fallback to localStorage
        const allBookings = JSON.parse(
          localStorage.getItem("allBookings") || "[]",
        );
        console.log(`📦 Total global bookings: ${allBookings.length}`);

        // STRICT FILTERING
        const userBookings = allBookings.filter(
          (b: Booking) => Number(b.userId) === Number(userId),
        );
        console.log(`📦 Found ${userBookings.length} bookings for user ${userId}`);

        return of(userBookings);
      }),
    );
  }

  // Add this method to debug booking structure
  debugBookingStructure(): void {
    const allBookings = JSON.parse(localStorage.getItem("allBookings") || "[]");

    console.log("=== BOOKING STRUCTURE DEBUG ===");
    console.log("Total bookings:", allBookings.length);

    if (allBookings.length > 0) {
      allBookings.forEach((booking: any, index: number) => {
        console.log(`Booking ${index + 1}:`);
        console.log("- ID:", booking.id);
        console.log("- User ID:", booking.userId);
        console.log("- Status:", booking.status);
        console.log("- Has car property:", "car" in booking);

        if (booking.car) {
          console.log("- Car object keys:", Object.keys(booking.car));
          console.log("- Car brand:", booking.car.brand);
          console.log("- Car model:", booking.car.model);
        } else {
          console.log("- No car property or car is null/undefined");
        }

        console.log("---");
      });
    } else {
      console.log("No bookings found in localStorage");
    }
  }

  // Create booking (both ADMIN and USER can book)
  createBooking(bookingData: any): Observable<any> {
    console.log("➕ Creating new booking:", bookingData);

    const userStr = localStorage.getItem("currentUser");
    let userId = 1;

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user.id || 1;
      } catch (e) {
        console.warn("Could not parse user, using default ID");
      }
    }

    const booking: Booking = {
      id: Date.now(),
      ...bookingData,
      userId: userId,
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),
    };

    // 1. Save to allBookings
    const allBookings = JSON.parse(localStorage.getItem("allBookings") || "[]");
    allBookings.push(booking);
    localStorage.setItem("allBookings", JSON.stringify(allBookings));

    // 2. Mark vehicle as BOOKED in allCars
    try {
      const allCars = JSON.parse(localStorage.getItem("allCars") || "[]");
      const carIndex = allCars.findIndex((c: any) => Number(c.id) === Number(booking.vehicleId));
      if (carIndex !== -1) {
        allCars[carIndex].status = "BOOKED";
        localStorage.setItem("allCars", JSON.stringify(allCars));
        console.log(`🚗 Vehicle ${booking.vehicleId} marked as BOOKED`);
      }
    } catch (e) {
      console.error("❌ Error updating vehicle status in localStorage:", e);
    }

    console.log("✅ Booking created and saved:", booking);
    return of(booking);
  }

  // Other methods remain the same...
  setCurrentBooking(bookingData: any): void {
    this.currentBooking = bookingData;
    localStorage.setItem("lastBooking", JSON.stringify(bookingData));
  }

  getCurrentBooking(): any {
    if (this.currentBooking) {
      return this.currentBooking;
    }

    const stored = localStorage.getItem("lastBooking");
    if (stored) {
      this.currentBooking = JSON.parse(stored);
      return this.currentBooking;
    }

    return {};
  }

  clearCurrentBooking(): void {
    this.currentBooking = null;
    localStorage.removeItem("lastBooking");
  }

  acceptBooking(bookingId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${bookingId}/accept`, {});
  }

  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  updateBookingStatus(id: number, status: string): Observable<Booking> {
    return this.http.put<Booking>(
      `${this.apiUrl}/${id}/status?status=${status}`,
      {},
    );
  }

  cancelBooking(bookingId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${bookingId}/cancel`, {});
  }

  /**
   * Updates an existing booking in persistent storage (localStorage for development)
   * @param bookingReference The ID or bookingId to match
   * @param updateData The fields to update
   */
  updateBooking(bookingReference: any, updateData: any): Observable<any> {
    console.log(`🔄 Service: Updating booking ${bookingReference}`, updateData);

    // 1. Update in main 'allBookings' array
    let allBookings = JSON.parse(localStorage.getItem("allBookings") || "[]");

    // Find index by id or bookingId
    const index = allBookings.findIndex((b: any) =>
      b.id == bookingReference ||
      b.bookingId == bookingReference ||
      (typeof bookingReference === 'string' && b.bookingId === bookingReference)
    );

    if (index !== -1) {
      // Create updated object
      const updatedBooking = { ...allBookings[index], ...updateData };
      allBookings[index] = updatedBooking;

      // Save back to localStorage
      localStorage.setItem("allBookings", JSON.stringify(allBookings));
      console.log("✅ Updated in allBookings");

      // 2. Update in user-specific storage
      const userId = updatedBooking.userId;
      if (userId) {
        const userKey = `bookings_user_${userId}`;
        let userBookings = JSON.parse(localStorage.getItem(userKey) || "[]");
        const userIndex = userBookings.findIndex((b: any) =>
          b.id == bookingReference || b.bookingId == bookingReference
        );

        if (userIndex !== -1) {
          userBookings[userIndex] = updatedBooking;
          localStorage.setItem(userKey, JSON.stringify(userBookings));
          console.log(`✅ Updated in ${userKey}`);
        }
      }

      return of(updatedBooking);
    } else {
      console.warn(`⚠️ Booking ${bookingReference} not found in localStorage persistent storage`);
      // If not found in localStorage, it might be an older record or only in memories
      // We still update 'allBookings' by adding it if it seems to be a valid update for a new booking
      return of(updateData);
    }
  }
}
