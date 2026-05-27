import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CarService } from "../../services/car.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-add-car",
  templateUrl: "./add-car.component.html",
  styleUrls: ["./add-car.component.css"],
})
export class AddCarComponent implements OnInit {
  car = {
    brand: "",
    model: "",
    year: 2024,
    licensePlate: "",
    category: "SEDAN",
    transmission: "AUTOMATIC",
    fuelType: "GASOLINE",
    seats: 5,
    dailyRate: 50.0, // This is JavaScript number
    status: "available",
    imageUrl: "",
    location: "",
    color: "White",
    mileage: 0,
    description: "",
  };

  debugAuthStatus(): void {
    console.log("=== AUTH DEBUG ===");
    console.log("Token:", localStorage.getItem("token"));
    console.log("currentUser:", localStorage.getItem("currentUser"));
    console.log("user:", localStorage.getItem("user"));
    console.log("userId:", localStorage.getItem("userId"));

    // Check if token exists
    const token = localStorage.getItem("token");
    console.log("Token exists:", !!token);
    console.log("Token length:", token ? token.length : 0);
    console.log("Token value:", token);

    // Parse and show user details
    const userJson = localStorage.getItem("currentUser");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        console.log("User role:", user.role);
        console.log("Is admin?", user.role === "ADMIN");
        console.log("User token in storage:", user.token);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }

    alert(
      `Auth Status:\nToken: ${token ? "Yes (" + token.substring(0, 20) + "...)" : "No"}\nRole: ${userJson ? JSON.parse(userJson).role : "None"}\nAdmin: ${userJson && JSON.parse(userJson).role === "ADMIN" ? "Yes" : "No"}`,
    );
  }

  constructor(
    private carService: CarService,
    private router: Router,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    console.log("AddCarComponent loaded!");
    this.debugAuthStatus();

    this.testBackendConnection();
  }

  testBackendConnection() {
    console.log("🔍 Testing backend connection...");

    this.http
      .get("http://localhost:8080/api/cars", {
        observe: "response",
      })
      .subscribe({
        next: (response) => {
          console.log("✅ Backend connection successful!");
          console.log("Status:", response.status);
        },
        error: (err) => {
          console.error("❌ Backend connection failed:", err);
          if (err.status === 0) {
            alert("⚠️ Cannot connect to backend on port 8080!");
          }
        },
      });
  }

  onSubmit() {
    console.log("=== FORM SUBMITTED ===");

    // Prepare payload for Java BigDecimal
    const payload = {
      brand: this.car.brand,
      model: this.car.model,
      year: Number(this.car.year),
      licensePlate: this.car.licensePlate,
      category: this.car.category,
      transmission: this.car.transmission,
      fuelType: this.car.fuelType,
      seats: Number(this.car.seats),
      dailyRate: Number(this.car.dailyRate), // Send as number for BigDecimal
      status: this.car.status || "available",
      imageUrl: this.car.imageUrl || "",
      location: this.car.location || "",
      color: this.car.color || "White",
      mileage: Number(this.car.mileage || 0),
      description: this.car.description || "",
    };

    console.log("Car data being sent:", JSON.stringify(payload, null, 2));

    this.carService.addCar(payload).subscribe({
      next: (response) => {
        console.log("✅ Car saved successfully:", response);
        alert("Car added successfully!");
        this.router.navigate(["/vehicles"]);
      },
      error: (err) => {
        console.error("❌ Full error object:", err);
        console.error("Error status:", err.status);
        console.error("Error message:", err.message);

        let alertMessage = "Error saving car:\n\n";

        if (err.status === 0) {
          alertMessage +=
            "Cannot connect to backend server.\nCheck if Spring Boot is running on port 8080.";
        } else if (err.error && typeof err.error === "object") {
          alertMessage += JSON.stringify(err.error, null, 2);
        } else {
          alertMessage += err.message || "Unknown error";
        }

        alert(alertMessage);
      },
    });
  }

  fillTestData() {
    console.log("Filling test data...");
    this.car = {
      brand: "Toyota",
      model: "Camry",
      year: 2024,
      licensePlate: "TEST" + Math.floor(Math.random() * 1000),
      category: "SEDAN",
      transmission: "AUTOMATIC",
      fuelType: "GASOLINE",
      seats: 5,
      dailyRate: 50.0,
      status: "available",
      imageUrl:
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400",
      location: "New York",
      color: "Blue",
      mileage: 10000,
      description: "A comfortable sedan with great fuel economy",
    };
    alert("Test data filled!");
  }
}
