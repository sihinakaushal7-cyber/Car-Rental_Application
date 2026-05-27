import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class CarService {
  updateCarStatus(carId: number, newStatus: string) {
    throw new Error("Method not implemented.");
  }
  // Update this URL if your Spring Boot port or context path is different
  private apiUrl = "http://localhost:8080/api/cars";

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  /**
   * POST: Add a new car to the database
   * This matches your @PostMapping in CarController.java
   */
  addCar(carData: any): Observable<any> {
    if (!this.authService.isAdmin()) {
      return throwError(() => new Error("Only admin users can add cars"));
    }

    const userId = localStorage.getItem("userId");
    const headers = new HttpHeaders().set("User-Id", userId || "1");

    console.log("Sending car data with headers:", { carData, headers });

    return this.http.post(this.apiUrl, carData, { headers }).pipe(
      catchError((error) => {
        console.warn("❌ Backend failed, saving to localStorage instead:", error);

        // Fallback: Save to localStorage for demo
        const allCars = JSON.parse(localStorage.getItem("allCars") || "[]");
        const newCar = {
          ...carData,
          id: Date.now(),
          status: carData.status || "available",
        };
        allCars.push(newCar);
        localStorage.setItem("allCars", JSON.stringify(allCars));

        return of(newCar);
      }),
    );
  }

  /**
   * GET: Fetch all cars from the database
   */
  getAllCars(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * GET: Fetch a single car by its ID
   */
  getCarById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
