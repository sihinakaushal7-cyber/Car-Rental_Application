// File: src/app/app.component.ts
import { Component, OnInit } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { AuthService } from "./services/auth.service";
import { BookingService } from "./services/booking.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "Car Rental Service";
  isAuthenticated = false;
  isAdmin = false;
  currentUser: any = null;
  currentRoute: string = "";
  hideNavOnPages = ["/login", "/register"];

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  shouldShowNavigation(): boolean {
    return this.currentRoute !== "/login" && this.currentRoute !== "/register";
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
