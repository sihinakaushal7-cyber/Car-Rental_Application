import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { RouterModule, Routes } from "@angular/router";

import { AppComponent } from "./app.component";
import { LoginComponent } from "./components/login/login.component";
import { RegisterComponent } from "./components/register/register.component";
import { VehicleBrowseComponent } from "./components/vehicle-browse/vehicle-browse.component";
import { BookingComponent } from "./components/booking/booking.component";
import { AdminDashboardComponent } from "./components/admin-dashboard/admin-dashboard.component";
import { AddCarComponent } from "./components/add-car/add-car.component";
import { BookingListComponent } from "./components/booking-list/booking-list.component"; // IMPORT THIS

import { AuthService } from "./services/auth.service";
import { VehicleService } from "./services/vehicle.service";
import { BookingService } from "./services/booking.service";
import { CarService } from "./services/car.service";
import { UserService } from "./services/user.service";
import { JwtInterceptor } from "./interceptors/jwt.interceptor";
import { AuthGuard } from "./guards/auth.guard";
import { AdminGuard } from "./guards/admin.guard";
import { BookingConfirmationComponent } from "./booking-confirmation/booking-confirmation.component";

const routes: Routes = [
  { path: "", redirectTo: "/login", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  {
    path: "booking-confirmation",
    component: BookingConfirmationComponent,
  },

  {
    path: "vehicles",
    component: VehicleBrowseComponent,
    canActivate: [AuthGuard], // REMOVE DUPLICATE, KEEP THIS ONE
  },
  {
    path: "add-car",
    component: AddCarComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: "admin/bookings",
    component: BookingListComponent,
    canActivate: [AuthGuard, AdminGuard], // Only ADMIN can access
  },
  {
    path: "booking/:id",
    component: BookingComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "bookings",
    component: BookingListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "admin",
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  { path: "**", redirectTo: "/login" },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    VehicleBrowseComponent,
    BookingComponent,

    AddCarComponent,
    BookingListComponent, // ADD THIS HERE
    BookingConfirmationComponent,
    AdminDashboardComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
  ],
  providers: [
    AuthService,
    VehicleService,
    BookingService,
    CarService,
    UserService,
    AuthGuard,
    AdminGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
