// File: src/app/components/login/login.component.ts
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  email: string = "";
  password: string = "";
  isLoading: boolean = false;
  errorMessage: string = "";

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {}

  onSubmit(): void {
    // Reset error message
    this.errorMessage = "";

    // Basic validation
    if (!this.email || !this.password) {
      this.errorMessage = "Please enter both email and password";
      return;
    }

    this.isLoading = true;

    // CORRECTED: Pass as single object
    this.authService
      .login({
        email: this.email,
        password: this.password,
      })
      .subscribe({
        // File: src/app/components/login/login.component.ts
        // In the onSubmit method, after successful login:
        next: (user) => {
          this.isLoading = false;
          console.log("Login successful:", user);
          console.log("User role:", user.role);
          console.log("User token:", user.token);

          // Store token if not already stored
          if (user.token && !localStorage.getItem("token")) {
            localStorage.setItem("token", user.token);
          }

          // Store user in both places for compatibility
          if (!localStorage.getItem("currentUser")) {
            localStorage.setItem("currentUser", JSON.stringify(user));
          }
          if (!localStorage.getItem("user")) {
            localStorage.setItem("user", JSON.stringify(user));
          }

          // Redirect based on user role
          if (user.role === "ADMIN") {
            console.log("Redirecting to admin...");
            this.router.navigate(["/admin"]);
          } else {
            console.log("Redirecting to vehicles...");
            this.router.navigate(["/vehicles"]);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error("Login error:", error);
          this.errorMessage = error.message || "Invalid email or password";
        },
      });
  }

  // Helper method for demo login
  quickLogin(role: "admin" | "user"): void {
    if (role === "admin") {
      this.email = "admin@test.com";
      this.password = "admin123";
    } else {
      this.email = "user@test.com";
      this.password = "user123";
    }
    this.onSubmit();
  }
}
