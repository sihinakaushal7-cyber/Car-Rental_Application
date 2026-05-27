// File: src/app/services/auth.service.ts
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { Router } from "@angular/router";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "USER"; // Fixed role types
  token: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem("currentUser") || "null"),
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // File: src/app/services/auth.service.ts (Angular)
  login(credentials: { email: string; password: string }): Observable<User> {
    const isAdmin = credentials.email.includes("admin");

    // 1. Try to find the user in registered users
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const foundUser = registeredUsers.find((u: any) => u.email === credentials.email);

    // 2. Determine ID and Role
    const userId = foundUser ? Number(foundUser.id) : (isAdmin ? 1 : 2);
    const role = isAdmin ? "ADMIN" : (foundUser ? foundUser.role : "USER");

    const mockUser: User = {
      id: userId,
      email: credentials.email,
      firstName: foundUser ? foundUser.firstName : (isAdmin ? "Admin" : "User"),
      lastName: foundUser ? foundUser.lastName : "Test",
      role: role as "ADMIN" | "USER",
      token: "mock-jwt-token-" + Date.now(),
    };

    localStorage.setItem("currentUser", JSON.stringify(mockUser));
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("token", mockUser.token);
    localStorage.setItem("userId", mockUser.id.toString());

    console.log("✅ Logged in as:", mockUser.role, "with ID:", mockUser.id);

    this.currentUserSubject.next(mockUser);
    return of(mockUser);
  }

  register(userData: any): Observable<User> {
    const newId = Date.now();
    const mockUser: User = {
      id: newId,
      email: userData.email,
      firstName: userData.firstName || "User",
      lastName: userData.lastName || "Test",
      role: "USER",
      token: "mock-jwt-token-register-" + Date.now(),
    };

    // Save to registered users list for later login
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    registeredUsers.push({
      id: mockUser.id,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      role: mockUser.role
    });
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

    localStorage.setItem("currentUser", JSON.stringify(mockUser));
    localStorage.setItem("token", mockUser.token);
    this.currentUserSubject.next(mockUser);

    console.log("📝 Registered new user with unique ID:", mockUser.id);
    return of(mockUser);
  }

  logout(): void {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    this.currentUserSubject.next(null);
    this.router.navigate(["/login"]);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  isAdmin(): boolean {
    // Check current user from BehaviorSubject
    const currentUser = this.currentUserValue;
    if (currentUser) {
      return currentUser.role === "ADMIN";
    }

    // Fallback to localStorage
    const userJson = localStorage.getItem("currentUser");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        return user.role === "ADMIN";
      } catch {
        return false;
      }
    }

    return false;
  }

  getCurrentUser(): any {
    const userJson = localStorage.getItem("user");
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  isUser(): boolean {
    return this.currentUserValue?.role === "USER";
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  // In your auth.service.ts or login component
  initializeUserBookings(userId: number): void {
    console.log("📋 Initializing bookings for user:", userId);

    // Filter existing global bookings to see if this user already has some
    const allBookings = JSON.parse(localStorage.getItem("allBookings") || "[]");
    const userHasBookings = allBookings.some((b: any) => Number(b.userId) === Number(userId));

    if (!userHasBookings) {
      console.log("🎲 Generating initial welcome booking for user:", userId);

      const welcomeBooking = {
        id: Date.now(),
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
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        totalCost: 500.0,
        status: "CONFIRMED",
        pickupLocation: "Main Office",
        createdAt: new Date().toISOString(),
      };

      allBookings.push(welcomeBooking);
      localStorage.setItem("allBookings", JSON.stringify(allBookings));

      console.log("✅ Created private welcome booking for user");
    }
  }
}
