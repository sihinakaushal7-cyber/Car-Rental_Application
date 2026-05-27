// File: src/app/services/vehicle.service.ts
import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  category?: string;
  type?: string;
  registrationNumber?: string;
  licensePlate?: string;
  dailyRate: number;
  seats: number;
  transmission: string;
  fuelType: string;
  imageUrl: string;
  status: string;
  description: string;
  location: string;
  color?: string;
  mileage?: number;
}

@Injectable({
  providedIn: "root",
})
export class VehicleService {
  private apiUrl = "http://localhost:8080/api/cars";

  constructor(private http: HttpClient) { }

  // Get all vehicles
  getAllVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.apiUrl).pipe(
      map((vehicles) => {
        const remoteVehicles = this.mapVehicles(vehicles);
        const localVehicles = this.getLocalVehicles();
        const combined = [...remoteVehicles, ...localVehicles];

        // If even combined is empty, initialize with mock data for better experience
        if (combined.length === 0) {
          console.log("ℹ️ No vehicles found anywhere, initializing with mock data");
          const mock = this.getMockVehicles();
          localStorage.setItem("allCars", JSON.stringify(mock));
          return mock;
        }

        return combined;
      }),
      catchError((error) => {
        console.error("Error fetching all vehicles:", error);
        const localVehicles = this.getLocalVehicles();
        const mockVehicles = this.getMockVehicles();
        return of([...mockVehicles, ...localVehicles]);
      }),
    );
  }

  // Get available vehicles (not booked/rented)
  getAvailableVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.apiUrl).pipe(
      map((vehicles: any[]) => {
        const allLocal = this.getLocalVehicles();
        let allBookings: any[] = [];
        try {
          allBookings = JSON.parse(localStorage.getItem("allBookings") || "[]");
        } catch (e) {
          console.error("❌ Failed to parse allBookings in VehicleService:", e);
        }

        const todayStr = new Date().toISOString().split('T')[0];

        // Combine all cars
        const combined = [...this.mapVehicles(vehicles), ...allLocal];

        // Filter out cars that are marked BOOKED OR have an active booking right now
        return combined.filter(vehicle => {
          if (!vehicle) return false;
          const status = (vehicle.status || '').toString().toLowerCase();
          const isMarkedUnavailable = ['booked', 'rented', 'reserved'].includes(status);

          if (isMarkedUnavailable) return false;

          // Check for active overlapping bookings
          const hasActiveBooking = allBookings.some((b: any) => {
            if (!b || !b.startDate || !b.endDate) return false;
            return Number(b.vehicleId) === Number(vehicle.id) &&
              (b.status || '').toString().toLowerCase() !== 'cancelled' &&
              todayStr >= b.startDate && todayStr <= b.endDate;
          });

          return !hasActiveBooking;
        });
      }),
      catchError((error) => {
        console.error("Error fetching available vehicles:", error);
        // Fallback to local and mock if API fails
        const allLocal = this.getLocalVehicles();
        const mockVehicles = this.getMockVehicles();
        const all = [...mockVehicles, ...allLocal];
        return of(all.filter(v => {
          const s = (v.status || '').toString().toLowerCase();
          return s === 'available' || s === '';
        }));
      }),
    );
  }

  // Get vehicle by ID
  getVehicleById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`).pipe(
      map((vehicle) => this.mapVehicle(vehicle)),
      catchError((error) => {
        console.error(`Error fetching vehicle ${id}:`, error);
        const mock = this.getMockVehicles().find((v) => v.id === id);
        return of(mock || this.getDefaultVehicle());
      }),
    );
  }

  // Search vehicles
  searchVehicles(type?: string, brand?: string): Observable<Vehicle[]> {
    let params = new HttpParams();
    if (type) params = params.set("type", type);
    if (brand) params = params.set("brand", brand);

    return this.http.get<Vehicle[]>(`${this.apiUrl}/search`, { params }).pipe(
      map((vehicles) => this.mapVehicles(vehicles)),
      catchError((error) => {
        console.error("Error searching vehicles:", error);
        return of(this.getMockVehicles());
      }),
    );
  }

  // Add new vehicle
  addVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicle).pipe(
      catchError((error) => {
        console.error("Error adding vehicle:", error);
        // For demo, return the vehicle with a new ID
        const newVehicle = { ...vehicle, id: Date.now() };
        return of(newVehicle);
      }),
    );
  }

  // Update vehicle status
  updateVehicleStatus(vehicleId: number, status: string): Observable<Vehicle> {
    console.log(`🔄 Updating vehicle ${vehicleId} status to: ${status}`);

    return this.http
      .put<Vehicle>(`${this.apiUrl}/${vehicleId}/status`, { status })
      .pipe(
        catchError((error) => {
          console.error("Error updating vehicle status:", error);
          // For demo, return mock update
          const mock = this.getMockVehicles().find((v) => v.id === vehicleId);
          if (mock) mock.status = status;
          return of(mock || this.getDefaultVehicle());
        }),
      );
  }

  // Delete vehicle
  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error("Error deleting vehicle:", error);
        return of(void 0);
      }),
    );
  }

  // Upload image
  uploadImage(id: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append("file", file);

    return this.http
      .post(`${this.apiUrl}/${id}/upload-image`, formData, {
        responseType: "text",
      })
      .pipe(
        catchError((error) => {
          console.error("Error uploading image:", error);
          return of("assets/images/cars/default-car.jpg");
        }),
      );
  }

  // Confirm booking (aliases for updateVehicleStatus)
  confirmBooking(details: any): Observable<any> {
    return this.updateVehicleStatus(details.vehicleId, "BOOKED");
  }

  updateCarStatus(vehicleId: number, status: string): Observable<Vehicle> {
    return this.updateVehicleStatus(vehicleId, status);
  }

  // Helper methods
  private getLocalVehicles(): Vehicle[] {
    try {
      const localCars = JSON.parse(localStorage.getItem("allCars") || "[]");
      return this.mapVehicles(localCars);
    } catch (e) {
      console.error("Error parsing local cars:", e);
      return [];
    }
  }

  private mapVehicles(vehicles: any[]): Vehicle[] {
    return vehicles.map((vehicle) => this.mapVehicle(vehicle));
  }

  private mapVehicle(vehicle: any): Vehicle {
    return {
      id: vehicle.id || 0,
      brand: vehicle.brand || "Unknown",
      model: vehicle.model || "Unknown",
      year: vehicle.year || new Date().getFullYear(),
      category: vehicle.category || vehicle.type || "SEDAN",
      type: vehicle.type || vehicle.category || "SEDAN",
      registrationNumber: vehicle.registrationNumber || "",
      licensePlate: vehicle.licensePlate || "",
      dailyRate: vehicle.dailyRate || 0,
      seats: vehicle.seats || 5,
      transmission: vehicle.transmission || "AUTOMATIC",
      fuelType: vehicle.fuelType || "GASOLINE",
      imageUrl: vehicle.imageUrl || this.getDefaultImage(vehicle),
      status: vehicle.status || "AVAILABLE",
      description: vehicle.description || "",
      location: vehicle.location || "Unknown",
      color: vehicle.color || "Black",
      mileage: vehicle.mileage || 0,
    };
  }

  private getDefaultImage(vehicle: any): string {
    const carName = `${vehicle.brand}-${vehicle.model}`
      .toLowerCase()
      .replace(/\s+/g, "-");

    const imageMap: { [key: string]: string } = {
      "toyota-camry": "assets/images/camry.png",
      "bmw-m4": "assets/images/bmw4.png",
      "honda-civic": "assets/images/toyota.png",
      "tesla-model-3": "assets/images/bmw.png",
      "rolls-royce-phantom":
        "https://images.unsplash.com/photo-1563720223488-8f2f62a6e71a",
      "honda-vezel":
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
      "toyota-supra":
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb",
    };

    return (
      imageMap[carName] || "https://via.placeholder.com/400x250?text=Car+Image"
    );
  }

  public getMockVehicles(): Vehicle[] {
    return [
      {
        id: 1,
        brand: "Toyota",
        model: "Camry",
        year: 2024,
        category: "SEDAN",
        type: "SEDAN",
        dailyRate: 80,
        seats: 5,
        transmission: "AUTOMATIC",
        fuelType: "GASOLINE",
        imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341",
        status: "AVAILABLE",
        description: "A comfortable sedan with great fuel economy",
        location: "New York",
        color: "Blue",
        mileage: 10000,
      },
      {
        id: 2,
        brand: "BMW",
        model: "M4",
        year: 2023,
        category: "SPORTS",
        type: "SPORTS",
        dailyRate: 150,
        seats: 4,
        transmission: "AUTOMATIC",
        fuelType: "GASOLINE",
        imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e",
        status: "AVAILABLE",
        description: "High-performance sports car",
        location: "Los Angeles",
        color: "Black",
        mileage: 5000,
      },
      {
        id: 3,
        brand: "Honda",
        model: "Civic",
        year: 2022,
        category: "SEDAN",
        type: "SEDAN",
        dailyRate: 70,
        seats: 5,
        transmission: "AUTOMATIC",
        fuelType: "HYBRID",
        imageUrl: "https://images.unsplash.com/photo-1542282088-fe8426682b8f",
        status: "AVAILABLE",
        description: "Fuel-efficient hybrid sedan",
        location: "Chicago",
        color: "White",
        mileage: 15000,
      },
      {
        id: 4,
        brand: "Rolls-Royce",
        model: "Phantom",
        year: 2024,
        category: "LUXURY",
        type: "LUXURY",
        dailyRate: 500,
        seats: 5,
        transmission: "AUTOMATIC",
        fuelType: "GASOLINE",
        imageUrl:
          "https://images.unsplash.com/photo-1563720223488-8f2f62a6e71a",
        status: "AVAILABLE",
        description: "Ultimate luxury sedan",
        location: "Miami",
        color: "Silver",
        mileage: 2000,
      },
    ];
  }

  private getDefaultVehicle(): Vehicle {
    return {
      id: 0,
      brand: "Unknown",
      model: "Unknown",
      year: new Date().getFullYear(),
      category: "SEDAN",
      type: "SEDAN",
      dailyRate: 0,
      seats: 5,
      transmission: "AUTOMATIC",
      fuelType: "GASOLINE",
      imageUrl: "https://via.placeholder.com/400x250?text=Car+Not+Found",
      status: "UNAVAILABLE",
      description: "Vehicle not found",
      location: "Unknown",
      color: "Unknown",
      mileage: 0,
    };
  }
}
