// File: src/app/guards/admin.guard.ts
import { Injectable } from "@angular/core";
import { Router, CanActivate } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  // File: src/app/guards/admin.guard.ts
  canActivate(): boolean {
    // First check if logged in
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      this.router.navigate(["/login"]);
      return false;
    }

    // Then check if admin
    const userJson = localStorage.getItem("currentUser");
    if (!userJson) {
      alert("User data not found. Please login again.");
      this.router.navigate(["/login"]);
      return false;
    }

    try {
      const user = JSON.parse(userJson);
      if (user.role !== "ADMIN") {
        alert("Access denied. Admin only.");
        this.router.navigate(["/vehicles"]);
        return false;
      }
    } catch {
      alert("Error checking permissions. Please login again.");
      this.router.navigate(["/login"]);
      return false;
    }

    return true;
  }
}
